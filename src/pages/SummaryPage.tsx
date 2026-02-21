import { Box } from "@mui/material";
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

function Summary() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

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
    const [timePerCategory, setTimePerCategory] = useState<
      Record<string, number>
    >({});
    const [timePerSite, setTimePerSite] = useState<Record<string, number>>({});

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

        const timePerCategory: Record<string, number> = {};
        const timePerSite: Record<string, number> = {};

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

            normalizedCategorization.category.forEach((cat) => {
              timePerCategory[cat] = (timePerCategory[cat] || 0) + timeSpent;
            });
          }),
        );
        setTimePerCategory(timePerCategory);
        setTimePerSite(timePerSite);
      }

      load();
    }, [userId]);
    return { timePerCategory, timePerSite };
  }

  const { timePerCategory, timePerSite } = useData();

  return (
    <>
      <h1>Summary</h1>
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
          {Object.entries(timePerCategory).map(([category, time]) => (
            <li key={category}>
              {category}: {(time / (1000 * 60 * 60)).toFixed(2)} hrs
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
