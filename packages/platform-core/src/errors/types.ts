/* ============================================================
   PLATFORM CORE — ERROR DEFINITIONS (v1.0)
   ------------------------------------------------------------
   - Business agnostic
   - Stable runtime error codes
   - Typed via derived unions
   - ESM + isolatedModules safe
   ============================================================ */

/* ---------------- ERROR CATEGORIES (RUNTIME) ---------------- */

export const ErrorCategory = {
  AUTH: "AUTH",
  PERMISSION: "PERMISSION",
  VALIDATION: "VALIDATION",
  STATE: "STATE",
  LIMIT: "LIMIT",
  MONEY: "MONEY",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  SYSTEM: "SYSTEM",
  SECURITY: "SECURITY",
} as const;

/* ---------------- ERROR CODES (RUNTIME) ---------------- */

export const ErrorCode = {
  /* AUTH & ACCESS */
  UNAUTHENTICATED: "UNAUTHENTICATED",
  UNAUTHORIZED: "UNAUTHORIZED",
  ACCOUNT_FROZEN: "ACCOUNT_FROZEN",
  ACCOUNT_SUSPENDED: "ACCOUNT_SUSPENDED",

  /* VALIDATION */
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_STATE_TRANSITION: "INVALID_STATE_TRANSITION",

  /* PERMISSION */
  ROLE_NOT_ALLOWED: "ROLE_NOT_ALLOWED",
  ACTION_NOT_ALLOWED: "ACTION_NOT_ALLOWED",

  /* MONEY */
  INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
  INSUFFICIENT_BONUS: "INSUFFICIENT_BONUS",
  BONUS_EXPIRED: "BONUS_EXPIRED",
  BONUS_USAGE_LIMIT_EXCEEDED: "BONUS_USAGE_LIMIT_EXCEEDED",
  WITHDRAWAL_NOT_ALLOWED: "WITHDRAWAL_NOT_ALLOWED",

  /* LIMITS */
  LIMIT_EXCEEDED: "LIMIT_EXCEEDED",
  RATE_LIMITED: "RATE_LIMITED",

  /* STATE */
  ENTITY_NOT_ACTIVE: "ENTITY_NOT_ACTIVE",
  ENTITY_ALREADY_PROCESSED: "ENTITY_ALREADY_PROCESSED",
  MARKET_LOCKED: "MARKET_LOCKED",

  /* DATA */
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DUPLICATE_REQUEST: "DUPLICATE_REQUEST",

  /* SYSTEM */
  SYSTEM_ERROR: "SYSTEM_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

/* ---------------- DERIVED TYPES ---------------- */

export type ErrorCategory =
  typeof ErrorCategory[keyof typeof ErrorCategory];

export type ErrorCode =
  typeof ErrorCode[keyof typeof ErrorCode];

/* ---------------- CORE ERROR SHAPE ---------------- */

export interface PlatformError {
  code: ErrorCode;
  category: ErrorCategory;

  /** Localization key */
  messageKey: string;

  /** Debug-safe metadata */
  meta?: Record<string, unknown>;

  /** Whether retrying could succeed */
  retryable: boolean;
}

/* ---------------- RESULT TYPE ---------------- */

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: PlatformError };
