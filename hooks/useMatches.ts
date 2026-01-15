import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "lib/firebase";
import { useEffect, useState } from "react";

export function useMatches() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "matches"),
            where("enabled", "==", true),
            orderBy("startTime", "asc")
        );

        const unsub = onSnapshot(q, (snap) => {
            setMatches(
                snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
            );
            setLoading(false);
        });

        return unsub;
    }, []);

    return { matches, loading };
}
