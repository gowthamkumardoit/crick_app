/**
 * Client → Cloud Function input contract
 * For placing a POOL (pari-mutuel) bet.
 *
 * 🔒 Client may ONLY send these fields.
 * 🔒 Everything else is derived server-side.
 */
export type PlacePoolBetInput = {
    /** Match context */
    matchId: string;

    /** POOL market id */
    marketId: string;

    /** Pool question id */
    poolId: string;

    /** Selected option inside the pool */
    optionId: string;

    /** Stake amount in rupees (raw number, validated later) */
    stake: number;
};


export function validatePlacePoolBetInput(
    input: any
): asserts input is PlacePoolBetInput {
    if (
        !input ||
        typeof input.matchId !== "string" ||
        typeof input.marketId !== "string" ||
        typeof input.poolId !== "string" ||
        typeof input.optionId !== "string" ||
        typeof input.stake !== "number"
    ) {
        throw new Error("Invalid PlacePoolBetInput");
    }
}
