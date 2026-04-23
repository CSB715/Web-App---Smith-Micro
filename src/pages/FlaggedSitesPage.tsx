import { useEffect, useState, useRef, use } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthInstance, GetOverrides, GetUserOverrides, GetUserRef } from "../utils/firestore";
import { useNavigate } from "react-router";
import type { Categorization } from "../utils/models";
import SiteModal from "../components/SiteModal";
import AddFlaggedSiteModal from "../components/AddFlaggedSiteModal";
import { deleteDoc, doc, type DocumentData } from "firebase/firestore";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

// function combineURLS(flaggedFromCats: Categorization[], flaggedFromOvers: Categorization[]) {
//   return flaggedFromCats.concat(
//     flaggedFromOvers.filter(
//       (site) => !flaggedFromCats.some((c) => c.siteUrl === site.siteUrl),
//     ),
//   );
// }

// function getFlaggedSitesFromCategorizations(catsData: {id: string, data: DocumentData}[]) {
//   return catsData
//   .filter((cat) => cat.data.is_flagged === true)
//   .map((cat) => ({
//     siteUrl: cat.id,
//     category: cat.data.category,
//     flagged_for: [],
//   }));
// }

function getFlaggedSitesFromOverrides(
  oversData: { id: string; data: DocumentData }[],
) {
  return oversData
    .filter(
      (override) =>
        "flagged_for" in override.data && override.data.flagged_for.length > 0,
    )
    .map((override) => ({
      siteUrl: override.id,
      category: override.data.category,
      flagged_for: override.data.flagged_for,
    }));
}

function useSites(
  fetchedData: React.RefObject<boolean>,
  userId: string,
  setFlaggedSites: (sites: Categorization[]) => void,
) {
  // Fetch both categorizations and overrides initially
  Promise.all([GetOverrides(userId)]).then(([oversData]) => {
    // const flaggedFromCats = getFlaggedSitesFromCategorizations(catsData);
    const flaggedFromOvers = getFlaggedSitesFromOverrides(oversData);

    // Combine and deduplicate by siteUrl
    // const combined = combineURLS(flaggedFromCats, flaggedFromOvers);

    setFlaggedSites(flaggedFromOvers);
    fetchedData.current = true;
  });
}

function FlaggedSites() {
  const navigate = useNavigate();
  const [flaggedSites, setFlaggedSites] = useState<Categorization[]>([]);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const fetchedData = useRef(false);
  const [uid, setUID] = useState<string>("");
  const [sites, setSites] = useState<string[]>([]);

  const closeSiteModal = () => {
    setSiteModalOpen(false);
  };
  const closeNewModal = () => {
    setNewModalOpen(false);
  };

  useEffect(() => {
    fetchedData.current = false;
    onAuthStateChanged(getAuthInstance(), async (user) => {
      if (user) {
        setUID(user.uid);
        useSites(fetchedData, user.uid, setFlaggedSites);
        const siteURLS = await loadOverrides(user.uid);
        setSites(siteURLS);
        fetchedData.current = true;
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  function reloadData() {
    useSites(fetchedData, uid, setFlaggedSites);
  }

  async function loadOverrides(uid: string) {
    const userRef = await GetUserRef(uid);
    const sitesArr = await GetUserOverrides(userRef);
    const siteURLS: string[] = [];
    for (const site of sitesArr.docs) {
      siteURLS.push(site.id);
    }
    return siteURLS;
  }

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
      <Box
        onClick={() => navigate("/settings")}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          color: "text.disabled",
          cursor: "pointer",
          mb: 1,
          transition: "opacity 0.15s ease",
          "&:hover": { opacity: 0.7 },
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Box>
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

      <Button
        variant="contained"
        color="primary"
        onClick={() => setNewModalOpen(true)}
      >
        Add Site
      </Button>

      {!fetchedData.current && (
        <CircularProgress
          sx={{ justifySelf: "center", alignSelf: "center", mt: 2 }}
        />
      )}

      <List aria-label="List of flagged sites">
        {flaggedSites.map((site) => (
          <ListItem
            key={site.siteUrl}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={async () =>  {
                  const uref = await GetUserRef(uid);
                  const siteRef = doc(uref, "Overrides", site.siteUrl);

                  deleteDoc(siteRef).then(async () => {
                  fetchedData.current = false;

                  useSites(fetchedData, uid, setFlaggedSites);
                  
                  });
                  

                  
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
          >
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
              <Typography variant="body1">
                {site.siteUrl.substring(0, 20) +
                  (site.siteUrl.length > 20 ? "..." : "")}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <AddFlaggedSiteModal
        isOpen={newModalOpen}
        closeModal={closeNewModal}
        reloadData={reloadData}
      />
      <SiteModal
        url={siteUrl}
        isOpen={siteModalOpen}
        closeModal={() => { reloadData(); closeSiteModal()}}
      />
    </Box>
  );
}

export default FlaggedSites;
