import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  getAuthInstance,
  GetCategorizations,
  GetOverrides,
} from "../utils/firestore";
import { useNavigate } from "react-router";
import type { Categorization } from "../utils/models";
import SiteModal from "../components/SiteModal";
import AddFlaggedSiteModal from "../components/AddFlaggedSiteModal";
import { type DocumentData } from "firebase/firestore";
import { Typography, Box, List, ListItem, ListItemButton, CircularProgress, Button } from "@mui/material";

function combineURLS(flaggedFromCats: Categorization[], flaggedFromOvers: Categorization[]) {
  return flaggedFromCats.concat(
    flaggedFromOvers.filter(
      (site) => !flaggedFromCats.some((c) => c.siteUrl === site.siteUrl),
    ),
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
  .filter((override) => 'flagged_for' in override.data && override.data.flagged_for.length > 0)
  .map((override) => ({
    siteUrl: override.id,
    category: override.data.category,
    is_flagged: true,
  }));
}

function useSites(userId: string, setFlaggedSites: (sites: Categorization[]) => void) {
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
}

function FlaggedSites() {
  const navigate = useNavigate();
  const [flaggedSites, setFlaggedSites] = useState<Categorization[]>([]);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const fetchedData = useRef(false)

  const closeSiteModal = () => {setSiteModalOpen(false);}
  const closeNewModal = () => {setNewModalOpen(false);}

  useEffect(() => {
    fetchedData.current = false;
    onAuthStateChanged(getAuthInstance(), (user) => {
      if (user) {
        useSites(user.uid, setFlaggedSites);
        fetchedData.current = true;
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);



  return (
    <Box
      component="main"
      role="main"
      aria-labelledby="flagged-sites"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 2.5,
        display: "flex",
        flexDirection: "column",
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

      { !fetchedData.current && 
        <CircularProgress sx={{ justifySelf: "center", alignSelf: "center", mt: 2 }} />
      }

      <List aria-label="List of flagged sites">
        {flaggedSites.map((site) => (
          <ListItem key={site.siteUrl}>
            <ListItemButton 
              sx={{
                textTransform: "uppercase",
              }}
              key={site.siteUrl}
              onClick={() => {
                setSiteUrl(site.siteUrl);
                setSiteModalOpen(true);
              }}
            >
              <Typography variant="body1" >
                {site.siteUrl}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="primary" onClick={() => setNewModalOpen(true)}>Add Site</Button>

      <AddFlaggedSiteModal isOpen={newModalOpen} closeModal={closeNewModal} />
      <SiteModal url={siteUrl} isOpen={siteModalOpen} closeModal={closeSiteModal} />
    </Box>
  );
}

export default FlaggedSites;
