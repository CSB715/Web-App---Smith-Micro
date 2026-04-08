import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAuthInstance, getDb, GetDevices } from "../utils/firestore";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { Box, Divider, Typography, Pagination } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { collection, Timestamp } from "firebase/firestore";
import { type Notification } from "../utils/models";
import { type Device } from "../utils/models";
import { onSnapshot } from "firebase/firestore";

const PAGE_SIZE = 20;

type FirestoreNotification = {
  id: string;
  data: {
    siteUrl?: string;
    deviceName?: string;
    reason?: string;
    dateTime?: Timestamp | Date;
  };
};

function normalizeNotification(d: FirestoreNotification): Notification {
  const dateTime = (() => {
    if (!d.data.dateTime) return new Date(0);
    if (d.data.dateTime instanceof Date) return d.data.dateTime;
    try {
      return d.data.dateTime.toDate();
    } catch {
      return new Date(0);
    }
  })();

  return {
    id: d.id,
    siteUrl: d.data.siteUrl || "",
    deviceName: d.data.deviceName || "Unknown device",
    reason: d.data.reason || "No reason provided",
    dateTime,
  };
}

function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const notifsRef = collection(getDb(), "Users", userId, "Notifications");
    const unsubscribe = onSnapshot(notifsRef, (snapshot) => {
      const normalized = snapshot.docs
        .map((doc) => normalizeNotification({ id: doc.id, data: doc.data() }))
        .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
      setNotifications(normalized);
    });
    return unsubscribe;
  }, [userId]);

  return notifications;
}

function getTimeDifferenceString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (date.getTime() === 0) return "Unknown time";

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

function Notifications() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [page, setPage] = useState(1);
  const [modalUrl, setModalUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
        setAuthReady(true);
      } else {
        navigate("/login", { replace: true });
        setAuthReady(true);
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const devicesData = await GetDevices(userId!);
      const normalized: Device[] = devicesData.map((d) => ({
        id: d.id,
        name: d.data.name,
      }));
      setDevices(normalized);
      setSelectedDevices(normalized);
    }
    load();
  }, [userId]);

  const allNotifications = useNotifications(userId || "");

  const filteredNotifications = allNotifications.filter((n) => {
    if (selectedDevices.length === 0) return true;
    return selectedDevices.some(
      (d) => d.id === "__all__" || d.name === n.deviceName,
    );
  });

  const pageCount = Math.ceil(filteredNotifications.length / PAGE_SIZE);
  const paginatedNotifications = filteredNotifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [selectedDevices]);

  if (!authReady) return <p>Loading...</p>;

  return (
    <Box sx={{ paddingBottom: "72px", px: 2.5 }}>
      <Typography
        variant="h1"
        id="notification-title"
        sx={{
          fontSize: "2rem",
          mb: 3,
          fontWeight: "bold",
          color: "#01579b",
          textAlign: "center",
        }}
      >
        Notification History
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Device filter */}
      <Box
        sx={{ mb: 4 }}
        component="section"
        role="region"
        aria-label="device filter"
      >
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "black",
            display: "block",
            mb: 1.5,
          }}
        >
          Filter by device
        </Typography>
        <DeviceSelect
          devices={devices}
          selectedDevices={selectedDevices}
          setSelectedDevices={setSelectedDevices}
        />
      </Box>

      {/* Notification cards */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {paginatedNotifications.length === 0 ? (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            No notifications found.
          </Typography>
        ) : (
          paginatedNotifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                backgroundColor: "background.paper",
                border: "0.5px solid",
                borderColor: "divider",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
              }}
            >
              {/* Site URL — clickable to open modal, or placeholder if missing */}
              {notification.siteUrl ? (
                <Typography
                  variant="body2"
                  onClick={() => setModalUrl(notification.siteUrl)}
                  sx={{
                    color: "#1565c0",
                    fontWeight: 500,
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {notification.siteUrl}
                </Typography>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "text.disabled", fontStyle: "italic" }}
                >
                  Unknown site
                </Typography>
              )}

              {/* Timestamp + device */}
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.75, mb: 0.5 }}
              >
                {getTimeDifferenceString(notification.dateTime)} ago on{" "}
                <Box
                  component="span"
                  sx={
                    notification.deviceName === "Unknown device"
                      ? { color: "text.disabled", fontStyle: "italic" }
                      : {}
                  }
                >
                  {notification.deviceName}
                </Box>
              </Typography>

              {/* Reason */}
              <Typography
                variant="body2"
                sx={
                  notification.reason === "No reason provided"
                    ? { color: "text.disabled", fontStyle: "italic" }
                    : { color: "text.primary" }
                }
              >
                {notification.reason}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            color="primary"
          />
        </Box>
      )}

      {/* Single shared modal instance — only mounts when a URL is selected */}
      {modalUrl && (
        <SiteModal
          url={modalUrl}
          isOpen={true}
          closeModal={() => setModalUrl(null)}
        />
      )}
    </Box>
  );
}

export default Notifications;