import crypto from "crypto";

function getSecret(): string {
  const secret = process.env.ADMIN_NOTIFY_SECRET;
  if (!secret) {
    throw new Error("ADMIN_NOTIFY_SECRET is missing");
  }
  return secret;
}

function stableStringify(obj: Record<string, any>): string {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {} as Record<string, any>)
  );
}

export function signNotification(payload: Record<string, any>): string {
  const secret = getSecret(); // ← SAFE

  return crypto
    .createHmac("sha256", secret)
    .update(stableStringify(payload))
    .digest("hex");
}

export function verifyNotificationSignature(
  payload: Record<string, any>,
  signature: string
): boolean {
  const expected = signNotification(payload);

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}
