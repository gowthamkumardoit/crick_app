export type Role =
    | "USER"
    | "ADMIN"
    | "FINANCE"
    | "SUPPORT"
    | "SUPER_ADMIN";

export type AccountStatus =
    | "ACTIVE"
    | "FROZEN"
    | "SUSPENDED";

export interface UserIdentity {
    userId: string;
    role: Role;
    isTestUser: boolean;
    status: AccountStatus;
}
