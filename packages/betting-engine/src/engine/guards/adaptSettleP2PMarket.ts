import { LedgerEntry, Result } from "@predict-guru/platform-core";
import { MarketDoc, BetDoc } from "../../types/market.types";
import { settleP2PEngine, SettleP2PIntent } from "../settle-p2p.engine";
import { assertP2PParticipantCount } from "./assertP2PParticipantCount";
import { assertP2PInvariants } from "./assertP2PInvariantts";


/**
 * Core adapter for P2P settlement.
 */
export function adaptSettleP2PMarket(params: {
    market: MarketDoc;
    bets: BetDoc[];
    ledger: LedgerEntry[];
    intent: SettleP2PIntent;
}): Result<LedgerEntry[]> {

    const countCheck = assertP2PParticipantCount({
        market: params.market,
        bets: params.bets,
    });
    if (!countCheck.ok) return countCheck;

    const invariantCheck = assertP2PInvariants({
        market: params.market,
        bets: params.bets,
    });
    if (!invariantCheck.ok) return invariantCheck;

    return settleP2PEngine({
        ledger: params.ledger,
        intent: params.intent,
    });
}
