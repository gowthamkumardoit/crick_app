import { ErrorCode } from "@predict-guru/platform-core";
import { assertValidMatchTransition } from "../../engine/invariants/assertValidMatchTransistion";

describe("assertValidMatchTransition", () => {

    test("allows UPCOMING → LIVE", () => {
        const result = assertValidMatchTransition({
            from: "UPCOMING",
            to: "LIVE",
        });

        expect(result.ok).toBe(true);
    });

    test("allows LIVE → LOCKED", () => {
        const result = assertValidMatchTransition({
            from: "LIVE",
            to: "LOCKED",
        });

        expect(result.ok).toBe(true);
    });

    test("allows LOCKED → COMPLETED", () => {
        const result = assertValidMatchTransition({
            from: "LOCKED",
            to: "COMPLETED",
        });

        expect(result.ok).toBe(true);
    });

    test("allows CANCELLED from any active state", () => {
        const states: Array<"UPCOMING" | "LIVE" | "LOCKED"> = [
            "UPCOMING",
            "LIVE",
            "LOCKED",
        ];

        for (const from of states) {
            const result = assertValidMatchTransition({
                from,
                to: "CANCELLED",
            });

            expect(result.ok).toBe(true);
        }
    });

    test("rejects invalid backward transition", () => {
        const result = assertValidMatchTransition({
            from: "LIVE",
            to: "UPCOMING",
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(
                ErrorCode.INVALID_STATE_TRANSITION
            );
        }
    });

    test("rejects transition from COMPLETED", () => {
        const result = assertValidMatchTransition({
            from: "COMPLETED",
            to: "LIVE",
        });

        expect(result.ok).toBe(false);
    });

    test("rejects same-state transition", () => {
        const result = assertValidMatchTransition({
            from: "LIVE",
            to: "LIVE",
        });

        expect(result.ok).toBe(false);
    });

});
