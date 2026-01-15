export type Match = {
    id: string;
    status: 'UPCOMING'; // since you removed LIVE
    startTime: number;  // normalized (ms)
    enabled: boolean;

    league: {
        shortName: string;
    };

    teamA: {
        shortName: string;
        logoUrl?: string;   // ✅ ADD THIS
    };

    teamB: {
        shortName: string;
        logoUrl?: string;   // ✅ ADD THIS
    };
};