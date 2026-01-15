import { Money, ErrorCode } from "@predict-guru/platform-core";
import { adaptPlaceBetFlow } from "../../engine/adaptPlaceBetFlow";

/* ======================================================
   TEST HELPERS
====================================================== */

function money(n: number) {
    return n as Money;
}

function ts(ms: number) {
    return { toMillis: () => ms };
}

/* ======================================================
   INVARIANTS — adaptPlaceBetFlow
====================================================== */

describe("adaptPlaceBetFlow invariants", () => {

    /* --------------------------------------------------
       MARKET STATE GUARDS
    -------------------------------------------------- */

    test("fails if market status is LOCKED", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "LOCKED",
                lockAt: ts(1000),
                mode: "POOL",
            },
            stake: money(100),
            maxBonusUsage: money(0),
            now: 500,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.MARKET_LOCKED);
        }
    });

    test("fails if lockAt time has passed (even if status OPEN)", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "OPEN",
                lockAt: ts(500),
                mode: "POOL",
            },
            stake: money(100),
            maxBonusUsage: money(0),
            now: 500,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.MARKET_LOCKED);
        }
    });

    /* --------------------------------------------------
       ENGINE ERROR PROPAGATION
    -------------------------------------------------- */

    test("bubbles engine validation errors (invalid stake)", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "OPEN",
                lockAt: ts(1000),
                mode: "POOL",
            },
            stake: money(0), // ❌ invalid
            maxBonusUsage: money(0),
            now: 100,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.INVALID_INPUT);
        }
    });

    /* --------------------------------------------------
       SUCCESS PATH — POOL
    -------------------------------------------------- */

    test("produces one LOCK ledger entry for valid POOL bet", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "OPEN",
                lockAt: ts(1000),
                mode: "POOL",
            },
            stake: money(100),
            maxBonusUsage: money(30),
            now: 100,
        });

        expect(result.ok).toBe(true);
        if (!result.ok) throw new Error("expected success");

        const ledger = result.value;
        expect(ledger).toHaveLength(1);

        const entry = ledger[0];
        expect(entry.type).toBe("LOCK");
        expect(entry.userId).toBe("u1");
        expect(entry.referenceId).toBe("b1");
        expect(entry.marketId).toBe("m1");
        expect(entry.lockedDelta).toBe(100);
    });

    /* --------------------------------------------------
       P2P INVARIANTS
    -------------------------------------------------- */

    test("fails if P2P stake does not match market stake", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "OPEN",
                lockAt: ts(1000),
                mode: "P2P",
                stakeAmount: money(50),
            },
            stake: money(100), // ❌ mismatch
            maxBonusUsage: money(0),
            now: 100,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.INVALID_INPUT);
        }
    });

    /* --------------------------------------------------
       TIME CONSISTENCY
    -------------------------------------------------- */

    test("ledger entry uses adapter now, not intent createdAt", () => {
        const result = adaptPlaceBetFlow({
            betId: "b1",
            userId: "u1",
            market: {
                id: "m1",
                status: "OPEN",
                lockAt: ts(1000),
                mode: "POOL",
            },
            stake: money(100),
            maxBonusUsage: money(0),
            now: 777,
        });

        if (!result.ok) throw new Error("expected success");

        expect(result.value[0].createdAt).toBe(777);
    });

});
