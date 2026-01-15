// ---------- TYPES ----------
export type {
  Role,
  AccountStatus,
  UserIdentity,
} from "./identity/types";

export type {
  Money,
  Wallet,
} from "./wallet/types";

export type {
  LedgerEntry,
} from "./ledger/types";

export type {
  BonusType,
  BonusGrant,
} from "./bonus/types";

export type {
  ApprovalRecord,
  ApprovalStatus,
} from "./approval/types";

export type {
  AuditLog,
} from "./audit/types";

export type {
  StateTransition,
} from "./lifecycle/types";

export type {
  NotificationChannel,
  NotificationEvent,
} from "./notification/types";

export type {
  FeatureToggle,
} from "./feature-toggle/types";

export type {
  ContentType,
  ContentItem,
} from "./broadcast/types";

export type {
  PolicyValue,
} from "./config-policy/types";

export type {
  AnalyticsEvent,
} from "./analytics/types";

export type {
  FileAsset,
} from "./file-asset/types";

export type {
  LocalizedMessage,
} from "./localization/types";

export type {
  HealthSignal,
} from "./health/types";

export type {
  PlatformError,
  Result,
} from "./errors/types";

// ---------- RUNTIME VALUES ----------
export { ErrorCategory, ErrorCode } from "./errors/types";


// ---------- DOMAIN HELPERS (RUNTIME – ALLOWED) ----------
export { isErr } from "./errors/result";

export {
  money,
  negateMoney,
  isLessThan,
  addMoney,
  subtractMoney,
  ZERO_MONEY,
} from "./wallet/money";

export {
  creditWallet,
  debitWallet,
  buildWalletFromLedger,
} from "./wallet/wallet.service";

export { createLedgerEntry } from "./ledger/ledger.service";
export { decodeLedgerEntry } from "./ledger/ledger.decoder";
