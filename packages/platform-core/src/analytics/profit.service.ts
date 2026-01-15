import { LedgerEntry } from "../ledger/types";
import { Money } from "../wallet/types";
import { ZERO_MONEY, addMoney, negateMoney, isLessThan } from "../wallet/money";

export interface ProfitSummary {
  // User-facing
  userNetProfit: Money;

  // Platform-facing
  platformNetProfit: Money;

  // Real money
  totalDeposits: Money;
  totalWithdrawals: Money;
  totalPayouts: Money;

  // Bonus analytics
  bonusGranted: Money;
  bonusUsed: Money;
  bonusBurned: Money;
  bonusConvertedToReal: Money;
}

/**
 * Compute profit analytics from ledger entries.
 * PURE READ MODEL – no mutation, no IO.
 */
export function calculateProfitSummary(
  ledger: LedgerEntry[]
): ProfitSummary {
  let totalDeposits = ZERO_MONEY;
  let totalWithdrawals = ZERO_MONEY;
  let totalPayouts = ZERO_MONEY;

  let bonusGranted = ZERO_MONEY;
  let bonusUsed = ZERO_MONEY;
  let bonusBurned = ZERO_MONEY;
  let bonusConvertedToReal = ZERO_MONEY;

  let userNetProfit = ZERO_MONEY;
  let platformNetProfit = ZERO_MONEY;

  for (const entry of ledger) {
    // --- REAL MONEY FLOWS ---
    if (entry.type === "DEPOSIT") {
      totalDeposits = addMoney(totalDeposits, entry.realDelta);
      platformNetProfit = addMoney(platformNetProfit, entry.realDelta);
    }

    if (entry.type === "WITHDRAW") {
      totalWithdrawals = addMoney(
        totalWithdrawals,
        negateMoney(entry.realDelta)
      );
      platformNetProfit = addMoney(platformNetProfit, entry.realDelta);
    }

    if (entry.type === "WIN") {
      totalPayouts = addMoney(totalPayouts, entry.realDelta);
      platformNetProfit = addMoney(
        platformNetProfit,
        negateMoney(entry.realDelta)
      );
      userNetProfit = addMoney(userNetProfit, entry.realDelta);
    }

    // --- BONUS FLOWS ---
    if (entry.type === "BONUS_GRANTED") {
      bonusGranted = addMoney(bonusGranted, entry.bonusDelta);
    }

    if (entry.type === "BONUS_USED") {
      bonusUsed = addMoney(bonusUsed, negateMoney(entry.bonusDelta));
    }

    if (entry.type === "BONUS_BURNED" || entry.type === "BONUS_EXPIRED") {
      bonusBurned = addMoney(
        bonusBurned,
        negateMoney(entry.bonusDelta)
      );
    }

    // BONUS → REAL CONVERSION (WIN)
    if (entry.type === "WIN" && isLessThan(ZERO_MONEY, entry.realDelta)) {
      bonusConvertedToReal = addMoney(
        bonusConvertedToReal,
        entry.realDelta
      );
    }
  }

  return {
    userNetProfit,
    platformNetProfit,

    totalDeposits,
    totalWithdrawals,
    totalPayouts,

    bonusGranted,
    bonusUsed,
    bonusBurned,
    bonusConvertedToReal
  };
}
