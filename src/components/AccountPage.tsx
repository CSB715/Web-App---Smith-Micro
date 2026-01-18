// Account Page Component
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router";
import firestore from "./firestore";
import { collection, doc, getDoc, getDocs, deleteDoc, updateDoc, type DocumentData, type DocumentReference } from "firebase/firestore";
import "../styles/Page.css";

function Account() {
    const testID = "demoman"; //"7LpcmhJK1QCWn9ETqLN5"
    /* auth state check - redirect to login if not logged in */
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = checking
    const navigate = useNavigate();

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
            const userId = testID; // user!.uid;
            const ref = doc(firestore, "Users", userId);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                console.log("Test user document:", snap.data());
                setUserData(snap.data() as UserData);
                fetchUserDevices(ref);

            } else {
            console.log("No user document found for id:", userId);
            navigate("/login", { replace: true });
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            // show error modal
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
            const docRef = doc(firestore, "Users", testID, "userDevices", deviceId); // user!.uid

            deleteDoc(docRef)
            .then(() => {
                console.log("Device successfully deleted!");
                modal!.style.display = "none";
                // reload device list

                const userId = testID; // user!.uid;
                const ref = doc(firestore, "Users", userId);
                fetchUserDevices(ref);

            })
            .catch((error) => {
                console.error("Error removing device: ", error);
                modal!.style.display = "none";
                // show error modal
            });

        };
    }

    function handleRenameDevice(deviceId: string) {
        console.log("Rename device with ID:", deviceId);
        setCurrDevice(devices.find(device => device.id === deviceId) || null);

        const modal = document.getElementById("renameDeviceModal");
        const span = document.getElementsByClassName("close")[1];
        const newNameInput = document.getElementById("newDeviceName") as HTMLInputElement;
        const cancelBtn = document.getElementById("cancelRenameDevice");
        const confirmBtn = document.getElementById("confirmRenameDevice");

        modal!.style.display = "block";

        span!.addEventListener("click", () => {
            console.log("Cancelled renaming of device ID:", deviceId);
            modal!.style.display = "none";
        });

        window.onclick = function(event) {
            if (event.target === modal) {
                console.log("Cancelled renaming of device ID:", deviceId);
                modal!.style.display = "none";
            }   
        };

        cancelBtn!.onclick = function() {
            console.log("Cancelled renaming of device ID:", deviceId);
            modal!.style.display = "none";
        };

        newNameInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                confirmBtn!.click();
            }
        });

        confirmBtn!.onclick = function() {
            const newName = newNameInput.value.trim();
            if (newName.trim() === "") {
                console.log("New device name cannot be empty.");
                return;
            }

            const docRef = doc(firestore, "Users", testID, "userDevices", deviceId); // user!.uid

            updateDoc(docRef, { deviceName: newName })
            .then(() => {
                console.log("Device successfully renamed!");
                modal!.style.display = "none";
                // reload device list

                const userId = testID; // user!.uid;
                const ref = doc(firestore, "Users", userId);
                fetchUserDevices(ref);

            })
            .catch((error) => {
                console.error("Error renaming device: ", error);
                modal!.style.display = "none";
                // show error modal
            });
        }
    }

    function handleEditEmail() {
        console.log("Edit email button clicked");

        const modal = document.getElementById("editEmailModal");
        const span = document.getElementsByClassName("close")[2];
        const newEmailInput = document.getElementById("newEmail") as HTMLInputElement;
        const cancelBtn = document.getElementById("cancelEditEmail");
        const confirmBtn = document.getElementById("confirmEditEmail");

        modal!.style.display = "block";

        span!.addEventListener("click", () => {
            console.log("Cancelled editing email");
            modal!.style.display = "none";
        });

        window.onclick = function(event) {
            if (event.target === modal) {
                console.log("Cancelled editing email");
                modal!.style.display = "none";
            }   
        };

        cancelBtn!.onclick = function() {
            console.log("Cancelled editing email");
            modal!.style.display = "none";
        };

        newEmailInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                confirmBtn!.click();
            }
        });

        confirmBtn!.onclick = function() {
            const newEmail = newEmailInput.value.trim();
            if (newEmail.trim() === "") {
                console.log("New email cannot be empty.");
                return;
            }

            const docRef = doc(firestore, "Users", testID); // user!.uid

            const data = { userEmail: newEmail };

            // trigger sending email to authenticate new address, then change 
        }
    }

    function handleEditPhone() {
        console.log("Edit phone button clicked");

        const modal = document.getElementById("editPhoneModal");
        const span = document.getElementsByClassName("close")[3];
        const newPhoneInput = document.getElementById("newPhone") as HTMLInputElement;
        const cancelBtn = document.getElementById("cancelEditPhone");
        const confirmBtn = document.getElementById("confirmEditPhone");

        modal!.style.display = "block";

        span!.addEventListener("click", () => {
            console.log("Cancelled editing phone number");
            modal!.style.display = "none";
        });

        window.onclick = function(event) {
            if (event.target === modal) {
                console.log("Cancelled editing phone number");
                modal!.style.display = "none";
            }   
        };

        cancelBtn!.onclick = function() {
            console.log("Cancelled editing phone number");
            modal!.style.display = "none";
        };

        newPhoneInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                confirmBtn!.click();
            }
        });

        confirmBtn!.onclick = function() {
            const newPhone = newPhoneInput.value.trim();
            if (newPhone.trim() === "") {
                console.log("New phone number cannot be empty.");
                return;
            }

            const docRef = doc(firestore, "Users", testID); // user!.uid

            updateDoc(docRef, { primaryPhone: newPhone })
            .then(() => {
                console.log("Phone number successfully updated");
                modal!.style.display = "none";
                // reload phone number display

                const userId = testID; // user!.uid;
                const ref = doc(firestore, "Users", userId);
                fetchUserDoc();

            })
            .catch((error) => {
                console.error("Error updating phone number: ", error);
                modal!.style.display = "none";
                // show error modal
            });
        }
    }

    function handleDeleteAccount() {
        console.log("Delete account button clicked");

        const modal = document.getElementById("deleteAccountModal");
        const span = document.getElementsByClassName("close")[4];
        const cancelBtn = document.getElementById("cancelDeleteAccount");
        const confirmBtn = document.getElementById("confirmDeleteAccount");

        modal!.style.display = "block";

        span!.addEventListener("click", () => {
            console.log("Cancelled account deletion");
            modal!.style.display = "none";
        });

        window.onclick = function(event) {
            if (event.target === modal) {
                console.log("Cancelled account deletion");
                modal!.style.display = "none";
            }
        };

        cancelBtn!.onclick = function() {
            console.log("Cancelled account deletion");
            modal!.style.display = "none";
        };

        confirmBtn!.onclick = function() {
            console.log("Confirmed account deletion");
            
            // sign out
            const auth = getAuth();
            auth.signOut().then(() => {
                console.log("User signed out");

                // then delete user document
                deleteDoc(doc(firestore, "Users", testID)) // user!.uid
                .then(() => {
                    console.log("User document deleted");
                    modal!.style.display = "none";

                    // redirect to login page
                    navigate("/login", { replace: true });
                })
                .catch((error) => {
                    console.error("Error deleting user document: ", error);
                    modal!.style.display = "none";
                    // show error modal
                });
            }).catch((error) => {
                console.error("Error signing out: ", error);
                // show error modal
            });
        };
    }

    function handleResetPassword() {
        console.log("Reset password button clicked");
        // TODO: Implement email prompt for password reset
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
                            <td><button onClick={()=> handleRenameDevice(device.id)}>Edit</button></td>
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
            <div id="renameDeviceModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>Rename {currDevice?.deviceName}?</p>
                    <input type="text" id="newDeviceName" placeholder="New Name"/>
                    <br/>
                    <div>
                        <button id="cancelRenameDevice">Cancel</button>
                        <button id="confirmRenameDevice">Confirm</button>
                    </div>
                </div>
            </div>

            {/* modal for edit email */}
            <div id="editEmailModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>New Email Address</p>
                    <input type="text" id="newEmail" placeholder="joesmith@example.com"/>
                    <br/>
                    <div>
                        <button id="cancelEditEmail">Cancel</button>
                        <button id="confirmEditEmail">Confirm</button>
                    </div>
                </div>
            </div>

            {/* modal for edit phone */}
            <div id="editPhoneModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>New Phone Number</p>
                    <input type="text" id="newPhone" placeholder="(555) 555-5555"/>
                    <br/>
                    <div>
                        <button id="cancelEditPhone">Cancel</button>
                        <button id="confirmEditPhone">Confirm</button>
                    </div>
                </div>
            </div>

            {/* modal for delete account */}
            <div id="deleteAccountModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>Delete Account?</p>
                    <p>If you delete your account, all data associated with it will be lost.</p>
                    <div>
                        <button id="cancelDeleteAccount">Cancel</button>
                        <button id="confirmDeleteAccount">Confirm</button>
                    </div>
                </div>
            </div>

            {/* error alert */}

            {/* reset password alert */}
        </>
    );
}

export default Account;
