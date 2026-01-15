import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from 'lib/firebase';

export function useStakes() {
    const [stakes, setStakes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'config', 'stakes', 'items'),
            where('enabled', '==', true),
            orderBy('amount', 'asc')
        );

        const unsub = onSnapshot(q, (snap) => {
            setStakes(
                snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }))
            );
            setLoading(false);
        });

        return unsub;
    }, []);

    return { stakes, loading };
}
