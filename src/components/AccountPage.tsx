// Account Page Component
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router";
import firestore from "./firestore";
import { collection, doc, getDoc, getDocs, deleteDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
import "../styles/Page.css";

function Account() {
    /* auth state check - redirect to login if not logged in */
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = checking
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

    type UserData = { email?: string | null; phone?: string | null; [key: string]: any };
    const [userData, setUserData] = useState<UserData | null>(null);
    const [devices, setDevices] = useState<Array<DocumentData>>([]);
    const [currDevice, setCurrDevice] = useState<DocumentData | null>(null);

    // Fetch userDevices subcollection
    async function fetchUserDevices(userRef: DocumentReference) {
                const devicesCol = collection(userRef, "userDevices");
                const devicesSnap = await getDocs(devicesCol);
                const devicesArr = devicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data()}));
                console.log("Devices subcollection:", devicesArr);
                setDevices(devicesArr);
    }

    // Fetch user document on component mount, including userDevices subcollection
    async function fetchUserDoc() {
        try {
            const userId = "7LpcmhJK1QCWn9ETqLN5"; // user!.uid;
            const ref = doc(firestore, "Users", userId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                console.log("Test user document:", snap.data());
                setUserData(snap.data() as UserData);
                fetchUserDevices(ref);

            } else {
            console.log("No user document found for id:", userId);
            }
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };


    /* button functions */
    function handleDeleteDevice(deviceId: string) {
        console.log("Delete device with ID:", deviceId);
        setCurrDevice(devices.find(device => device.id === deviceId) || null);

        const modal = document.getElementById("deleteDeviceModal");
        const span = document.getElementsByClassName("close")[0];
        const cancelBtn = document.getElementById("cancelDeleteDevice");
        const confirmBtn = document.getElementById("confirmDeleteDevice");

        modal!.style.display = "block";

        span!.addEventListener("click", () => {
            console.log("Cancelled deletion of device ID:", deviceId);
            modal!.style.display = "none";
        });

        window.onclick = function(event) {
            if (event.target === modal) {
                console.log("Cancelled deletion of device ID:", deviceId);
                modal!.style.display = "none";
            }   
        };

        cancelBtn!.onclick = function() {
            console.log("Cancelled deletion of device ID:", deviceId);
            modal!.style.display = "none";
        };

        confirmBtn!.onclick = function() {
            const docRef = doc(firestore, "Users", "7LpcmhJK1QCWn9ETqLN5", "userDevices", deviceId); // user!.uid

            deleteDoc(docRef)
            .then(() => {
                console.log("Document successfully deleted!");
                modal!.style.display = "none";
                // reload device list

                const userId = "7LpcmhJK1QCWn9ETqLN5"; // user!.uid;
                const ref = doc(firestore, "Users", userId);
                fetchUserDevices(ref);

            })
            .catch((error) => {
                console.error("Error removing document: ", error);
                modal!.style.display = "none";
                // show error modal
            });

        };
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


    useEffect(() => {
        fetchUserDoc();
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


            {/* modal for delete device */}
            <div id="deleteDeviceModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>Delete {currDevice?.deviceName}?</p>
                    <p>If you delete this device, all data associated with it will be lost.</p>
                    <div>
                        <button id="cancelDeleteDevice">Cancel</button>
                        <button id="confirmDeleteDevice">Confirm</button>
                    </div>
                </div>
            </div>

            {/* modal for edit device */}

            {/* modal for edit email */}

            {/* modal for edit phone */}

            {/* modal for delete account */}
        </>
    );
}

export default Account;
