export function mapMatchToCard(match: any) {
    const now = Date.now();

    const startMs =
        typeof match.startTime === 'number'
            ? match.startTime
            : match.startTime?.toMillis?.();

    const isLive =
        match.status === 'LIVE' ||
        (startMs && now >= startMs && match.status === 'OPEN');

    return {
        id: match.id,
        league: `${match.league?.shortName} • T20`,
        teamA: match.teamA?.shortName,
        teamB: match.teamB?.shortName,
        teamALogo: match.teamA?.logoUrl,
        teamBLogo: match.teamB?.logoUrl,
        startTime: startMs,
        status: isLive ? 'LIVE' : 'UPCOMING',
    };
}
