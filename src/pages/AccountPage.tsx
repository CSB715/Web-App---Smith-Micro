// Account Page Component
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  getDb,
  GetDoc,
  GetUserDevices,
  type UserData,
  getAuthInstance,
} from "../utils/firestore";
import {
  doc,
  getDoc,
  updateDoc,
  type DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged, sendPasswordResetEmail} from "firebase/auth";
import ErrorAlert from "../components/ErrorAlert";
import PasswordResetAlert from "../components/PasswordResetAlert";
import DeleteAccountModal from "../components/DeleteAccountModal";
import AddPhoneModal from "../components/AddPhoneModal";
import AddEmailModal from "../components/AddEmailModal";
import RenameDeviceModal from "../components/RenameDeviceModal";
import DeleteDeviceModal from "../components/DeleteDeviceModal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";


function Account() {
  const hasMounted = useRef(false);

  const navigate = useNavigate();
  const [userSnap, setUserSnap] = useState<DocumentSnapshot | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devices, setDevices] = useState<Array<DocumentData>>([]);
  const [currDevice, setCurrDevice] = useState<DocumentData | null>(null);
  const [isAccount, setIsAccount] = useState<boolean>(false);
  const [lastResetEmailDateTime, setLastResetEmailDateTime] = useState<number | null>(null);

  const updateUserData: (data: UserData) => void = (data) => {
    setUserData(data);
  };

  const updateDevices: (data: Array<DocumentData>) => void = (data) => {
    setDevices(data);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), (user) => {
        if (user) {
          getDoc(doc(getDb(), "Users", user.uid)).then((snap) => {
            setUserSnap(snap);
            setUserData(snap.data() as UserData);
            GetUserDevices(snap.ref).then((deviceArr) => {
              setDevices(deviceArr);
            });
          });
        } else {
          setUserData(null);
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, []);

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
      updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData);
    });
  }

  function handleDeletePhone(phone: string) {
    const phoneArray = userData!.phones!;
    const filteredPhones = phoneArray.filter((ph) => phone !== ph);
    updateDoc(userSnap!.ref, { phones: filteredPhones }).then(async () => {
      updateUserData((await GetDoc(userSnap!.ref.path))!.data as UserData);
    });
  }

  async function handleResetPassword() {
    const auth = getAuthInstance();
    try {
        if(lastResetEmailDateTime && new Date().getTime() - lastResetEmailDateTime < 120000) {
            const secondsLeft = Math.ceil((120000 - (new Date().getTime() - lastResetEmailDateTime)) / 1000);
            alert(`Please wait ${secondsLeft} seconds before sending another password reset email.`);
            return;
        }
        await sendPasswordResetEmail(auth, auth.currentUser!.email!);
        setLastResetEmailDateTime(new Date().getTime());
        showModal("resetPasswordAlert");
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
  }


  return (
    <Box sx={{ px: 0 }}>
      {/* ── Title ── */}
      <Box sx={{ px: 2.5, mb: 3 }}>
        <Typography
          variant="h1"
          id="account-title"
          sx={{
            fontSize: "2rem",
            mb: 2,
            fontWeight: "bold",
            color: "#01579b",
            alignSelf: "center",
            textAlign: "center",
          }}
        >
          Account
        </Typography>
      </Box>

      {/* ── Account Email ── */}
      <Box sx={{ px: 2.5, mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "text.primary",
            opacity: 0.55,
          }}
        >
          Account Email
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: "none", borderRight: "none", overflow: "hidden", bgcolor: "background.paper" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 2.5,
            py: 2,
          }}
        >
          <Box
            sx={{
              width: 38, height: 38, borderRadius: 2, flexShrink: 0,
              bgcolor: "primary.main", opacity: 0.9,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,7 12,13 2,7" />
            </svg>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 500, fontSize: "0.9rem", lineHeight: 1.2 }}>
              {getAuthInstance().currentUser?.email}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.primary", opacity: 0.55, fontSize: "0.68rem", fontFamily: "monospace", letterSpacing: "0.03em" }}>
              Primary login address
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() => {
              setIsAccount(true);
              showModal("addEmailModal");
            }}
          >
            Edit
          </Button>
        </Box>
      </Paper>

      {/* ── Contact Emails ── */}
      <Box sx={{ px: 2.5, mt: 3, mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "text.primary",
            opacity: 0.55,
          }}
        >
          Contact Emails
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: "none", borderRight: "none", overflow: "hidden", bgcolor: "background.paper" }}
      >
        {userData?.emails?.map((email, idx) => (
          <Box key={email}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 1.5,
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography sx={{ flex: 1, fontSize: "0.9rem" }}>
                {email}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ width: 80, height: 30, justifyContent: "center" }}
                onClick={() => handleDeleteEmail(email)}
              >
                Del
              </Button>
            </Box>
            {idx < (userData?.emails?.length ?? 0) - 1 && <Divider />}
          </Box>
        ))}
      </Paper>
      <Box sx={{ px: 2.5, mt: 1.5 }}>
        <Button
          variant="contained"
          onClick={() => {
            setIsAccount(false);
            showModal("addEmailModal");
          }}
        >
          Add Contact Email
        </Button>
      </Box>

      {/* ── Contact Phones ── */}
      <Box sx={{ px: 2.5, mt: 3, mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "text.primary",
            opacity: 0.55,
          }}
        >
          Contact Phones
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: "none", borderRight: "none", overflow: "hidden", bgcolor: "background.paper" }}
      >
        {userData?.phones?.map((phone, idx) => (
          <Box key={phone}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 1.5,
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography sx={{ flex: 1, fontSize: "0.9rem" }}>
                {phone}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ width: 80, height: 30, justifyContent: "center" }}
                onClick={() => handleDeletePhone(phone)}
              >
                Del
              </Button>
            </Box>
            {idx < (userData?.phones?.length ?? 0) - 1 && <Divider />}
          </Box>
        ))}
      </Paper>
      <Box sx={{ px: 2.5, mt: 1.5 }}>
        <Button
          variant="contained"
          onClick={() => showModal("addPhoneModal")}
        >
          Add Phone Number
        </Button>
      </Box>

      {/* ── Devices ── */}
      <Box sx={{ px: 2.5, mt: 3, mb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "text.primary",
            opacity: 0.55,
          }}
        >
          Devices
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: "none", borderRight: "none", overflow: "hidden", bgcolor: "background.paper" }}
      >
        {devices.map((device, idx) => (
          <Box key={device.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                px: 2.5,
                py: 2,
                transition: "background 0.15s ease",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Box
                sx={{
                  width: 38, height: 38, borderRadius: 2, flexShrink: 0,
                  bgcolor: "primary.main", opacity: 0.9,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </Box>

              <Typography sx={{ flex: 1, fontWeight: 500, fontSize: "0.9rem" }}>
                {device.name}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ width: 80, height: 30, justifyContent: "center" }}
                  onClick={() => handleRenameDevice(device.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  sx={{ width: 80, height: 30, justifyContent: "center" }}
                  onClick={() => handleDeleteDevice(device.id)}
                >
                  Del
                </Button>
              </Box>
            </Box>
            {idx < devices.length - 1 && <Divider />}
          </Box>
        ))}
      </Paper>

      {/* ── Account Actions ── */}
      <Divider sx={{ mt: 4, mb: 3 }} />
      <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        <Button variant="outlined" fullWidth onClick={() => handleResetPassword()}>
          Reset Password
        </Button>
        <Button variant="outlined" fullWidth onClick={() => getAuthInstance().signOut()}>
          Sign Out
        </Button>
        <Button variant="outlined" color="error" fullWidth onClick={() => showModal("deleteAccountModal")}>
          Delete Account
        </Button>
      </Box>

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
    </Box>
  );
}

export default Account;
