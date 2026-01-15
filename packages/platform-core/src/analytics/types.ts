export interface AnalyticsEvent {
    eventName: string;
    userId?: string;
    meta?: Record<string, unknown>;
    createdAt: number;
}
