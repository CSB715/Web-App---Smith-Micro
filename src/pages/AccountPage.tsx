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
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};


function Account() {
  const hasMounted = useRef(false);

  const navigate = useNavigate();
  const [userSnap, setUserSnap] = useState<DocumentSnapshot | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [devices, setDevices] = useState<Array<DocumentData>>([]);
  const [currDevice, setCurrDevice] = useState<DocumentData | null>(null);
  const [isAccount, setIsAccount] = useState<boolean>(false);
  const [lastResetEmailDateTime, setLastResetEmailDateTime] = useState<number | null>(null);
  const [deleteDeviceOpen, setDeleteDeviceOpen] = useState(false);
  const [renameDeviceOpen, setRenameDeviceOpen] = useState(false);
  const [addEmailOpen, setAddEmailOpen] = useState(false);
  const [addPhoneOpen, setAddPhoneOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [resetAlertOpen, setResetAlertOpen] = useState(false);
  const [errorAlertOpen, setErrorAlertOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ type: "email" | "phone"; value: string } | null>(null);

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
    setDeleteDeviceOpen(true);
  }

  function handleRenameDevice(deviceId: string) {
    setCurrDevice(devices.find((device) => device.id === deviceId) || null);
    setRenameDeviceOpen(true);
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
        setResetAlertOpen(true);
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
  }


  return (
    <Box sx={{ px: 0 }}>
      {/* ── Title ── */}
      <Box sx={{ px: 2.5, mb: 3 }}>
        <Box
          onClick={() => navigate("/settings")}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            color: "text.disabled",
            cursor: "pointer",
            mb: 1,
            transition: "opacity 0.15s ease",
            "&:hover": { opacity: 0.7 },
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Box>
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
          </Box>

          <Button
            variant="outlined"
            size="small"
            sx={{ flexShrink: 0 }}
            onClick={() => {
              setIsAccount(true);
              setAddEmailOpen(true);
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
                onClick={() => setPendingDelete({ type: "email", value: email })}
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
            setAddEmailOpen(true);
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
                {phone.startsWith("+1") && phone.length === 12
                  ? `${phone.slice(2, 5)}-${phone.slice(5, 8)}-${phone.slice(8)}`
                  : phone.length === 10
                    ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
                    : phone}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ width: 80, height: 30, justifyContent: "center" }}
                onClick={() => setPendingDelete({ type: "phone", value: phone })}
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
          onClick={() => setAddPhoneOpen(true)}
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
        <Button variant="outlined" color="error" fullWidth onClick={() => setDeleteAccountOpen(true)}>
          Delete Account
        </Button>
      </Box>

      {/* ── Delete Contact Confirmation ── */}
      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography sx={{ fontWeight: "bold", fontSize: "1.5rem", mb: 1 }}>
            Are you sure you want to delete this {pendingDelete?.type}?
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            {pendingDelete?.type === "phone" && pendingDelete.value.startsWith("+1") && pendingDelete.value.length === 12
              ? `${pendingDelete.value.slice(2, 5)}-${pendingDelete.value.slice(5, 8)}-${pendingDelete.value.slice(8)}`
              : pendingDelete?.type === "phone" && pendingDelete.value.length === 10
                ? `${pendingDelete.value.slice(0, 3)}-${pendingDelete.value.slice(3, 6)}-${pendingDelete.value.slice(6)}`
                : pendingDelete?.value}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button variant="outlined" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                if (pendingDelete?.type === "email") handleDeleteEmail(pendingDelete.value);
                else if (pendingDelete?.type === "phone") handleDeletePhone(pendingDelete.value);
                setPendingDelete(null);
              }}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* modals for user dialog */}
      <DeleteDeviceModal
        currDevice={currDevice}
        updateDevices={updateDevices}
        open={deleteDeviceOpen}
        onClose={() => setDeleteDeviceOpen(false)}
        onError={() => setErrorAlertOpen(true)}
      />

      <RenameDeviceModal
        currDevice={currDevice}
        updateDevices={updateDevices}
        open={renameDeviceOpen}
        onClose={() => setRenameDeviceOpen(false)}
        onError={() => setErrorAlertOpen(true)}
      />

      <AddEmailModal
        updateUserData={updateUserData}
        isAccount={isAccount}
        open={addEmailOpen}
        onClose={() => setAddEmailOpen(false)}
        onError={() => setErrorAlertOpen(true)}
      />

      <AddPhoneModal
        updateUserData={updateUserData}
        open={addPhoneOpen}
        onClose={() => setAddPhoneOpen(false)}
        onError={() => setErrorAlertOpen(true)}
      />

      {userSnap && (
        <DeleteAccountModal
          uid={userSnap!.ref.id}
          open={deleteAccountOpen}
          onClose={() => setDeleteAccountOpen(false)}
          onError={() => setErrorAlertOpen(true)}
        />
      )}

      <PasswordResetAlert
        open={resetAlertOpen}
        onClose={() => setResetAlertOpen(false)}
      />

      <ErrorAlert
        open={errorAlertOpen}
        onClose={() => setErrorAlertOpen(false)}
      />
    </Box>
  );
}

export default Account;
