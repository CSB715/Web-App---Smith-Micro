import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetNotifications, auth } from "../utils/firestore";
import SiteModal from "../components/SiteModal";
import { Box } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { type Notification } from "../utils/models";

type FirestoreNotification = {
  id: string;
  data: {
    siteUrl?: string;
    deviceName?: string;
    reason?: string;
    dateTime?: Timestamp | Date;
  };
};

function Notifications() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  function normalizeNotification(
    d: FirestoreNotification,
  ): Notification | null {
    if (
      !d.data.siteUrl ||
      !d.data.deviceName ||
      !d.data.reason ||
      !d.data.dateTime
    ) {
      return null;
    }

    return {
      id: d.id,
      siteUrl: d.data.siteUrl,
      deviceName: d.data.deviceName,
      reason: d.data.reason,
      dateTime:
        d.data.dateTime instanceof Date
          ? d.data.dateTime
          : d.data.dateTime.toDate(),
    };
  }

  function getTimeDifferenceString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs > 1000 * 60 * 60 * 24) {
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    }
    if (diffMs > 1000 * 60 * 60) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    }
    if (diffMs > 1000 * 60) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
    }
    return `${Math.floor(diffMs / 1000)} second${Math.floor(diffMs / 1000) !== 1 ? "s" : ""}`;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate]);

  function useNotifications(userId: string) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
      if (!userId) return;

      GetNotifications(userId).then((data) => {
        const normalized = data
          .map((n) => normalizeNotification(n))
          .filter((n): n is Notification => n !== null);

        setNotifications(normalized);
      });
    }, [userId]);

    return notifications;
  }

  const notifications = useNotifications(userId);

  return (
    <>
      <Box sx={{ paddingBottom: "72px" }}>
        <h1>Notification History</h1>
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {notifications.map((notification) => (
            <Box
              sx={{
                borderBottom: "3px solid #000",
                borderTop: "3px solid #000",
              }}
              key={notification.id}
            >
              <li key={notification.id}>
                <SiteModal url={notification.siteUrl} userId={userId} />
                <p>
                  {getTimeDifferenceString(notification.dateTime)} ago on{" "}
                  {notification.deviceName}
                </p>
                <p>{notification.reason}</p>
              </li>
            </Box>
          ))}
        </ul>
      </Box>
    </>
  );
}

export default Notifications;
