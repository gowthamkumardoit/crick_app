import { money } from "../../wallet/money";
import { buildWalletFromLedger } from "../../wallet/wallet.service";
import {
    requestWithdrawal,
    approveWithdrawal,
    rejectWithdrawal
} from "../../withdrawal/withdrawal.orchestrator";
import { LedgerEntry } from "../../ledger/types";
import { ErrorCode } from "../../errors/types";
import { isErr } from "../../errors/result";

/* ======================================================
   WITHDRAWAL INVARIANTS
====================================================== */

describe("Withdrawal invariants", () => {

    test("withdrawal locks funds immediately", () => {
        const ledger: LedgerEntry[] = [];

        const result = requestWithdrawal({
            userId: "u1",
            userStatus: "ACTIVE",
            wallet: {
                userId: "u1",
                realBalance: money(100),
                bonusBalance: money(0),
                lockedBalance: money(0)
            },
            ledger,
            amount: money(40),
            referenceId: "w1",
            now: 1
        });

        if (isErr(result)) {
            throw new Error("withdrawal should succeed");
        }

        const walletAfter = buildWalletFromLedger("u1", result.value);

        expect(walletAfter.lockedBalance).toBe(40);
    });

    test("frozen user cannot request withdrawal", () => {
        const result = requestWithdrawal({
            userId: "u1",
            userStatus: "FROZEN",
            wallet: {
                userId: "u1",
                realBalance: money(100),
                bonusBalance: money(0),
                lockedBalance: money(0)
            },
            ledger: [],
            amount: money(20),
            referenceId: "w2",
            now: 1
        });

        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
            expect(result.error.code).toBe(ErrorCode.ACCOUNT_FROZEN);
        }
    });

    test("only FINANCE can approve withdrawal", () => {
        const result = approveWithdrawal({
            actorRole: "ADMIN" as "FINANCE", // intentional misuse
            userId: "u1",
            ledger: [],
            amount: money(20),
            referenceId: "w3",
            now: 2
        });

        expect(isErr(result)).toBe(true);

        if (isErr(result)) {
            expect(result.error.code).toBe(ErrorCode.UNAUTHORIZED);
        }
    });

    test("withdrawal approval deducts real balance and unlocks funds", () => {
        const initialLedger: LedgerEntry[] = [
            {
                entryId: "l1",
                userId: "u1",
                type: "LOCK",
                realDelta: money(0),
                bonusDelta: money(0),
                lockedDelta: money(50),
                referenceId: "w4",
                createdAt: 1
            }
        ];

        const result = approveWithdrawal({
            actorRole: "FINANCE",
            userId: "u1",
            ledger: initialLedger,
            amount: money(50),
            referenceId: "w4",
            now: 2
        });

        if (isErr(result)) {
            throw new Error("approval should succeed");
        }

        const wallet = buildWalletFromLedger(
            "u1",
            [...initialLedger, ...result.value]
        );

        expect(wallet.realBalance).toBe(-50);
        expect(wallet.lockedBalance).toBe(0);
    });

    test("withdrawal rejection unlocks funds only", () => {
        const initialLedger: LedgerEntry[] = [
            {
                entryId: "l1",
                userId: "u1",
                type: "LOCK",
                realDelta: money(0),
                bonusDelta: money(0),
                lockedDelta: money(30),
                referenceId: "w5",
                createdAt: 1
            }
        ];

        const result = rejectWithdrawal({
            actorRole: "FINANCE",
            userId: "u1",
            ledger: initialLedger,
            amount: money(30),
            referenceId: "w5",
            now: 2
        });

        if (isErr(result)) {
            throw new Error("rejection should succeed");
        }

        const wallet = buildWalletFromLedger(
            "u1",
            [...initialLedger, ...result.value]
        );

        expect(wallet.lockedBalance).toBe(0);
        expect(wallet.realBalance).toBe(0);
    });

    test("withdrawal approval is idempotent", () => {
        const ledger: LedgerEntry[] = [
            {
                entryId: "l1",
                userId: "u1",
                type: "WITHDRAW",
                realDelta: money(-20),
                bonusDelta: money(0),
                lockedDelta: money(0),
                referenceId: "w6",
                createdAt: 2
            }
        ];

        const result = approveWithdrawal({
            actorRole: "FINANCE",
            userId: "u1",
            ledger,
            amount: money(20),
            referenceId: "w6",
            now: 3
        });

        expect(isErr(result)).toBe(true);
    });

});
