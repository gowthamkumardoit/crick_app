import { money, buildWalletFromLedger } from "@predict-guru/platform-core";
import { adaptLockIntentToLedger } from "../../engine/core-adapter.engine";

describe("Core adapter invariants", () => {

    test("lock intent produces correct ledger deltas", () => {
        const ledger = adaptLockIntentToLedger({
            userId: "u1",
            referenceId: "b1",
            marketId: "m1",
            realAmount: money(70),
            bonusAmount: money(30),
            now: 1
        });

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.lockedBalance).toBe(100);
    });

});
