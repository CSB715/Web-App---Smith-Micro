import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  auth,
  GetCategorization,
  GetDevices,
  GetVisits,
} from "../utils/firestore";
import { useNavigate } from "react-router";
import { type Categorization, type Visit } from "../utils/models";
import { getDisplayUrl } from "../utils/urls";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

function Summary() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState<7 | 30 | 90>(7);

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

  function useData() {
    const [timePerCategoryCurr, setTimePerCategoryCurr] = useState<
      Record<string, number>
    >({});
    const [timePerCategoryPrev, setTimePerCategoryPrev] = useState<
      Record<string, number>
    >({});
    const [timePerSite, setTimePerSite] = useState<Record<string, number>>({});
    const [newSites, setNewSites] = useState<Set<string>>(new Set());

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalizedDevices = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));

        const visitsData = await Promise.all(
          normalizedDevices.map((d) => GetVisits(userId, d.id)),
        );

        const normalizedVisits: Visit[] = visitsData.flat().map((v) => ({
          siteUrl: getDisplayUrl(v.data.siteUrl).substring(4), // remove www. for better display
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

            timePerSite[visit.siteUrl] =
              (timePerSite[visit.siteUrl] || 0) + timeSpent;

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
    }, [userId, timeFrame]);
    return { timePerCategoryCurr, timePerSite, timePerCategoryPrev, newSites };
  }

  const { timePerCategoryCurr, timePerSite, timePerCategoryPrev, newSites } =
    useData();

  return (
    <>
      <h1>Summary</h1>
      <ToggleButtonGroup
        value={timeFrame}
        exclusive
        onChange={(_, newTimeFrame) => setTimeFrame(newTimeFrame)}
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
    </>
  );
}

export default Summary;
