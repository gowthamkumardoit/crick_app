import { ensureAccountActive } from "../../identity/account-status.guard";
import { ErrorCode } from "../../errors/types";
import { isErr } from "../../errors/result";

describe("Identity invariants", () => {

    test("ACTIVE account is allowed", () => {
        const result = ensureAccountActive({
            userId: "u1",
            status: "ACTIVE"
        });

        expect(result.ok).toBe(true);
    });

    test("FROZEN account is blocked", () => {
        const result = ensureAccountActive({
            userId: "u1",
            status: "FROZEN"
        });

        expect(result.ok).toBe(false);

        if (isErr(result)) {
            expect(result.error.code).toBe(ErrorCode.ACCOUNT_FROZEN);
        }
    });

    test("SUSPENDED account is blocked", () => {
        const result = ensureAccountActive({
            userId: "u1",
            status: "SUSPENDED"
        });

        expect(result.ok).toBe(false);

        if (isErr(result)) {
            expect(result.error.code).toBe(ErrorCode.ACCOUNT_FROZEN);
        }
    });

});
