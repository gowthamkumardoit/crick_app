// utils/assertAdminId.ts
import { assertAdmin } from "./assertAdmin";

export function assertAdminId(auth: any): string {
    const { uid } = assertAdmin(auth);
    return uid;
}
