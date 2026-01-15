import { Wallet, Money } from "./types";

export interface WalletPolicy {
    canDebitReal(wallet: Wallet, amount: Money): boolean;
    canDebitBonus(wallet: Wallet, amount: Money): boolean;
}


export interface BonusPolicy {
  /** max bonus usable per contest (e.g. 0.1 = 10%) */
  maxBonusUsageRatio: number;
}

export const DefaultBonusPolicy: BonusPolicy = {
  maxBonusUsageRatio: 0.1
};
