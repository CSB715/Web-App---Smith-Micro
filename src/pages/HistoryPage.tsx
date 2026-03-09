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

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

function History() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

  function sortVisitsByDate(visits: { [key: string]: Visit[] }) {
    return Object.fromEntries(
      Object.entries(visits).sort(([a], [b]) => b.localeCompare(a)),
    );
  }

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
    const [nameToIdMap, setNameToIdMap] = useState<{ [key: string]: string }>({});
    const [visits, setVisits] = useState<{ [key: string]: Visit[] }>({});
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

    useEffect(() => {
      if (!userId) return;
      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        const deviceNames = normalizedDevices.map((d) => d.name);
        setDevices(normalizedDevices);
        setSelectedDevices(deviceNames);
        setNameToIdMap(
          Object.fromEntries(normalizedDevices.map((d) => [d.name, d.id])),
        );
      }
      load();
    }, [userId]);

    useEffect(() => {
      if (!userId || selectedDevices.length === 0 || Object.keys(nameToIdMap).length === 0) {
        return;
      }
      const unsubscribes: (() => void)[] = [];
      const visitsByDevice: Record<string, Visit[]> = {};

      selectedDevices.forEach((device) => {
        const deviceId = nameToIdMap[device];
        if (!deviceId) return;

        const visitsRef = collection(getDb(), "Users", userId, "Devices", deviceId, "Visits");
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

      return () => { unsubscribes.forEach((u) => u()); };
    }, [userId, selectedDevices, nameToIdMap]);

    return { devices, visits, selectedDevices, setSelectedDevices };
  }

  const { devices, visits, selectedDevices, setSelectedDevices } = useData();
  const totalVisits = Object.values(visits).flat().length;
  const totalDays = Object.keys(visits).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        py: 3,
        px: 0,
      }}
    >
      <Box sx={{ px: 2.5 }}>

        {/* ── Eyebrow ── */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              "@keyframes hpulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.4, transform: "scale(0.7)" },
              },
              animation: "hpulse 2.6s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "primary.main",
              fontSize: "0.6rem",
            }}
          >
            Browsing History
          </Typography>
        </Stack>

        {/* ── Title ── */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 300,
            letterSpacing: "-0.02em",
            mb: 3,
          }}  
        >
        Recent Web History
        </Typography>

        {/* ── Stats bar — stacks vertically on narrow, row on wider ── */}
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
            { value: selectedDevices.length, label: "Devices" },
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

        <Divider sx={{ mb: 3 }} />

        {/* ── Device filter ── */}
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
            devices={devices.map((d) => d.name)}
            selectedDevices={selectedDevices}
            setSelectedDevices={setSelectedDevices}
          />
        </Box>

      </Box>

      {/* ── Visit list — full bleed so cards touch the container edges ── */}
      {Object.keys(visits).length === 0 ? (
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
            const sortedValues = value.sort((a,b) => (b.startDateTime.getTime()-a.startDateTime.getTime()));
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
                      <SiteModal url={visit.siteUrl} userId={userId} />
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
                        {visit.startDateTime.getHours() + ":" + visit.startDateTime.getMinutes()}
                    </Typography>
                      
                    </ListItem>
                  ))}
                </List>
              </Paper>

            </Box>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default History;