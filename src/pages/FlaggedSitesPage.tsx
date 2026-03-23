import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  getAuthInstance,
  GetCategorizations,
  getDb,
  GetOverrides,
} from "../utils/firestore";
import { useNavigate } from "react-router";
import type { Categorization } from "../utils/models";
import SiteModal from "../components/SiteModal";
import AddFlaggedSiteModal from "../components/AddFlaggedSiteModal";
import { collection, onSnapshot, type DocumentData } from "firebase/firestore";
import { Typography, Box, List, ListItem, CircularProgress } from "@mui/material";

function combineURLS(flaggedFromCats: Categorization[], flaggedFromOvers: Categorization[]) {
  return [...flaggedFromCats, ...flaggedFromOvers].filter(
    (site, index, arr) =>
      arr.findIndex((s) => s.siteUrl === site.siteUrl) === index,
  );
}

function getFlaggedSitesFromCategorizations(catsData: {id: string, data: DocumentData}[]) {
  return catsData
  .filter((cat) => cat.data.is_flagged === true)
  .map((cat) => ({
    siteUrl: cat.id,
    category: cat.data.category,
    is_flagged: cat.data.is_flagged,
  }));
}

function getFlaggedSitesFromOverrides(oversData: {id: string, data: DocumentData}[]) {
  return oversData
  .filter((override) => override.data.flagged_for.length > 0)
  .map((override) => ({
    siteUrl: override.id,
    category: override.data.category,
    is_flagged: true,
  }));
}

function FlaggedSites() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

  function useSites() {
    const [flaggedSites, setFlaggedSites] = useState<Categorization[]>([]);

    useEffect(() => {
      if (!userId) return;
      // Fetch both categorizations and overrides initially
      Promise.all([GetCategorizations(), GetOverrides(userId)]).then(
        ([catsData, oversData]) => {
          const flaggedFromCats = getFlaggedSitesFromCategorizations(catsData);
          const flaggedFromOvers = getFlaggedSitesFromOverrides(oversData);

          // Combine and deduplicate by siteUrl
          const combined = combineURLS(flaggedFromCats, flaggedFromOvers);

          setFlaggedSites(combined);
        },
      );

      // Set up listener for overrides changes
      const overridesRef = collection(getDb(), "Users", userId, "Overrides");
      const unsubscribe = onSnapshot(overridesRef, (snapshot) => {
        // Re-fetch categorizations or keep them? For simplicity, re-combine
        GetCategorizations().then((catsData) => {
          const flaggedFromCats = getFlaggedSitesFromCategorizations(catsData);

          const flaggedFromOvers = getFlaggedSitesFromOverrides(snapshot.docs);

          const combined = combineURLS(flaggedFromCats, flaggedFromOvers);

          setFlaggedSites(combined);
        });
      });
      return unsubscribe;
    }, [userId]);


    return flaggedSites;
  }

  const flaggedSites = useSites();

  return (
    <Box
      component="main"
      role="main"
      aria-labelledby="flagged-sites"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2.5,
      }}
    >
      <Typography
        variant="h1"
        id="flagged-sites-title"
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
        Flagged Sites
      </Typography>

      {loading && <CircularProgress />}

      <List style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {flaggedSites.map((site) => (
          <ListItem key={site.siteUrl}>
            <SiteModal url={site.siteUrl} userId={userId} />
          </ListItem>
        ))}
      </List>
      <AddFlaggedSiteModal userId={userId} />
    </Box>
  );
}

export default FlaggedSites;
