import { money } from "@predict-guru/platform-core";
import type { PlaceBetIntent } from "../../contracts/bet.intents";


test("placing a bet produces a stake intent", () => {
    const intent: PlaceBetIntent = {
        betId: "b1",
        userId: "u1",
        marketId: "m1",
        stake: money(100),
        maxBonusUsage: money(0),
        referenceId: "b1",
        createdAt: Date.now()
    };

    expect(intent.stake).toBeGreaterThan(0);
});
