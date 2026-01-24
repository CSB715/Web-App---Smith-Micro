import "../styles/Page.css";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, GetDoc, GetUserOverrides } from "../utils/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useRef, useEffect } from "react";

function addSite() {

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

    useEffect(() => {
        console.log(sites)
    }, [sites])

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

            <button onClick={() => addSite()}>Set Site Category</button>
            {/* Site Categories Page Content */}

            <br />

            {sites.map(site => (
                <p>{site}</p>
            ))}
        </>
    )
}

export default SiteCategories;