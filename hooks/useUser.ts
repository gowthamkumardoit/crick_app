import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from 'lib/firebase';

export function useUser(uid: string) {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const ref = doc(db, 'users', uid);
        return onSnapshot(ref, (snap) => {
            if (snap.exists()) setUser(snap.data());
        });
    }, [uid]);

    return user;
}
