// store/matchStore.ts

export type JoinedMatch = {
  matchId: string;
  teams: string;
  entry: number;
  prize: number;
  status: 'LIVE' | 'UPCOMING';
};

export const joinedMatches: JoinedMatch[] = [];
