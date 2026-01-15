import { money } from "@predict-guru/platform-core";
import { splitStake } from "../../engine/stake-split.engine";

describe("Stake split invariants", () => {

    test("stake is split into real + bonus correctly", () => {
        const result = splitStake({
            stake: money(100),
            maxBonusUsage: money(30)
        });

        expect(result.bonusStake).toBe(30);
        expect(result.realStake).toBe(70);
    });

    test("bonus stake never exceeds stake", () => {
        const result = splitStake({
            stake: money(50),
            maxBonusUsage: money(100) // exceeds stake
        });

        expect(result.bonusStake).toBe(50);
        expect(result.realStake).toBe(0);
    });

    test("no bonus usage results in full real stake", () => {
        const result = splitStake({
            stake: money(40),
            maxBonusUsage: money(0)
        });

        expect(result.bonusStake).toBe(0);
        expect(result.realStake).toBe(40);
    });

});
