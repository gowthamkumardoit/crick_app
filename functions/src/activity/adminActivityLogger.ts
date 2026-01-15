import { db, FieldValue } from "../utils/admin";

/* ======================================================
   ADMIN ACTIVITY LOGGER
   ------------------------------------------------------
   - Global collection
   - Append-only
   - Fire-and-forget
====================================================== */

type AdminActivityLogDoc = {
  adminId: string;
  action: AdminAction;

  entityId: string;
  entityType: string | null;
  entityRefId: string | null;

  meta?: Record<string, unknown> | null;
  createdAt: FirebaseFirestore.FieldValue;
};


export type AdminAction =
  // ===== MARKETS =====
  | "MARKET_LOCKED"
  | "MARKET_SETTLED"
  | "MARKET_VOIDED"
  | "MARKET_REOPENED"

  // ===== LEAGUES =====
  | "LEAGUE_CREATED"
  | "LEAGUE_ENABLED"
  | "LEAGUE_DISABLED"
  | "LEAGUE_UPDATED"

  // ===== TEAMS =====
  | "TEAM_CREATED"
  | "TEAM_UPDATED"
  | "TEAM_ENABLED"
  | "TEAM_DISABLED"

  // ===== MATCHES =====
  | "MATCH_CREATED"
  | "MATCH_UPDATED"
  | "MATCH_ENABLED"
  | "MATCH_DISABLED"
  | "MATCH_AUTO_LIVE"

  // ===== POOLS =====
  | "POOL_SETTLED"
  | "POOL_VOIDED"
  | "POOLS_CREATED_FROM_TEMPLATE"

  // ===== FINANCE =====
  | "DEPOSIT_REQUESTED"
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"

  | "KYC_APPROVED"
  | "KYC_REJECTED"

  // ===== SYSTEM =====
  | "MANUAL_ADJUSTMENT"
  | "BONUS_EXPIRED"
  | "ADMIN_BANK_ACCOUNT_CREATED"
  | "ADMIN_BANK_ACCOUNT_ACTIVATED"
  | "ADMIN_BANK_ACCOUNT_UPDATED"
  | "UPI_CREATED"
  | "UPI_ACTIVATED"
  | "UPI_UPDATED"
  | "UPI_DELETED"
  | "UPI_DISABLED"
  | "STAKE_CREATED"
  | "STAKE_UPDATED"
  | "STAKE_DISABLED"
  | "LEAGUE_LOGO_UPDATED"
  | "DEPOSIT_REQUEST_CREATED"
  | "MATCH_STATUS_UPDATED"
  | "UPI_VERIFICATION_APPROVED"
  | "UPI_VERIFICATION_REJECTED"
  | "WITHDRAWAL_APPROVED"
  | "WITHDRAWAL_REJECTED"
  | "CAROUSEL_ACTIVATED"
  | "CAROUSEL_DEACTIVATED_ALL"
  | "P2P_CONTESTS_SEEDED"

export async function logAdminActivity(params: {
  adminId: string;
  action: AdminAction;
  entityId: string;
  meta?: Record<string, unknown>;
}) {
  const { adminId, action, entityId, meta } = params;

  const [rawType, rawId] = entityId.includes(":")
    ? entityId.split(":")
    : [entityId, null];

  const doc: AdminActivityLogDoc = {
    adminId,
    action,

    entityId,
    entityType: rawType ?? null,
    entityRefId: rawId ?? null,

    meta: meta ?? null,
    createdAt: FieldValue.serverTimestamp(),
  };

  await db.collection("adminActivityLogs").add(doc);
}

