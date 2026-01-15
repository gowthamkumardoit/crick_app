/* eslint-disable @typescript-eslint/no-explicit-any */
import { assertP2PParticipantCount } from "../../engine/guards/assertP2PParticipantCount";
import { ErrorCode } from "@predict-guru/platform-core";

describe("assertP2PParticipantCount", () => {

    test("passes for non-P2P market", () => {
        const result = assertP2PParticipantCount({
            market: { mode: "POOL" } as any,
            bets: [],
        });

        expect(result.ok).toBe(true);
    });

    test("fails if P2P has less than 2 participants", () => {
        const result = assertP2PParticipantCount({
            market: { mode: "P2P" } as any,
            bets: [{}] as any,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe(ErrorCode.ACTION_NOT_ALLOWED);
        }
    });

    test("fails if P2P has more than 2 participants", () => {
        const result = assertP2PParticipantCount({
            market: { mode: "P2P" } as any,
            bets: [{}, {}, {}] as any,
        });

        expect(result.ok).toBe(false);
    });

    test("passes if P2P has exactly 2 participants", () => {
        const result = assertP2PParticipantCount({
            market: { mode: "P2P" } as any,
            bets: [{}, {}] as any,
        });

        expect(result.ok).toBe(true);
    });

});