import "../styles/Page.css";
import { getAuthInstance, GetUserRef, GetUserOverrides } from "../utils/firestore";
import { useState, useRef, useEffect } from "react";
import AddSiteModal from "../components/AddSiteModal";
import SiteModal from "../components/SiteModal";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import { Box, Typography } from "@mui/material";

function showModal(modalId: string) {
  const modal = document.getElementById(modalId);
  modal!.style.display = "block";
}

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

  const showThisSiteModal = async (siteURL: string) => {
    setSites(prev =>
      prev.includes(siteURL) ? prev : [...prev, siteURL]
    );
  };


  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(getAuthInstance(), async (user) => {
        if (user) {
          const siteURLS = await loadOverrides(user.uid);
          setSites(siteURLS);
        } else {
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, []);

  return (
    <>
      <Box sx={{ px: 2.5 }}>
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
      </Box>
      <h1 className="title">Site Categories</h1>
      <hr className="divider" />

      <button onClick={() => showModal("addSite")}>Set Site Category</button>

      <br />

      {sites.map((site) => (
        <div key={site}>
          {site && getAuthInstance().currentUser ? (
            <SiteModal url={site} />
          ) : (
            <p>...</p>
          )}
        </div>
      ))}

      <AddSiteModal showThisModal={showThisSiteModal} />
    </>
  );
}

export default SiteCategories;
