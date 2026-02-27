import "../styles/Page.css";
import { getAuthInstance, GetUserRef, GetUserOverrides } from "../utils/firestore";
import { useState, useRef, useEffect } from "react";
import AddSiteModal from "../components/AddSiteModal";
import SiteModal from "../components/SiteModal";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth"; 

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
      <h1 className="title">Site Categories</h1>
      <hr className="divider" />

      <button onClick={() => showModal("addSite")}>Set Site Category</button>

      <br />

      {sites.map((site) => (
        <div key={site}>
          {site && getAuthInstance().currentUser ? (
            <SiteModal url={site} userId={getAuthInstance().currentUser!.uid} />
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
