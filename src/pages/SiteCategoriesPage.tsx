import "../styles/Page.css";
import { auth, GetUserRef, GetUserOverrides } from "../utils/firestore";
import { useState, useRef, useEffect } from "react";
import AddSiteModal from "../components/AddSiteModal";
import SiteModal from "../components/SiteModal";
import { useNavigate } from "react-router";
import { onAuthStateChanged } from "firebase/auth";

function showModal(modalId: string) {
  const modal = document.getElementById(modalId);
  modal!.style.display = "block";
}

function SiteCategories() {
  const hasMounted = useRef(false);
  const navigate = useNavigate();
  const [sites, setSites] = useState<string[]>([]);

  const updateSites: (site: string) => void = (site) => {
    setSites([...sites, site]);
  };

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User signed in:", user.uid);
          GetUserRef(user.uid).then((userRef) => {
            GetUserOverrides(userRef).then((sitesArr) => {
              const siteURLS = [];
              for (const site of sitesArr.docs) {
                siteURLS.push(site.id);
              }
              setSites(siteURLS);
            });
          });
        } else {
          console.log("no user currently signed in");
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
          {site && auth.currentUser ? (
            <SiteModal url={site} userId={auth.currentUser.uid} />
          ) : (
            <p>Unhappiness...</p>
          )}
        </div>
      ))}

      <AddSiteModal updateSites={updateSites} />
    </>
  );
}

export default SiteCategories;
