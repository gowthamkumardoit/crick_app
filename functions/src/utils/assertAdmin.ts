import {
    HttpsError,
} from "firebase-functions/v2/https";

export type AdminContext = {
    uid: string;
    roles: string[];
    isSuperAdmin: boolean;
};

export function assertAdmin(
    auth: any | null
): AdminContext {
    console.log("assertAdmin", auth);
    if (!auth?.uid) {
        throw new HttpsError("unauthenticated", "Login required");
    }

    const rawRoles = auth.token?.roles;
    const roles = Array.isArray(rawRoles)
        ? rawRoles.map((r) => String(r).toUpperCase())
        : [];

    const isAdmin =
        roles.includes("ADMIN") || roles.includes("SUPER_ADMIN");

    if (!isAdmin) {
        throw new HttpsError(
            "permission-denied",
            "Admin access required"
        );
    }

    return {
        uid: auth.uid,
        roles,
        isSuperAdmin: roles.includes("SUPER_ADMIN"),
    };
}
