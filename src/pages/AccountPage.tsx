// Account Page Component
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  db,
  GetDoc,
  GetUserDevices,
  CreateUser,
  type UserData,
  auth,
} from "../utils/firestore";
import {
  doc,
  getDoc,
  updateDoc,
  type DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import "../styles/Page.css";
import ErrorAlert from "../components/ErrorAlert";
import PasswordResetAlert from "../components/PasswordResetAlert";
import DeleteAccountModal from "../components/DeleteAccountModal";
import AddPhoneModal from "../components/AddPhoneModal";
import AddEmailModal from "../components/AddEmailModal";
import RenameDeviceModal from "../components/RenameDeviceModal";
import DeleteDeviceModal from "../components/DeleteDeviceModal";
import NavBar from "../components/NavBar";

function Account() {
  const hasMounted = useRef(false);

  const navigate = useNavigate();
  const [userSnap, setUserSnap] = useState<DocumentSnapshot | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devices, setDevices] = useState<Array<DocumentData>>([]);
  const [currDevice, setCurrDevice] = useState<DocumentData | null>(null);
  const [isAccount, setIsAccount] = useState<boolean>(false);

  const updateUserData: (data: UserData) => void = (data) => {
    setUserData(data);
  };

  const updateDevices: (data: Array<DocumentData>) => void = (data) => {
    setDevices(data);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      signInWithEmailAndPassword(auth, "spiderman@example.com", "spiders").then(
        () => {
          // CreateUser("spiderman@example.com", "spiders", "(333) 333-3333").then( () => {
          if (auth.currentUser != null) {
            console.log(auth.currentUser.uid);
            getDoc(doc(db, "Users", auth.currentUser.uid)).then((snap) => {
              setUserSnap(snap);
              setUserData(snap.data() as UserData);
              GetUserDevices(snap.ref).then((deviceArr) => {
                setDevices(deviceArr);
              });
            });
          } else {
            console.log("no user currently signed in");
            setUserData(null);
            navigate("/login", { replace: true });
          }
        },
      );
      hasMounted.current = true;
    }
  }, []);

  /* button functions */
  function handleDeleteDevice(deviceId: string) {
    setCurrDevice(devices.find((device) => device.id === deviceId) || null);
    showModal("deleteDeviceModal");
  }

  function handleRenameDevice(deviceId: string) {
    setCurrDevice(devices.find((device) => device.id === deviceId) || null);
    showModal("renameDeviceModal");
  }

  function showModal(modalId: string) {
    const modal = document.getElementById(modalId);
    modal!.style.display = "block";
  }

  function handleDeleteEmail(email: string) {
    const emailArray = userData!.emails!;
    const filteredEmails = emailArray.filter((em) => email !== em);
    updateDoc(userSnap!.ref, { emails: filteredEmails }).then(async () => {
      updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData); // reload phone number display
    });
  }

  function handleDeletePhone(phone: string) {
    const phoneArray = userData!.phones!;
    const filteredPhones = phoneArray.filter((ph) => phone !== ph);
    updateDoc(userSnap!.ref, { phones: filteredPhones }).then(async () => {
      updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData); // reload phone number display
    });
  }

  function handleResetPassword() {
    showModal("resetPasswordAlert");

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
          <button
            style={{ marginLeft: "auto" }}
            onClick={() => {
              setIsAccount(true);
              showModal("addEmailModal");
            }}
          >
            Edit
          </button>
        </div>

        <div>
          <h3 style={{ marginBottom: "0" }}>Contact Emails</h3>
          <table>
            <tbody>
              {userData?.emails?.map((email) => (
                <tr key={email}>
                  <td>{email}</td>
                  <td>
                    <button onClick={() => handleDeleteEmail(email)}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => {
            setIsAccount(false);
            showModal("addEmailModal");
          }}
        >
          Add Contact Email
        </button>

        <br />

        <div>
          <h3 style={{ marginBottom: "0" }}>Contact Phones</h3>
          <table>
            <tbody>
              {userData?.phones?.map((phone) => (
                <tr key={phone}>
                  <td>{phone}</td>
                  <td>
                    <button onClick={() => handleDeletePhone(phone)}>
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={() => showModal("addPhoneModal")}>
          Add Phone Number
        </button>

        <br />

        <button onClick={() => handleResetPassword()}>Reset Password</button>

        <br />

        <p style={{ textAlign: "center" }}>Device List</p>

        <table>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td>{device.name}</td>
                <td>
                  <button onClick={() => handleDeleteDevice(device.id)}>
                    Del
                  </button>
                </td>
                <td>
                  <button onClick={() => handleRenameDevice(device.id)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />

        <button onClick={() => showModal("deleteAccountModal")}>
          Delete Account
        </button>
      </div>

      {/* modals for user dialog */}
      <DeleteDeviceModal
        currDevice={currDevice}
        updateDevices={updateDevices}
      />

      <RenameDeviceModal
        currDevice={currDevice}
        updateDevices={updateDevices}
      />

      <AddEmailModal updateUserData={updateUserData} isAccount={isAccount} />

      <AddPhoneModal updateUserData={updateUserData} />

      {userSnap && <DeleteAccountModal uid={userSnap!.ref.id} />}

      <PasswordResetAlert />

      <ErrorAlert />

      <NavBar />
    </>
  );
}

export default Account;
