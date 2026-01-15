"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLedgerEntry = createLedgerEntry;
const money_1 = require("../wallet/money");
/**
 * Creates a ledger entry.
 * Ledger is APPEND ONLY.
 * Compatible with exactOptionalPropertyTypes.
 */
function createLedgerEntry(params) {
    return {
        entryId: crypto.randomUUID(),
        userId: params.userId,
        type: params.type,
        realDelta: params.realDelta ?? money_1.ZERO_MONEY,
        bonusDelta: params.bonusDelta ?? money_1.ZERO_MONEY,
        lockedDelta: params.lockedDelta ?? money_1.ZERO_MONEY,
        createdAt: params.createdAt,
        ...(params.referenceId !== undefined
            ? { referenceId: params.referenceId }
            : {}),
        ...(params.marketId !== undefined
            ? { marketId: params.marketId }
            : {}),
    };
}
