import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  getAuthInstance,
  GetCategorization,
  GetDevices,
  GetVisits,
} from "../utils/firestore";
import { useNavigate } from "react-router";
import { type Categorization, type Visit } from "../utils/models";
import { getDisplayUrl } from "../utils/urls";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { type Device } from "../utils/models";
import DeviceSelect from "../components/DeviceSelect";
import { LineChart, BarChart } from "@mui/x-charts";

function Summary() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState<7 | 30 | 90>(7);

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
    const [timePerCategoryCurr, setTimePerCategoryCurr] = useState<
      Record<string, number>
    >({});
    const [timePerCategoryPrev, setTimePerCategoryPrev] = useState<
      Record<string, number>
    >({});
    const [timePerSite, setTimePerSite] = useState<Record<string, number>>({});
    const [newSites, setNewSites] = useState<Set<string>>(new Set());
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices: Device[] = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));
        setDevices(normalizedDevices);
        setSelectedDevices(normalizedDevices);
      }

      load();
    }, [userId]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const visitsData = await Promise.all(
          selectedDevices
            .filter((d) => d.id !== "__all__")
            .map((d) => GetVisits(userId, d.id)),
        );

        const normalizedVisits: Visit[] = visitsData.flat().map((v) => ({
          id: v.id,
          siteUrl: getDisplayUrl(v.data.siteUrl).replace(/^www\./, ""), // remove www. for better display
          startDateTime: new Date(v.data.startDateTime),
          endDateTime: new Date(v.data.endDateTime),
        }));

        const timePerCategoryCurr: Record<string, number> = {};
        const timePerCategoryPrev: Record<string, number> = {};
        const timePerSite: Record<string, number> = {};
        const sitesVisitedCurr = new Set<string>();
        const sitesVisitedPrev = new Set<string>();

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeFrame);

        await Promise.all(
          normalizedVisits.map(async (visit) => {
            const timeSpent =
              visit.endDateTime.getTime() - visit.startDateTime.getTime();

            const categorizationData = await GetCategorization(visit.siteUrl);

            let normalizedCategorization: Categorization;

            if (categorizationData) {
              normalizedCategorization = {
                siteUrl: categorizationData.id,
                category: categorizationData.data.category,
                is_flagged: categorizationData.data.is_flagged,
              };
            } else {
              normalizedCategorization = {
                siteUrl: visit.siteUrl,
                category: ["Unknown"],
                is_flagged: false,
              };
            }

            if (visit.startDateTime >= cutoffDate) {
              normalizedCategorization.category.forEach((cat) => {
                timePerCategoryCurr[cat] =
                  (timePerCategoryCurr[cat] || 0) + timeSpent;
              });
              sitesVisitedCurr.add(visit.siteUrl);
              timePerSite[visit.siteUrl] =
                (timePerSite[visit.siteUrl] || 0) + timeSpent;
            } else {
              normalizedCategorization.category.forEach((cat) => {
                timePerCategoryPrev[cat] =
                  (timePerCategoryPrev[cat] || 0) + timeSpent;
              });
              sitesVisitedPrev.add(visit.siteUrl);
            }
          }),
        );
        const newSites = new Set<string>(
          [...sitesVisitedCurr].filter((x) => !sitesVisitedPrev.has(x)),
        );
        setTimePerCategoryCurr(timePerCategoryCurr);
        setTimePerCategoryPrev(timePerCategoryPrev);
        setTimePerSite(timePerSite);
        setNewSites(newSites);
      }

      load();
    }, [userId, timeFrame, selectedDevices]);
    return {
      timePerCategoryCurr,
      timePerSite,
      timePerCategoryPrev,
      newSites,
      devices,
      selectedDevices,
      setSelectedDevices,
    };
  }

  const {
    timePerCategoryCurr,
    timePerSite,
    timePerCategoryPrev,
    newSites,
    devices,
    selectedDevices,
    setSelectedDevices,
  } = useData();

  const chartData = [
    { day: "Monday", entertainment: 3 },
    { day: "Tuesday", entertainment: 5 },
    { day: "Wednesday", entertainment: 1 },
  ];

  return (
    <>
      <h1>Summary</h1>
      <DeviceSelect
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
      />
      <ToggleButtonGroup
        value={timeFrame}
        exclusive
        onChange={(_, newTimeFrame) => {
          if (newTimeFrame !== null) {
            setTimeFrame(newTimeFrame);
          }
        }}
      >
        <ToggleButton value={7}>7 Days</ToggleButton>
        <ToggleButton value={30}>30 Days</ToggleButton>
        <ToggleButton value={90}>90 Days</ToggleButton>
      </ToggleButtonGroup>
      <p>What's New</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Array.from(newSites).map((site) => (
            <li key={site}>{site}</li>
          ))}
        </ul>
      </Box>
      <p>Category Trends</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Object.entries(timePerCategoryCurr).map(([category, time]) => (
            <li key={category}>
              {category}: {(time / (1000 * 60 * 60)).toFixed(2)} hrs
              {time < timePerCategoryPrev[category] ? (
                <ArrowUpwardIcon />
              ) : time > timePerCategoryPrev[category] ? (
                <ArrowDownwardIcon />
              ) : null}
            </li>
          ))}
        </ul>
      </Box>
      <p>Top 5 Sites</p>
      <Box
        sx={{
          height: 300,
          backgroundColor: "#f0f0f0",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
          {Object.entries(timePerSite)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([site, time]) => (
              <li key={site}>
                {site}: {(time / (1000 * 60 * 60)).toFixed(2)} hrs
              </li>
            ))}
        </ul>
      </Box>
      <LineChart
        dataset={chartData}
        xAxis={[{ scaleType: "band", dataKey: "day" }]}
        series={[{ dataKey: "entertainment", label: "Entertainment" }]}
        width={500}
        height={300}
      />
    </>
  );
}

export default Summary;
