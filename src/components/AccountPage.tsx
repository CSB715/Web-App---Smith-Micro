// Account Page Component
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router";
import "./firestore";

function Account() {
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = checking
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, (u) => {
        if (u) {
            setUser(u);
        } else {
            setUser(null);
            navigate("/login", { replace: true });
        }
        });

        return () => unsub();
    }, [navigate]);

    if (user === undefined) return null; // or a loader

    return (
        <>
            <h1>Account</h1>
            {/* Account Page Content */}
        </>
    )
}

export default Account;
