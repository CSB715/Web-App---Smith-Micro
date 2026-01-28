import "../styles/Page.css";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, GetDoc, GetUserOverrides } from "../utils/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import AddSiteModal from "../components/AddSiteModal";
import SiteModal from "../components/SiteModal";

function showModal(modalId : string) {
    const modal = document.getElementById(modalId);
    modal!.style.display = "block";
}

async function getUniqueSites() {
    const sites : Set<string> = new Set();

    const snap = await getDoc(doc(db, "Users", auth.currentUser!.uid));
    const overridesSnaps = await GetUserOverrides(snap.ref)
    for (const snap of overridesSnaps) {
        const overrides = snap.docs.map(d => d.ref);
        for (const override of overrides) {
            const doc = await GetDoc(override.path);
            sites.add(doc!.id);
        }
    }

    const array : string[] = Array.from(sites)
    return array;
}



function SiteCategories() {
    const hasMounted = useRef(false);
    const [sites, setSites] = useState<string[]>([]);

    const updateSites: (site: string) => void = (site) => {
        setSites([...sites, site]);
    }

    useEffect(() => {
        console.log(sites);
    }, [sites]);

    useEffect(() => {
        if (!hasMounted.current) {
            signInWithEmailAndPassword(auth, "spiderman@example.com", "spiders").then(() => {
                getUniqueSites().then((sitesArr) => {
                    setSites([...sitesArr]);
                });                
            });
            hasMounted.current = true
        }
    }, [])
    
    return (
        <>
            <h1 className="title">Site Categories</h1>
            <hr className="divider" />

            <button onClick={() => showModal("addSite")}>Set Site Category</button>

            <br />

            {sites.map(site => (
                <div key={site}>
                    {site && auth.currentUser ? (<SiteModal url={site} userId={auth.currentUser.uid}/>) : (<p>Unhappiness...</p>)}
                </div>
            ))}

            <AddSiteModal updateSites={updateSites}/>
        </>
    )
}

export default SiteCategories;