import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "../utils/admin";

import {
  buildWalletFromLedger,
  createLedgerEntry,
  money,
  ZERO_MONEY,
} from "@predict-guru/platform-core";

import { joinP2PEngine } from "@predict-guru/betting-engine";

/* ======================================================
   JOIN P2P CONTEST (ENGINE DRIVEN) — CANONICAL SCHEMA
====================================================== */

export const joinPeersContestFn = onCall(
  {
    region: "asia-south1",
    timeoutSeconds: 30,
    concurrency: 1, // 🔒 matching + money
  },
  async (req) => {
    /* ================= AUTH ================= */
    if (!req.auth?.uid) {
      throw new HttpsError("unauthenticated", "Login required");
    }

    const userId = req.auth.uid;
    const { matchId, stakeId, side, bonusUsage } = req.data as {
      matchId: string;
      stakeId: string;
      side: "A" | "B";
      bonusUsage?: number;
    };

    if (!matchId || !stakeId || !["A", "B"].includes(side)) {
      throw new HttpsError("invalid-argument", "Invalid request");
    }

    const joinId = db.collection("_").doc().id;
    const opponentSide: "A" | "B" = side === "A" ? "B" : "A";

    const stakeRef = db.doc(`config/stakes/items/${stakeId}`);
    const ledgerRef = db.doc(`ledger/P2P_JOIN_${joinId}`);

    let result!: { type: "OPEN" | "MATCHED"; contestId: string };

    /* ================= TRANSACTION ================= */
    await db.runTransaction(async (tx) => {
      /* ============ READS (ALL FIRST) ============ */

      const stakeSnap = await tx.get(stakeRef);
      if (!stakeSnap.exists) {
        throw new HttpsError("not-found", "Stake not found");
      }
      const stake = stakeSnap.data()!;

      const ledgerSnap = await tx.get(
        db
          .collection("ledger")
          .where("userId", "==", userId)
          .orderBy("createdAt", "asc")
          .limit(2000)
      );

      const opponentSnap = await tx.get(
        db
          .collection("p2pOpenOrders")
          .where("matchId", "==", matchId)
          .where("stakeId", "==", stakeId)
          .where("side", "==", opponentSide)
          .where("userId", "!=", userId)
          .orderBy("userId")
          .orderBy("createdAt", "asc")
          .limit(1)
      );

      /* ============ DERIVATIONS ============ */

      const ledgerEntries = ledgerSnap.docs.map((d) =>
        createLedgerEntry({ ...d.data(), entryId: d.id } as any)
      );

      const wallet = buildWalletFromLedger(userId, ledgerEntries);

      const intent = joinP2PEngine({
        joinId,
        userId,
        matchId,
        stakeId,
        side,
        stakeConfig: {
          amount: money(stake.amount),
          enabled: stake.enabled,
          maxBonusPercentage: stake.maxBonusPercentage,
        },
        wallet: {
          realBalance: wallet.realBalance,
          bonusBalance: wallet.bonusBalance,
        },
        requestedBonusUsage: money(bonusUsage ?? 0),
        now: Date.now(),
      });

      if (!intent.ok) {
        throw new HttpsError(
          "failed-precondition",
          intent.error.messageKey
        );
      }

      /* ============ WRITES (AFTER READS) ============ */

      // LOCK funds
      tx.create(
        ledgerRef,
        createLedgerEntry({
          userId,
          type: "LOCK",
          realDelta: intent.value.lock.real
            ? money(-Number(intent.value.lock.real))
            : ZERO_MONEY,
          bonusDelta: intent.value.lock.bonus
            ? money(-Number(intent.value.lock.bonus))
            : ZERO_MONEY,
          lockedDelta: intent.value.stake,
          referenceId: `P2P_JOIN:${joinId}`,
          marketId: matchId,
          createdAt: Date.now(),
        })
      );

      // MATCH FOUND
      if (!opponentSnap.empty) {
        const opponent = opponentSnap.docs[0].data();
        const contestRef = db.collection("p2pContests").doc();

        tx.set(contestRef, {
          matchId,
          stakeId,
          stakeAmount: stake.amount,

          // ✅ CANONICAL SHAPE — KEEP THIS ALWAYS
          teams: {
            A: {
              users:
                side === "A"
                  ? { [userId]: true }
                  : { [opponent.userId]: true },
            },
            B: {
              users:
                side === "B"
                  ? { [userId]: true }
                  : { [opponent.userId]: true },
            },
          },
          memberIds: [userId, opponent.userId],
          status: "MATCHED",
          createdAt: Date.now(),
          matchedAt: Date.now(),
        });

        tx.delete(opponentSnap.docs[0].ref);

        result = { type: "MATCHED", contestId: contestRef.id };
        return;
      }

      // NO MATCH → OPEN ORDER
      tx.set(db.collection("p2pOpenOrders").doc(joinId), {
        matchId,
        stakeId,
        stakeAmount: stake.amount,
        side,
        userId,
        createdAt: Date.now(),
      });

      result = { type: "OPEN", contestId: joinId };
    });

    return { success: true, result };
  }
);
