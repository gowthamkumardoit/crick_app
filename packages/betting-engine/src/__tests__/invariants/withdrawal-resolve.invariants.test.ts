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
   WITHDRAWAL RESOLUTION INVARIANTS
====================================================== */

describe("Withdrawal resolve invariants", () => {

    /* --------------------------------------------------
       I-WITHDRAW-RESOLVE-1: approve completes withdrawal
    -------------------------------------------------- */

    test("[I-WITHDRAW] approve moves locked funds out", () => {
        let ledger: LedgerEntry[] = [];

        // Deposit
        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        // Request withdrawal
        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w1",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        // Approve
        const approve = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w1",
                userId: "u1",
                action: "APPROVE",
                now: 3,
            },
        });

        if (!approve.ok) throw new Error("approve should succeed");
        ledger = ledger.concat(approve.value);

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.realBalance).toBe(100);
        expect(wallet.lockedBalance).toBe(0);
    });

    /* --------------------------------------------------
       I-WITHDRAW-RESOLVE-2: reject unlocks funds
    -------------------------------------------------- */

    test("[I-WITHDRAW] reject unlocks locked funds", () => {
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
                withdrawalId: "w2",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const reject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w2",
                userId: "u1",
                action: "REJECT",
                now: 3,
            },
        });

        if (!reject.ok) throw new Error("reject should succeed");
        ledger = ledger.concat(reject.value);

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.realBalance).toBe(300);
        expect(wallet.lockedBalance).toBe(0);
    });

    /* --------------------------------------------------
       I-WITHDRAW-RESOLVE-3: cannot approve twice
    -------------------------------------------------- */

    test("[I-WITHDRAW] cannot approve withdrawal twice", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(200),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w3",
                userId: "u1",
                amount: 100,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const approve = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w3",
                userId: "u1",
                action: "APPROVE",
                now: 3,
            },
        });

        if (!approve.ok) throw new Error("approve should succeed");
        ledger = ledger.concat(approve.value);

        const retry = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w3",
                userId: "u1",
                action: "APPROVE",
                now: 4,
            },
        });

        expect(retry.ok).toBe(false);
        if (!retry.ok) {
            expect(retry.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retry.error.category).toBe(ErrorCategory.STATE);
        }
    });

    /* --------------------------------------------------
       I-WITHDRAW-RESOLVE-4: cannot reject twice
    -------------------------------------------------- */

    test("[I-WITHDRAW] cannot reject withdrawal twice", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(200),
                createdAt: 1,
            })
        );

        const request = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w4",
                userId: "u1",
                amount: 100,
                now: 2,
            },
        });

        if (!request.ok) throw new Error("request should succeed");
        ledger = ledger.concat(request.value);

        const reject = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w4",
                userId: "u1",
                action: "REJECT",
                now: 3,
            },
        });

        if (!reject.ok) throw new Error("reject should succeed");
        ledger = ledger.concat(reject.value);

        const retry = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w4",
                userId: "u1",
                action: "REJECT",
                now: 4,
            },
        });

        expect(retry.ok).toBe(false);
        if (!retry.ok) {
            expect(retry.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retry.error.category).toBe(ErrorCategory.STATE);
        }
    });

    /* --------------------------------------------------
       I-WITHDRAW-RESOLVE-5: cannot resolve without request
    -------------------------------------------------- */

    test("[I-WITHDRAW] cannot resolve non-existent withdrawal", () => {
        const ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(100),
                createdAt: 1,
            })
        );

        const result = resolveWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w404",
                userId: "u1",
                action: "APPROVE",
                now: 2,
            },
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.INVALID_INPUT);
            expect(result.error.category).toBe(ErrorCategory.VALIDATION);
        }
    });

});
