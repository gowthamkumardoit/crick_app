import { HttpsError } from "firebase-functions/v2/https";
import { CallableRequest } from "firebase-functions/v2/https";

export function assertAuth(
  auth: CallableRequest["auth"]
): {
  uid: string;
  token?: Record<string, any>;
} {
  console.log("assertAuht", auth);
  if (!auth?.uid) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  return {
    uid: auth.uid,
    token: auth.token,
  };
}
