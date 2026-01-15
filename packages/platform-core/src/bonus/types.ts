import { Money } from "../wallet/types";

export type BonusType =
    | "JOIN"
    | "DEPOSIT"
    | "PROMO"
    | "REFERRAL"
    | "MANUAL";

export interface BonusGrant {
    bonusId: string;
    userId: string;
    type: BonusType;
    originalAmount: Money;
    remainingAmount: Money;
    expiryAt: number;
    status: "ACTIVE" | "EXPIRED" | "USED";
}
