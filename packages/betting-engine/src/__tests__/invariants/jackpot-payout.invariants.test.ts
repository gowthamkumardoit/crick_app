import {
    money,
    buildWalletFromLedger,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import {
    settleJackpotEngine,
    JACKPOT_USER_ID,
} from "../../engine/jackpot.engine";

/* ======================================================
   HELPERS
====================================================== */

function wallet(userId: string, ledger: LedgerEntry[]) {
    return buildWalletFromLedger(userId, ledger);
}

function seedJackpot(amount: number): LedgerEntry[] {
    return [
        {
            entryId: "seed-jackpot",
            userId: JACKPOT_USER_ID,
            type: "DEPOSIT",
            realDelta: money(amount),
            bonusDelta: money(0),
            lockedDelta: money(0),
            createdAt: 0,
        },
    ];
}

/* ======================================================
   JACKPOT PAYOUT INVARIANTS
====================================================== */

describe("Jackpot payout invariants", () => {

    test("[J-1] jackpot payout conserves money", () => {
        const ledger: LedgerEntry[] = seedJackpot(100);

        const result = settleJackpotEngine({
            ledger,
            intent: {
                eventId: "match-1",
                winners: ["u1", "u2"],
                split: "EQUAL",
                now: 1,
            },
        });

        if (!result.ok) throw new Error("payout failed");

        const full = [...ledger, ...result.value];

        const paid =
            wallet("u1", full).realBalance +
            wallet("u2", full).realBalance;

        expect(paid).toBe(100);
    });

    test("[J-2] jackpot balance decreases exactly by payout", () => {
        const ledger: LedgerEntry[] = seedJackpot(90);

        const result = settleJackpotEngine({
            ledger,
            intent: {
                eventId: "match-2",
                winners: ["u1", "u2", "u3"],
                split: "EQUAL",
                now: 1,
            },
        });

        if (!result.ok) throw new Error("payout failed");

        const full = [...ledger, ...result.value];

        expect(wallet(JACKPOT_USER_ID, full).realBalance).toBe(0);
    });

    test("[J-3] cannot pay jackpot when empty", () => {
        const ledger: LedgerEntry[] = [];

        const result = settleJackpotEngine({
            ledger,
            intent: {
                eventId: "match-3",
                winners: ["u1"],
                split: "EQUAL",
                now: 1,
            },
        });

        expect(result.ok).toBe(false);
    });

    test("[J-4] jackpot payout is idempotent per event", () => {
        let ledger: LedgerEntry[] = seedJackpot(50);

        const first = settleJackpotEngine({
            ledger,
            intent: {
                eventId: "match-4",
                winners: ["u1"],
                split: "EQUAL",
                now: 1,
            },
        });

        if (!first.ok) throw new Error("first payout failed");
        ledger = ledger.concat(first.value);

        const second = settleJackpotEngine({
            ledger,
            intent: {
                eventId: "match-4",
                winners: ["u1"],
                split: "EQUAL",
                now: 2,
            },
        });

        expect(second.ok).toBe(false);
    });

});
