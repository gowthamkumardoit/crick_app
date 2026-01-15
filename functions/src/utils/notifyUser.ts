import { db, FieldValue } from "../utils/admin";

export async function notifyUser(params: {
  userId: string;
  title: string;
  body: string;
  referenceId: string;
}) {
  await db
    .collection("users")
    .doc(params.userId)
    .collection("notifications")
    .add({
      title: params.title,
      body: params.body,
      entityId: params.referenceId,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });
}

