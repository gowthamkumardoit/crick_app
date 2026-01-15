import { isErr, money } from "@predict-guru/platform-core";
import { placeBetEngine } from "../../engine/place-bet-engine";

describe("Place Bet invariants", () => {

    const poolMarket = {
        mode: "POOL" as const,
    };

    const p2pMarket = {
        mode: "P2P" as const,
        stakeAmount: money(100),
    };

    test("bet with zero stake is rejected", () => {
        const result = placeBetEngine({
            betId: "b1",
            userId: "u1",
            market: poolMarket,
            stake: money(0),
            maxBonusUsage: money(0),
            now: 1,
        });

        expect(isErr(result)).toBe(true);
    });

    test("bet with negative stake is rejected", () => {
        const result = placeBetEngine({
            betId: "b2",
            userId: "u1",
            market: poolMarket,
            stake: money(-10),
            maxBonusUsage: money(0),
            now: 1,
        });

        expect(isErr(result)).toBe(true);
    });

    test("valid POOL bet produces a PlaceBetIntent", () => {
        const result = placeBetEngine({
            betId: "b-valid",
            userId: "u1",
            market: poolMarket,
            stake: money(100),
            maxBonusUsage: money(20),
            now: 1,
        });

        if (isErr(result)) {
            throw new Error("valid bet should succeed");
        }

        expect(result.value.betId).toBe("b-valid");
        expect(result.value.userId).toBe("u1");
        expect(result.value.stake).toBe(100);
        expect(result.value.maxBonusUsage).toBe(20);
        expect(result.value.referenceId).toBe("b-valid");
    });

    test("bonus usage cannot exceed stake", () => {
        const result = placeBetEngine({
            betId: "b-bonus-invalid",
            userId: "u1",
            market: poolMarket,
            stake: money(50),
            maxBonusUsage: money(100), // ❌ exceeds stake
            now: 1,
        });

        expect(isErr(result)).toBe(true);
    });

    test("P2P bet must match market stake", () => {
        const result = placeBetEngine({
            betId: "b-p2p-invalid",
            userId: "u1",
            market: p2pMarket,
            stake: money(50), // ❌ wrong stake
            maxBonusUsage: money(0),
            now: 1,
        });

        expect(isErr(result)).toBe(true);
    });

    test("P2P bet with correct stake is allowed", () => {
        const result = placeBetEngine({
            betId: "b-p2p-valid",
            userId: "u1",
            market: p2pMarket,
            stake: money(100), // ✅ exact match
            maxBonusUsage: money(0),
            now: 1,
        });

        expect(isErr(result)).toBe(false);
    });

});
