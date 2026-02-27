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

async function getNotifications() {
  const notifications: DocumentSnapshot[] = [];
  const snap = await getDocs(
    collection(getDb(), "Users", getAuthInstance().currentUser!.uid, "NotificationTriggers"),
  );
  for (const doc of snap.docs) {
    notifications.push(doc);
  }
  return notifications;
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
        <table>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td>{notification.data()!.name}</td>
                <td>
                  <button
                    onClick={() => handleDeleteNotification(notification)}
                  >
                    Del
                  </button>
                </td>
                <td>
                  <button
                    onClick={() =>
                      navigate("/settings/notifications/create-notification", { state : {notifID : notification.id } })
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate("/settings/notifications/create-notification", { state : {notifID : "" } })}
      >
        New Notification
      </button>
    </>
  );
}

export default NotificationSettings;
