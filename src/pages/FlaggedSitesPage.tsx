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
import { collection, onSnapshot } from "firebase/firestore";

function FlaggedSites() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");

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
          const flaggedFromCats = catsData
            .filter((cat) => cat.data.is_flagged === true)
            .map((cat) => ({
              siteUrl: cat.id,
              category: cat.data.category,
              is_flagged: cat.data.is_flagged,
            }));

          const flaggedFromOvers = oversData
            .filter((override) => override.data.flagged_for.length > 0)
            .map((override) => ({
              siteUrl: override.id,
              category: override.data.category,
              is_flagged: true,
            }));

          // Combine and deduplicate by siteUrl
          const combined = [...flaggedFromCats, ...flaggedFromOvers].filter(
            (site, index, arr) =>
              arr.findIndex((s) => s.siteUrl === site.siteUrl) === index,
          );

          setFlaggedSites(combined);
        },
      );

      // Set up listener for overrides changes
      const overridesRef = collection(getDb(), "Users", userId, "Overrides");
      const unsubscribe = onSnapshot(overridesRef, (snapshot) => {
        // Re-fetch categorizations or keep them? For simplicity, re-combine
        GetCategorizations().then((catsData) => {
          const flaggedFromCats = catsData
            .filter((cat) => cat.data.is_flagged === true)
            .map((cat) => ({
              siteUrl: cat.id,
              category: cat.data.category,
              is_flagged: cat.data.is_flagged,
            }));

          const flaggedFromOvers = snapshot.docs
            .map((doc) => ({ id: doc.id, data: doc.data() }))
            .filter((override) => override.data.flagged_for.length > 0)
            .map((override) => ({
              siteUrl: override.id,
              category: override.data.category,
              is_flagged: true,
            }));

          const combined = [...flaggedFromCats, ...flaggedFromOvers].filter(
            (site, index, arr) =>
              arr.findIndex((s) => s.siteUrl === site.siteUrl) === index,
          );

          setFlaggedSites(combined);
        });
      });

      return unsubscribe;
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
          </li>
        ))}
      </ul>
      <AddFlaggedSiteModal userId={userId} />
    </>
  );
}

export default FlaggedSites;
