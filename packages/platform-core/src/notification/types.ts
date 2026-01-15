export type NotificationChannel =
    | "IN_APP"
    | "EMAIL"
    | "SMS"
    | "PUSH";

export interface NotificationEvent {
    eventType: string;
    userId: string;
    payload: Record<string, unknown>;
}
