// functions/src/user/submitKycRequestFn.ts

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, FieldValue } from "../utils/admin";

import {
    SubmitKycRequestInput,
    validateSubmitKycRequest,
} from "../contracts/submitKycRequest.contract";

import { logUserActivity } from "../activity/userActivityLogger";
import { assertAuth } from "../utils/assertAuth";

/* ======================================================
   SUBMIT KYC REQUEST
====================================================== */

export const mobileKycRequest = onCall(
    {
        region: "asia-south1",
        concurrency: 10,
        timeoutSeconds: 30,
        memory: "256MiB",
    },
    async (req) => {
        /* ================= AUTH ================= */
        const auth = assertAuth(req.auth);
        const userId = auth.uid;
        const email = auth.token?.email ?? null;

        /* ================= INPUT ================= */
        const input = validateSubmitKycRequest(
            req.data
        ) as SubmitKycRequestInput;

        /* ================= REFS ================= */
        const userRef = db.doc(`users/${userId}`);
        const requestRef = db.collection("verificationRequests").doc();
        const refId = `KYC_VERIFICATION:${requestRef.id}`;

        const userNotifRef = db
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .doc();

        const adminNotifRef = db.collection("adminNotifications").doc();
        const statsRef = db.doc("config/kycStats");

        /* ================= TRANSACTION ================= */
        await db.runTransaction(async (tx) => {
            const userSnap = await tx.get(userRef);
            const userData = userSnap.exists ? userSnap.data() : null;

            /* ---------- CREATE USER IF MISSING ---------- */
            if (!userData) {
                tx.set(userRef, {
                    uid: userId,
                    email,
                    verification: {
                        kycStatus: "UNVERIFIED",
                        mobileStatus: "UNVERIFIED",
                    },
                    createdAt: FieldValue.serverTimestamp(),
                });
            }

            /* ---------- PREVENT DUPLICATE SUBMISSION ---------- */
            const currentStatus = userData?.verification?.kycStatus;

            if (currentStatus === "PENDING") {
                throw new HttpsError(
                    "failed-precondition",
                    "KYC already submitted and pending review"
                );
            }

            if (currentStatus === "VERIFIED") {
                throw new HttpsError(
                    "failed-precondition",
                    "KYC already verified"
                );
            }

            /* ---------- CREATE VERIFICATION REQUEST ---------- */
            tx.set(requestRef, {
                userId,
                status: "PENDING",

                fullName: input.fullName,
                dob: input.dob,
                documentNumberMasked: input.documentNumberMasked,
                documentUrl: input.documentUrl,
                selfieUrl: input.selfieUrl,

                createdAt: FieldValue.serverTimestamp(),
            });

            /* ---------- UPDATE USER ---------- */
            tx.set(
                userRef,
                {
                    verification: {
                        kycStatus: "PENDING",
                        kycRequestId: requestRef.id,
                        kycUpdatedAt: FieldValue.serverTimestamp(),
                    },
                },
                { merge: true }
            );

            /* ---------- UPDATE STATS ---------- */
            tx.set(
                statsRef,
                {
                    pending: FieldValue.increment(1),
                    todayPending: FieldValue.increment(1),
                    total: FieldValue.increment(1),
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );


            /* ---------- ADMIN NOTIFICATION ---------- */
            tx.set(adminNotifRef, {
                event: "KYC_SUBMITTED",
                title: "New KYC Submitted",
                body: `User ${input.fullName} submitted KYC for verification`,
                entityId: refId,
                meta: {
                    userId,
                    verificationRequestId: requestRef.id,
                },
                read: false,
                createdAt: FieldValue.serverTimestamp(),
            });

            /* ---------- USER NOTIFICATION ---------- */
            tx.set(userNotifRef, {
                referenceId: refId,
                title: "KYC Submitted",
                body:
                    "Your identity verification documents were submitted successfully.",
                read: false,
                createdAt: FieldValue.serverTimestamp(),
            });

            /* ---------- USER ACTIVITY LOG ---------- */
            logUserActivity(tx, {
                userId,
                action: "KYC_SUBMITTED",
                referenceId: refId,
                meta: {
                    verificationRequestId: requestRef.id,
                },
            });
        });

        return {
            ok: true,
            requestId: requestRef.id,
        };
    }
);
