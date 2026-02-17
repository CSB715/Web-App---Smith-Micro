import { Box } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { use, useEffect, useState } from "react";
import { auth, GetDevices, GetVisits } from "../utils/firestore";
import { useNavigate } from "react-router";
import { type Visit } from "../utils/models";

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
    const [visits, setVisits] = useState<Visit[]>([]);

    useEffect(() => {
      if (!userId) return;

      async function load() {
        const devicesData = await GetDevices(userId);
        const normalized = devicesData.map((d) => ({
          id: d.id,
          name: d.data.name,
        }));

        const deviceVisits = await Promise.all(
          normalized.map((d) => GetVisits(userId, d.id)),
        );

        const normalizedVisits = deviceVisits.flat().map((v) => ({
          id: v.id,
          siteUrl: v.data.siteUrl,
          startDateTime: new Date(v.data.startDateTime),
          endDateTime: new Date(v.data.endDateTime),
        }));

        setVisits(normalizedVisits);
      }

      load();
    }, [userId]);
    return { visits };
  }

  const { visits } = useData();

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
          <li>Entertainment: 38 hrs</li>
          <li>Shopping: 20 hrs</li>
          <li>Education: 10 hrs</li>
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
        <p>Top Sites Placeholder</p>
      </Box>
    </>
  );
}

export default Summary;
