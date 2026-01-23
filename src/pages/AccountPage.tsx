// Account Page Component
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, GetDoc, GetUserDevices, CreateUser, type UserData, auth } from "../utils/firestore";
import { doc, getDoc, deleteDoc, updateDoc, type DocumentData, DocumentSnapshot } from "firebase/firestore";
import "../styles/Page.css";
import ErrorAlert, { showErrorModal } from "../components/ErrorAlert";
import PasswordResetAlert from "../components/PasswordResetAlert";
import DeleteAccountModal from "../components/DeleteAccountModal";
import AddPhoneModal from "../components/AddPhoneModal";

function Account() {
    const hasMounted = useRef(false);

    const navigate = useNavigate();
    const [userSnap, setUserSnap] = useState<DocumentSnapshot | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [devices, setDevices] = useState<Array<DocumentData>>([]);
    const [currDevice, setCurrDevice] = useState<DocumentData | null>(null);

    const updateUserData: (data: UserData) => void = (data) => {
        setUserData(data)
    }

    useEffect(() => {
        if (!hasMounted.current) {
            signInWithEmailAndPassword(auth, "spiderman@example.com", "spiders").then(() => {
            // CreateUser("spiderman@example.com", "spiders", "(333) 333-3333").then( () => {
            if (auth.currentUser!=null) {
                console.log(auth.currentUser.uid)
                getDoc(doc(db, "Users", auth.currentUser.uid)).then((snap) => {
                    setUserSnap(snap);
                    setUserData(snap.data() as UserData);
                    GetUserDevices(snap.ref).then( (deviceArr) => {
                        setDevices(deviceArr);
                    })
                })
            } else {
                console.log("no user currently signed in");
                setUserData(null);
                navigate("/login", { replace: true });
            }
            });
            hasMounted.current = true
        }
    }, []);

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
            const docRef = doc(db, userSnap!.ref.path, "userDevices", deviceId); // user!.uid

            deleteDoc(docRef)
            .then(async () => {
                console.log("Device successfully deleted!");
                modal!.style.display = "none";
                // reload device list
                setDevices(await GetUserDevices(userSnap!.ref));
            })
            .catch((error) => {
                console.error("Error removing device: ", error);
                modal!.style.display = "none";
                // show error modal
                showErrorModal();
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

            const docRef = doc(db, "Users", userSnap!.id, "userDevices", deviceId); // user!.uid

            updateDoc(docRef, { deviceName: newName })
            .then(async () => {
                console.log("Device successfully renamed!");
                modal!.style.display = "none";
                // reload device list
                setDevices(await GetUserDevices(userSnap!.ref))
            })
            .catch((error) => {
                console.error("Error renaming device: ", error);
                modal!.style.display = "none";
                showErrorModal();
            });
        }
    }

    function handleEditEmail(email?: string) {
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
            // trigger sending email to authenticate new address, then change after confirmation link is clicked
        }
    }

    function handleDeleteEmail(email: string) {

    }

    function handleAddPhone() {
        const modal = document.getElementById("addPhoneModal");
        modal!.style.display = "block";
    }

    function handleDeletePhone(phone: string) {
        const phoneArray = userData!.phones!;
        const filteredPhones = phoneArray.filter(ph => phone !== ph);
        updateDoc(userSnap!.ref, {phones : filteredPhones}).then(async () => {
            updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData);         // reload phone number display
        })
    }

    function showDeleteAccountModal() {
        const modal = document.getElementById("deleteAccountModal");
        modal!.style.display = "block";
    }

    function handleResetPassword() {
        const modal = document.getElementById("resetPasswordAlert");
        modal!.style.display = "block";     

        // TODO: trigger password reset email
    }

    return (
        <>
            <h1 className="title">Account</h1>
            <hr className="divider" />

            <div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <span>
                        <h3 style={{ marginBottom: "0" }}>Account Email</h3>
                        <p style={{ marginTop: "0" }}>{auth.currentUser?.email}</p>
                    </span>
                    <button style={{ marginLeft: "auto" }} 
                        onClick={() => handleEditEmail()}>Edit</button>
                </div>

                <div>
                    <h3 style={{ marginBottom: "0" }}>Contact Emails</h3>
                    <table>
                        <tbody>
                            {userData?.emails?.map((email) => (
                                <tr key={email}>
                                    <td>{email}</td>
                                    <td><button onClick={() => handleDeleteEmail(email)}>Del</button></td>
                                    <td><button onClick={()=> handleEditEmail(email)}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            
                <button onClick={() => handleEditEmail()}>Add Contact Email</button>

                <br />

                <div>
                    <h3 style={{ marginBottom: "0" }}>Contact Phones</h3>
                    <table>
                        <tbody>
                            {userData?.phones?.map((phone) => (
                                <tr key={phone}>
                                    <td>{phone}</td>
                                    <td><button onClick={() => handleDeletePhone(phone)}>Del</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            
                <button onClick={() => handleAddPhone()}>Add Phone Number</button>

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

                <button onClick={() => showDeleteAccountModal()}>Delete Account</button>
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
            <AddPhoneModal updateUserData={updateUserData}/>

            {/* modal for delete account */}
            {userSnap && <DeleteAccountModal uid={userSnap!.ref.id}/>}

            {/* reset password alert */}
            <PasswordResetAlert />

            {/* error alert */}
            <ErrorAlert />

        </>
    );
}

export default Account;
