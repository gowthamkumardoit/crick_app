import { Role } from "../identity/types";

export interface AuditLog {
  logId: string;
  actorId: string;
  actorRole: Role;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: number;
}
