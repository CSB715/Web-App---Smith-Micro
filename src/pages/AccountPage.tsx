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
import AddEmailModal from "../components/AddEmailModal";
import RenameDeviceModal from "../components/RenameDeviceModal";

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

    const updateDevices: (data: Array<DocumentData>) => void = (data) => {
        setDevices(data)
    }

    useEffect(() => {
        console.log(currDevice);
    }, [currDevice])

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
        setCurrDevice(devices.find(device => device.id === deviceId) || null);
        const modal = document.getElementById("renameDeviceModal");
        modal!.style.display = "block";
    }

    function handleAddEmail() {
        const modal = document.getElementById("addEmailModal");
        modal!.style.display = "block";
    }

    function handleDeleteEmail(email: string) {
        const emailArray = userData!.emails!;
        const filteredEmails = emailArray.filter(em => email !== em);
        updateDoc(userSnap!.ref, {emails : filteredEmails}).then(async () => {
            updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData);         // reload phone number display
        })
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
                        onClick={() => handleAddEmail()}>Edit</button>
                </div>

                <div>
                    <h3 style={{ marginBottom: "0" }}>Contact Emails</h3>
                    <table>
                        <tbody>
                            {userData?.emails?.map((email) => (
                                <tr key={email}>
                                    <td>{email}</td>
                                    <td><button onClick={() => handleDeleteEmail(email)}>Del</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            
                <button onClick={() => handleAddEmail()}>Add Contact Email</button>

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
                            <td>{device.name}</td>
                            <td><button onClick={() => handleDeleteDevice(device.id)}>Del</button></td>
                            <td><button onClick={()=> handleRenameDevice(device.id)}>Edit</button></td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <br />

                <button onClick={() => showDeleteAccountModal()}>Delete Account</button>
            </div>


            {/* modals for user dialog */}
            <div id="deleteDeviceModal" className="modal"> 
                <div className="modal-content">
                    <span className="close" >&times;</span>
                    <p>Delete {currDevice?.name}?</p>
                    <p>If you delete this device, all data associated with it will be lost.</p>
                    <div>
                        <button id="cancelDeleteDevice">Cancel</button>
                        <button id="confirmDeleteDevice">Confirm</button>
                    </div>
                </div>
            </div>

            <RenameDeviceModal currDevice={currDevice} updateDevices={updateDevices}/>

            <AddEmailModal updateUserData={updateUserData}/>

            <AddPhoneModal updateUserData={updateUserData}/>

            {userSnap && <DeleteAccountModal uid={userSnap!.ref.id}/>}

            <PasswordResetAlert />

            <ErrorAlert />

        </>
    );
}

export default Account;
