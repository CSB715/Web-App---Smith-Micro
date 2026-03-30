import { getDb, getAuthInstance, GetDevices } from "../utils/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import SiteModal from "../components/SiteModal";
import DeviceSelect from "../components/DeviceSelect";
import { onAuthStateChanged } from "firebase/auth";
import { type Device, type Visit } from "../utils/models";
import { onSnapshot } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { getDisplayUrl } from "../utils/urls";
import {
  Button,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
} from "@mui/material";

function sortVisitsByDate(visits: { [key: string]: Visit[] }) {
  return Object.fromEntries(
    Object.entries(visits).sort(([a], [b]) => b.localeCompare(a)),
  );
}

function History() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");

  const closeModal = () => {
    setModalOpen(false);
  };

  function groupVisitsByDate(visits: Visit[]) {
    return visits.reduce<Record<string, Visit[]>>((acc, visit) => {
      const key = visit.startDateTime.toISOString().split("T")[0];
      acc[key] ??= [];
      acc[key].push(visit);
      return acc;
    }, {});
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/login", { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  function useData() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        let normalizedDevices: Device[] = [];
        try {
          const devicesData = await GetDevices(userId);
          normalizedDevices = devicesData.map((d) => ({
            id: d.id,
            name: d.data.name,
          }));
        } catch {
          console.error("Unable to load devices");
        }

        setDevices(normalizedDevices);
        setSelectedDevices(normalizedDevices); // select all by default
      }
      load();
    }, [userId]);

    useEffect(() => {
      // if there are no selected devices we should clear the visits
      if (selectedDevices.length === 0) {
        setVisits({});
        return;
      }

      if (!userId) return;

      const unsubscribes: (() => void)[] = [];
      const visitsByDevice: Record<string, Visit[]> = {};

      selectedDevices
        .filter((d) => d.id !== "__all__")
        .forEach((device) => {
          const deviceId = device.id;
          if (!deviceId) return;

          const visitsRef = collection(
            getDb(),
            "Users",
            userId,
            "Devices",
            deviceId,
            "Visits",
          );
          const unsubscribe = onSnapshot(visitsRef, (snapshot) => {
            const deviceVisits: Visit[] = snapshot.docs.map((doc) => ({
              id: doc.id,
              siteUrl: getDisplayUrl(doc.data().siteUrl).replace(/^www\./, ""),
              startDateTime: new Date(doc.data().startDateTime),
              endDateTime: new Date(doc.data().endDateTime),
            }));
            visitsByDevice[deviceId] = deviceVisits;
            const combined = Object.values(visitsByDevice).flat();
            setVisits(sortVisitsByDate(groupVisitsByDate(combined)));
          });
          unsubscribes.push(unsubscribe);
        });

      return () => {
        unsubscribes.forEach((u) => u());
      };
    }, [userId, selectedDevices]);

    return { devices, visits, selectedDevices, setSelectedDevices };
  }

  const { devices, visits, selectedDevices, setSelectedDevices } = useData();
  const totalVisits = Object.values(visits).flat().length;
  const totalDays = Object.keys(visits).length;

  function getStatsBar() {
    return (
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexDirection: "row",
          bgcolor: "primary.main",
          borderRadius: 2.5,
          overflow: "hidden",
          mb: 3.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
        }}
      >
        {[
          { value: totalVisits, label: "Visits" },
          { value: totalDays, label: "Days" },
          {
            value: selectedDevices.some((d) => d.id === "__all__")
              ? selectedDevices.length - 1
              : selectedDevices.length,
            label: "Devices",
          },
        ].map((stat, i) => (
          <Box
            key={stat.label}
            sx={{
              flex: 1,
              px: 1.5,
              py: 2,
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.18)" : "none",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 300,
                color: "#fff",
                lineHeight: 1,
                mb: 0.5,
              }}
            >
              {stat.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }

  function getDeviceFilter() {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "text.primary",
            opacity: 0.6,
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
    );
  }

  function getVisits() {
    return Object.keys(visits).length === 0 ? (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.62rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.disabled",
          }}
        >
          No visits to display
        </Typography>
      </Box>
    ) : (
      <List disablePadding>
        {Object.entries(visits).map(([key, value]: [string, Visit[]]) => {
          const sortedValues = value.sort(
            (a, b) => b.startDateTime.getTime() - a.startDateTime.getTime(),
          );
          return (
            <Box key={key} sx={{ mb: 3 }}>
              {/* Day header — padded to match content */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0.75, px: 2.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "text.primary",
                    opacity: 0.55,
                    whiteSpace: "nowrap",
                  }}
                >
                  {key}
                </Typography>
                <Divider flexItem sx={{ flex: 1, alignSelf: "center" }} />
                <Chip
                  label={value.length}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: "0.55rem",
                    fontFamily: "monospace",
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              </Stack>

              {/* Card — full bleed, no horizontal margin */}
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 0,
                  borderLeft: "none",
                  borderRight: "none",
                  overflow: "hidden",
                  bgcolor: "background.paper",
                }}
              >
                <List disablePadding>
                  {sortedValues.map((visit: Visit, idx: number) => (
                    <ListItem
                      key={visit.id}
                      disablePadding
                      divider={idx < value.length - 1}
                      sx={{
                        "&:hover": { bgcolor: "action.hover" },
                        transition: "background 0.15s ease",
                      }}
                    >
                      <Button
                        onClick={() => {
                          setSiteUrl(visit.siteUrl);
                          setModalOpen(true);
                        }}
                      >
                        {visit.siteUrl}
                      </Button>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "text.primary",
                          opacity: 0.55,
                          whiteSpace: "nowrap",
                          marginLeft: "auto",
                          marginRight: "5%",
                        }}
                      >
                        {visit.startDateTime.getHours() +
                          ":" +
                          visit.startDateTime.getMinutes()}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          );
        })}
      </List>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 0,
      }}
    >
      <Box sx={{ px: 2.5 }}>
        {/* ── Title ── */}
        <Typography
          variant="h1"
          id="History-title"
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
          Web History
        </Typography>

        {getStatsBar()}

        <Divider sx={{ mb: 3 }} />

        {getDeviceFilter()}
      </Box>

      {getVisits()}

      <SiteModal url={siteUrl} isOpen={modalOpen} closeModal={closeModal} />
    </Box>
  );
}

export default History;
