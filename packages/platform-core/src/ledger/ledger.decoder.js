"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeLedgerEntry = decodeLedgerEntry;
const money_1 = require("../wallet/money");
/**
 * Converts Firestore data → LedgerEntry
 * Throws if shape is invalid (safe by default)
 */
function decodeLedgerEntry(data) {
    return {
        entryId: String(data.entryId),
        userId: String(data.userId),
        type: data.type,
        realDelta: (0, money_1.money)(data.realDelta),
        bonusDelta: (0, money_1.money)(data.bonusDelta),
        lockedDelta: (0, money_1.money)(data.lockedDelta),
        referenceId: data.referenceId ?? undefined,
        marketId: data.marketId ?? undefined,
        createdAt: Number(data.createdAt),
    };
}
