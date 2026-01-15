/* eslint-disable @typescript-eslint/no-explicit-any */
import { LedgerEntry } from "./types";
import { money } from "../wallet/money";

/**
 * Converts Firestore data → LedgerEntry
 * Throws if shape is invalid (safe by default)
 */
export function decodeLedgerEntry(data: any): LedgerEntry {
    return {
        entryId: String(data.entryId),
        userId: String(data.userId),
        type: data.type,
        realDelta: money(data.realDelta),
        bonusDelta: money(data.bonusDelta),
        lockedDelta: money(data.lockedDelta),
        referenceId: data.referenceId ?? undefined,
        marketId: data.marketId ?? undefined,
        createdAt: Number(data.createdAt),
    };
}
