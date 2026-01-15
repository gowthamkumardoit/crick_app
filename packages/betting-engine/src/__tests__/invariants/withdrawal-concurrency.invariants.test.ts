/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    buildWalletFromLedger,
    ErrorCode,
    ErrorCategory,
    createLedgerEntry,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { requestWithdrawalEngine } from "../../engine/withdrawal/request-withdrawal.engine";
import { resolveWithdrawalEngine } from "../../engine/withdrawal/resolve-withdrawal.engine";

/* ======================================================
   WITHDRAWAL CONCURRENCY INVARIANTS
====================================================== */

describe("Withdrawal concurrency invariants", () => {

    /* --------------------------------------------------
       I-WITHDRAW-CONC-1: approve retry after commit is rejected
    -------------------------------------------------- */

    test("[I-WITHDRAW] approve retry after commit is rejected", () => {
        let ledger: LedgerEntry[] = [];

        /* -------- Arrange -------- */

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-1",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        /* -------- First approve (wins race) -------- */

        const firstApprove = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-1",
                userId: "u1",
                action: "APPROVE",
                now: 3,
            },
        });

        if (!firstApprove.ok) throw new Error("approve should succeed");
        ledger = ledger.concat(firstApprove.value);

        /* -------- Retry approve -------- */

        const retryApprove = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-1",
                userId: "u1",
                action: "APPROVE",
                now: 4,
            },
        });

        expect(retryApprove.ok).toBe(false);
        if (!retryApprove.ok) {
            expect(retryApprove.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retryApprove.error.category).toBe(ErrorCategory.STATE);
        }

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(100);
        expect(wallet.lockedBalance).toBe(0);
    });

    /* --------------------------------------------------
       I-WITHDRAW-CONC-2: reject retry after commit is rejected
    -------------------------------------------------- */

    test("[I-WITHDRAW] reject retry after commit is rejected", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-2",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const firstReject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-2",
                userId: "u1",
                action: "REJECT",
                now: 3,
            },
        });

        if (!firstReject.ok) throw new Error("reject should succeed");
        ledger = ledger.concat(firstReject.value);

        const retryReject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-2",
                userId: "u1",
                action: "REJECT",
                now: 4,
            },
        });

        expect(retryReject.ok).toBe(false);
        if (!retryReject.ok) {
            expect(retryReject.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retryReject.error.category).toBe(ErrorCategory.STATE);
        }

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(300);
        expect(wallet.lockedBalance).toBe(0);
    });

    /* --------------------------------------------------
       I-WITHDRAW-CONC-3: approve after reject is rejected
    -------------------------------------------------- */

    test("[I-WITHDRAW] approve after reject is rejected", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-3",
                userId: "u1",
                amount: 150,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const reject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-3",
                userId: "u1",
                action: "REJECT",
                now: 3,
            },
        });

        if (!reject.ok) throw new Error("reject should succeed");
        ledger = ledger.concat(reject.value);

        const approveAfterReject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-3",
                userId: "u1",
                action: "APPROVE",
                now: 4,
            },
        });

        expect(approveAfterReject.ok).toBe(false);
        if (!approveAfterReject.ok) {
            expect(approveAfterReject.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(approveAfterReject.error.category).toBe(ErrorCategory.STATE);
        }

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(300);
        expect(wallet.lockedBalance).toBe(0);
    });

    /* --------------------------------------------------
       I-WITHDRAW-CONC-4: reject after approve is rejected
    -------------------------------------------------- */

    test("[I-WITHDRAW] reject after approve is rejected", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-4",
                userId: "u1",
                amount: 150,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const approve = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-4",
                userId: "u1",
                action: "APPROVE",
                now: 3,
            },
        });

        if (!approve.ok) throw new Error("approve should succeed");
        ledger = ledger.concat(approve.value);

        const rejectAfterApprove = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w-conc-4",
                userId: "u1",
                action: "REJECT",
                now: 4,
            },
        });

        expect(rejectAfterApprove.ok).toBe(false);
        if (!rejectAfterApprove.ok) {
            expect(rejectAfterApprove.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(rejectAfterApprove.error.category).toBe(ErrorCategory.STATE);
        }

        const wallet = buildWalletFromLedger("u1", ledger);
        expect(wallet.realBalance).toBe(150);
        expect(wallet.lockedBalance).toBe(0);
    });

});
