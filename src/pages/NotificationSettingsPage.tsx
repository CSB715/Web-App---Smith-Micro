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
import { Button, List, ListItem, ListItemText, Box } from "@mui/material";

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
      <h1 className="title">Notification Settings</h1>
      <hr className="divider" />

      <br />

      <div>
        <List>
          {notifications.map((notification) => (
            <ListItem key={notification.id} sx={{ display: "flex", alignItems: "stretch" }} >
              <ListItemText sx={{ flex: 1, pl: 2 }} >
                {notification.data()!.name}
              </ListItemText>
              <Box sx={{ display: "flex", gap: 1, pr: 2 }} >
                <Button sx={{
                  width: 80,
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
      </div>

      <Button variant="contained"
        onClick={() => navigate("/settings/notifications/create-notification", { state : {notifID : "" } })}
      >
        New Notification
      </Button>
    </>
  );
}

export default NotificationSettings;
