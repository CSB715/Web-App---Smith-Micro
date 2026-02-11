// Flagged Sites Page Component
// STUB
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, GetCategorizations } from "../utils/firestore";
import { useNavigate } from "react-router";
import type { Categorization } from "../utils/models";
import SiteModal from "../components/SiteModal";
import FlagIcon from "@mui/icons-material/Flag";
import AddFlaggedSiteModal from "../components/AddFlaggedSiteModal";

function FlaggedSites() {
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

  function useSites() {
    const [flaggedSites, setFlaggedSites] = useState<Categorization[]>([]);

    useEffect(() => {
      if (!userId) return;

      GetCategorizations().then((data) => {
        console.log(data);
        const flagged = data
          .filter((cat) => cat.data.isFlagged === true)
          .map((cat) => ({
            siteUrl: cat.id,
            categories: cat.data.categories,
            isFlagged: cat.data.isFlagged,
          }));
        console.log(flagged);
        setFlaggedSites(flagged);
      });

      // get overrides that are flagged
    }, [userId]);

    return flaggedSites;
  }

  const flaggedSites = useSites();

  return (
    <>
      <h1>Flagged Sites</h1>
      <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
        {flaggedSites.map((site) => (
          <li key={site.siteUrl}>
            <SiteModal url={site.siteUrl} userId={userId} />
            <FlagIcon htmlColor="red" />
          </li>
        ))}
      </ul>
      <AddFlaggedSiteModal userId={userId} />
    </>
  );
}

export default FlaggedSites;
