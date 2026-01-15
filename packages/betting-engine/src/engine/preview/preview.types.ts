export interface SettlementPreview {
    totalPool: number;
    commission: number;
    distributable: number;
    payouts: Record<string, number>;
    leftover: number;
}

export interface JackpotPreview {
    jackpotBalance: number;
    payouts: Record<string, number>;
    totalPaid: number;
}
