export interface HealthSignal {
    source: string;
    status: "OK" | "WARN" | "ERROR";
    checkedAt: number;
}
