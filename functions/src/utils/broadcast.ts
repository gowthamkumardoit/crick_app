import { db } from "../utils/admin";
import { signNotification } from "./notificationSigner";

export async function createBroadcast(params: {
  title: string;
  message: string;
  createdBy: string;
}) {
  const payload = {
    title: params.title,
    message: params.message,
    createdBy: params.createdBy,
    createdAt: Date.now(),
  };

  const signature = signNotification(payload);

  await db.collection("adminBroadcasts").add({
    ...payload,
    signature,
    status: "PENDING",
  });
}
