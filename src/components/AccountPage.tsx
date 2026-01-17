// Account Page Component
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router";
import firestore from "./firestore";
import { collection, doc, getDoc, getDocs, type DocumentData } from "firebase/firestore";
import "../styles/Page.css";

function Account() {
    /* auth state check - redirect to login if not logged in */
    // const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = checking
    // const navigate = useNavigate();

    // useEffect(() => {
    //     const auth = getAuth();
    //     const unsub = onAuthStateChanged(auth, (u) => {
    //     if (u) {
    //         setUser(u);
    //     } else {
    //         setUser(null);
    //         navigate("/login", { replace: true });
    //     }
    //     });

    //     return () => unsub();
    // }, [navigate]);

    // if (user === undefined) return null; // or a loader

    /* button functions */
    function handleDeleteDevice(deviceId: string) {
        console.log("Delete device with ID:", deviceId);
        // TODO: Implement device deletion logic
    }

    function handleEditDevice(deviceId: string) {
        console.log("Edit device with ID:", deviceId);
        // TODO: Implement device editing logic
    }

    function handleEditEmail() {
        console.log("Edit email button clicked");
        // TODO: Implement email prompt for changing email
    }

    function handleEditPhone() {
        console.log("Edit phone button clicked");
        // TODO: Implement text prompt for changing phone number
    }

    function handleResetPassword() {
        console.log("Reset password button clicked");
        // TODO: Implement email prompt for password reset
    }

    function handleDeleteAccount() {
        console.log("Delete account button clicked");
        // TODO: Implement account deletion logic
    }


    /* test code fetching demo user data from firestore */
    type UserData = { email?: string | null; [key: string]: any };
    const [userData, setUserData] = useState<UserData | null>(null);
    const [devices, setDevices] = useState<Array<DocumentData>>([]);
    useEffect(() => {
        const fetchUserForTest = async () => {
        try {
            const testUserId = "7LpcmhJK1QCWn9ETqLN5"; // <-- replace with a real doc id for testing
            const ref = doc(firestore, "Users", testUserId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                console.log("Test user document:", snap.data());
                setUserData(snap.data() as UserData);

                // Fetch userDevices subcollection
                const devicesCol = collection(ref, "userDevices");
                const devicesSnap = await getDocs(devicesCol);
                const devicesArr = devicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data()}));
                console.log("Devices subcollection:", devicesArr);
                setDevices(devicesArr);

            } else {
            console.log("No user document found for id:", testUserId);
            }
        } catch (err) {
            console.error("Error fetching test user:", err);
        }
        };

        fetchUserForTest();
    }, []);

    return (
        <>
            <h1 className="title">Account</h1>
            <hr className="divider" />

            <div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>
                        <h3 style={{ marginBottom: "0" }}>Email</h3>
                        <p style={{ marginTop: "0" }}>{userData?.userEmail}</p>
                    </span>
                    <button style={{ marginLeft: "auto" }} 
                        onClick={() => handleEditEmail()}>Edit</button>
                </div>

                <br />

                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>
                        <h3 style={{ marginBottom: "0" }}>Phone</h3>
                        <p style={{ marginTop: "0" }}>{userData?.primaryPhone}</p>
                    </span>
                    <button style={{ marginLeft: "auto" }}
                        onClick={() => handleEditPhone()}>Edit</button>
                </div>

                <br />

                <button onClick={() => handleResetPassword()}>Reset Password</button>

                <br />

                <p style={{ textAlign: "center" }}>Device List</p>

                <table>
                    <tbody>
                    {devices.map((device) => (
                        <tr key={device.id}>
                            <td>{device.deviceName}</td>
                            <td><button onClick={() => handleDeleteDevice(device.id)}>Del</button></td>
                            <td><button onClick={()=> handleEditDevice(device.id)}>Edit</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <br />

                <button onClick={() => handleDeleteAccount()}>Delete Account</button>
            </div>
        </>
    );
}

export default Account;
