export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface ApprovalRecord {
  entityId: string;
  entityType: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  reason?: string;
}
