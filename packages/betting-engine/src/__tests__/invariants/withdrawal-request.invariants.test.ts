/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    money,
    buildWalletFromLedger,
    ErrorCode,
    ErrorCategory,
} from "@predict-guru/platform-core";
import type { LedgerEntry } from "@predict-guru/platform-core";

import { requestWithdrawalEngine } from "../../engine/withdrawal/request-withdrawal.engine";
import { createLedgerEntry } from "@predict-guru/platform-core";

/* ======================================================
   WITHDRAWAL REQUEST INVARIANTS
====================================================== */

describe("Withdrawal request invariants", () => {

    /* --------------------------------------------------
       I-WITHDRAW-1: locks funds on request
    -------------------------------------------------- */

    test("[I-WITHDRAW] request locks real balance", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(500),
                createdAt: 1,
            })
        );

        const result = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w1",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        if (!result.ok) {
            throw new Error("withdrawal request should succeed");
        }

        ledger = ledger.concat(result.value);

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.realBalance).toBe(300);
        expect(wallet.lockedBalance).toBe(200);
    });

    /* --------------------------------------------------
       I-WITHDRAW-2: cannot withdraw more than balance
    -------------------------------------------------- */

    test("[I-WITHDRAW] cannot exceed available balance", () => {
        const ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(100),
                createdAt: 1,
            })
        );

        const result = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w2",
                userId: "u1",
                amount: 200,
                now: 2,
            },
        });

        expect(result.ok).toBe(false);

        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.INSUFFICIENT_BALANCE);
            expect(result.error.category).toBe(ErrorCategory.MONEY);
        }
    });

    /* --------------------------------------------------
       I-WITHDRAW-3: invalid amounts are rejected
    -------------------------------------------------- */

    test("[I-WITHDRAW] cannot request zero or negative amount", () => {
        const ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(100),
                createdAt: 1,
            })
        );

        const result = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w3",
                userId: "u1",
                amount: 0,
                now: 2,
            },
        });

        expect(result.ok).toBe(false);

        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.INVALID_INPUT);
            expect(result.error.category).toBe(ErrorCategory.VALIDATION);
        }
    });

    /* --------------------------------------------------
       I-WITHDRAW-4: request is idempotent
    -------------------------------------------------- */

    test("[I-WITHDRAW] same withdrawalId cannot lock twice", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(300),
                createdAt: 1,
            })
        );

        const first = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w4",
                userId: "u1",
                amount: 100,
                now: 2,
            },
        });

        if (!first.ok) {
            throw new Error("first request should succeed");
        }

        ledger = ledger.concat(first.value);

        const retry = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w4",
                userId: "u1",
                amount: 100,
                now: 3,
            },
        });

        expect(retry.ok).toBe(false);

        if (!retry.ok) {
            expect(retry.error.code).toBe(ErrorCode.ENTITY_ALREADY_PROCESSED);
            expect(retry.error.category).toBe(ErrorCategory.STATE);
        }

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.realBalance).toBe(200);
        expect(wallet.lockedBalance).toBe(100);
    });

    /* --------------------------------------------------
       I-WITHDRAW-5: bonus is never touched
    -------------------------------------------------- */

    test("[I-WITHDRAW] withdrawal never consumes bonus", () => {
        let ledger: LedgerEntry[] = [];

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "DEPOSIT",
                realDelta: money(100),
                createdAt: 1,
            })
        );

        ledger.push(
            createLedgerEntry({
                userId: "u1",
                type: "BONUS_GRANTED",
                bonusDelta: money(500),
                createdAt: 1,
            })
        );

        const result = requestWithdrawalEngine({
            ledger,
            intent: {
                withdrawalId: "w5",
                userId: "u1",
                amount: 80,
                now: 2,
            },
        });

        if (!result.ok) {
            throw new Error("withdrawal should succeed");
        }

        ledger = ledger.concat(result.value);

        const wallet = buildWalletFromLedger("u1", ledger);

        expect(wallet.realBalance).toBe(20);
        expect(wallet.lockedBalance).toBe(80);
        expect(wallet.bonusBalance).toBe(500);
    });

});
