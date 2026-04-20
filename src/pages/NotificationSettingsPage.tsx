import { useEffect, useState, useRef } from "react";
import "../styles/Page.css";
import {
  DocumentSnapshot,
  getDocs,
  collection,
} from "firebase/firestore";
import { getDb, getAuthInstance } from "../utils/firestore";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { Button, List, ListItem, ListItemText, Box, Typography, CircularProgress } from "@mui/material";
import DeleteTriggerModal from "../components/DeleteTriggerModal";

async function getNotifications() {
  const snap = await getDocs(
    collection(getDb(), "Users", getAuthInstance().currentUser!.uid, "NotificationTriggers"),
  );
  return snap.docs;
}

function NotificationSettings() {
  const navigate = useNavigate();
  const hasMounted = useRef(false);
  const [notifications, setNotifications] = useState<DocumentSnapshot[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currTrigger, setCurrTrigger] = useState<DocumentSnapshot | null>(null);
  const fetchedData = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), (user) => {
        if (user) {
          fetchedData.current = false;
          getNotifications().then((notifs) => {
            setNotifications(notifs);
          });
          fetchedData.current = true;
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, []);

  return (
    <Box sx={{ px: 2.5, display: "flex", flexDirection: "column", height: "100%" }} >
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
        id="notification-settings-title"
        sx={{ 
          fontSize: "2rem",
          letterSpacing: "-0.02em",
          mb: 2,
          fontWeight: "bold",
          color: "#01579b",
          alignSelf: "center",
          textAlign: "center",
        }}
      >
        Notification Settings
      </Typography>

      <Button variant="contained" fullWidth
        onClick={() => navigate("/settings/notifications/create-notification", { state : {notifID : "" } })}
      >
        New Notification
      </Button>

      { !fetchedData.current && 
        <CircularProgress sx={{ justifySelf: "center", alignSelf: "center", mt: 2 }} />
      }

      <Box component="section">
        <List sx={{ px: { xs: 0, sm: 0 } }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                display: "flex",
                alignItems: "center",
                px: { xs: 0, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                gap: { xs: 1, sm: 0 },
              }}
            >
              <ListItemText
                sx={{
                  flex: 1,
                  pl: { xs: 0, sm: 2 },
                  pr: { xs: 1, sm: 0 },
                  m: 0,
                  "& .MuiListItemText-primary": {
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  },
                }}
              >
                {notification.data()!.name}
              </ListItemText>
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 0.75, sm: 1 },
                  pr: { xs: 0, sm: 2 },
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Button
                  sx={{
                    width: { xs: 56, sm: 80 },
                    minWidth: { xs: 56, sm: 64 },
                    height: 30,
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    navigate("/settings/notifications/create-notification", { state : {notifID : notification.id } })
                  }
                  variant="outlined"
                >
                  Edit
                </Button>
                <Button
                  sx={{
                    width: { xs: 56, sm: 80 },
                    minWidth: { xs: 56, sm: 64 },
                    height: 30,
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    justifyContent: "center",
                  }}
                  onClick={() => {setCurrTrigger(notification); setDeleteModalOpen(true)}}
                  variant="outlined" color="error"
                >
                  Del
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      <DeleteTriggerModal
        currTrigger={currTrigger}
        open={deleteModalOpen}
        onClose={async () => {
          setNotifications(await getNotifications());
          setDeleteModalOpen(false);
        }}
      />
    </Box>
  );
}

export default NotificationSettings;
