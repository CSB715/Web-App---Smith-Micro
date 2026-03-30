import { useEffect, useState, useRef } from "react";
import "../styles/Page.css";
import {
  DocumentSnapshot,
  getDocs,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { getDb, getAuthInstance } from "../utils/firestore";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { Button, List, ListItem, ListItemText, Box, Typography } from "@mui/material";

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

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), (user) => {
        if (user) {
          getNotifications().then((notifs) => {
            setNotifications(notifs);
          });
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, []);

  const handleDeleteNotification = (notification: DocumentSnapshot) => {
    deleteDoc(notification.ref).then(async () => {
      setNotifications(await getNotifications());
    });
  };

  return (
    <>
      <Box sx={{ px: 2.5 }}>
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

      <Box component="section">
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id} sx={{ display: "flex", alignItems: "center" }} >
              <ListItemText sx={{ flex: 1, pl: 2 }} >
                {notification.data()!.name}
              </ListItemText>
              <Box sx={{ display: "flex", gap: 1, pr: 2, alignItems: 'center', justifyContent: 'center' }} >
                <Button sx={{
                  width: 80,
                  height: 30,
                  justifyContent: "center",
                }}
                  onClick={() =>
                    navigate("/settings/notifications/create-notification", { state : {notifID : notification.id } })
                  }
                  variant="outlined"
                >
                  Edit
                </Button>
                <Button sx={{ 
                  width: 80,
                  height: 30,
                  justifyContent: "center",
                 }}
                  onClick={() => handleDeleteNotification(notification)}
                  variant="outlined" color="error"
                >
                  Del
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>

      <Button variant="contained"
        onClick={() => navigate("/settings/notifications/create-notification", { state : {notifID : "" } })}
      >
        New Notification
      </Button>
    </>
  );
}

export default NotificationSettings;
