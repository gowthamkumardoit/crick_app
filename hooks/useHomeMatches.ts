import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from 'lib/firebase';

import { Match } from 'types/match';

export function useHomeMatches() {
    const [live, setLive] = useState<Match[]>([]);
    const [upcoming, setUpcoming] = useState<Match[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, 'matches'),
            where('enabled', '==', true),
            orderBy('startTime', 'asc')
        );

        return onSnapshot(q, (snap) => {
            const all: Match[] = snap.docs.map((d) => {
                const data = d.data() as any;

                return {
                    id: d.id,
                    ...data,
                    // 🔥 normalize here
                    startTime:
                        data.startTime instanceof Timestamp
                            ? data.startTime.toMillis()
                            : data.startTime,
                };
            });

            setLive(all.filter((m) => m.status === 'LIVE'));
            setUpcoming(all.filter((m) => m.status === 'UPCOMING'));
        });
    }, []);

    return { live, upcoming };
}
