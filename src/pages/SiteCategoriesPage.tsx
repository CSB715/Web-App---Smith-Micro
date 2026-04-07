import "../styles/Page.css";
import { getAuthInstance, GetUserRef, GetUserOverrides } from "../utils/firestore";
import { useState, useRef, useEffect } from "react";
import AddSiteModal from "../components/AddSiteModal";
import SiteModal from "../components/SiteModal";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth"; 
import { Button, Box, Typography, CircularProgress, List, ListItem, ListItemButton } from "@mui/material";


async function loadOverrides(uid: string) {
  const userRef = await GetUserRef(uid);
  const sitesArr = await GetUserOverrides(userRef);
  const siteURLS = [];
  for (const site of sitesArr.docs) {
    siteURLS.push(site.id);
  }
  return siteURLS;
}

function SiteCategories() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [sites, setSites] = useState<string[]>([]);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteUrl, setSiteUrl] = useState("");
  const fetchedData = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uid, setUid] = useState<any>(null);

  useEffect(() => {
    if (!hasMounted.current) {
      fetchedData.current = false;
      onAuthStateChanged(getAuthInstance(), async (user) => {
        if (user) {
          setUid(user.uid);
          const siteURLS = await loadOverrides(user.uid);
          setSites(siteURLS);
          fetchedData.current = true;
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, []);

  return (
    <Box       
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        px: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2.5, mb: 3 }}>
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
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Box>
        <Typography
          variant="h1"
          id="Site-Categorization-title"
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
          Site Categorization
        </Typography>
      </Box>


      { !fetchedData.current && 
        <CircularProgress sx={{ justifySelf: "center", alignSelf: "center", mt: 2 }} />
      }

      <List aria-label="List of flagged sites">
        {sites.map((site) => (
          <ListItem key={site}>
            <ListItemButton 
              sx={{
                textTransform: "uppercase",
              }}
              key={site}
              onClick={() => {
                setSiteUrl(site);
                setSiteModalOpen(true);
              }}
            >
              <Typography variant="body1" >
                {site}
              </Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <br />

      <Button variant="contained" onClick={() => setModalOpen(true)}>Set Site Category</Button>


      {/* Modals */}
      <SiteModal
        url={siteUrl}
        isOpen={siteModalOpen}
        closeModal={async () => {setSites(await loadOverrides(uid)); setSiteModalOpen(false)}}
      />
      <AddSiteModal isOpen={modalOpen} closeModal={() => {setModalOpen(false)}} openSiteModal={(url: string) => {
        setSiteUrl(url);
        setSiteModalOpen(true);
      }} />
    </ Box>
  );
}

export default SiteCategories;
