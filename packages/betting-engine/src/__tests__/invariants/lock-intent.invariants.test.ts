import { money } from "@predict-guru/platform-core";
import { createLockIntent } from "../../engine/lock-intent.engine";

describe("Lock intent invariants", () => {

    test("lock intent matches stake split", () => {
        const intent = createLockIntent({
            userId: "u1",
            betId: "b1",
            stake: money(100),
            maxBonusUsage: money(30),
            now: 1
        });

        expect(intent.realAmount).toBe(70);
        expect(intent.bonusAmount).toBe(30);
        expect(intent.referenceId).toBe("b1");
    });

});
