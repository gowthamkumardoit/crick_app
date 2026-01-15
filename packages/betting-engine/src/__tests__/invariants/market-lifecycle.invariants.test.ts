import {
    transitionMarketStatus,
    canPlaceBet,
    canSettleMarket,
} from "../../market/market-lifecycle";

describe("Market lifecycle invariants", () => {

    test("OPEN → LOCKED is allowed", () => {
        const r = transitionMarketStatus({
            marketId: "m1",
            from: "OPEN",
            to: "LOCKED",
        });

        expect(r.ok).toBe(true);
    });

    test("OPEN → SETTLED is forbidden", () => {
        const r = transitionMarketStatus({
            marketId: "m1",
            from: "OPEN",
            to: "SETTLED",
        });

        expect(r.ok).toBe(false);
    });

    test("bets allowed only when OPEN", () => {
        expect(canPlaceBet("OPEN")).toBe(true);
        expect(canPlaceBet("LOCKED")).toBe(false);
        expect(canPlaceBet("SETTLED")).toBe(false);
    });

    test("settlement allowed only when LOCKED", () => {
        expect(canSettleMarket("LOCKED")).toBe(true);
        expect(canSettleMarket("OPEN")).toBe(false);
        expect(canSettleMarket("SETTLED")).toBe(false);
    });

});
