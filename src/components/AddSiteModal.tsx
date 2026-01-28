import { useRef, useEffect } from "react";
import "../styles/Modal.css";
import { doc, DocumentSnapshot, getDoc } from "firebase/firestore";
import { db } from "../utils/firestore";


function closeModal() {
    const modal = document.getElementById("addSite");
    const newSiteInput = document.getElementById("newSite") as HTMLInputElement;
    modal!.style.display = "none";
    newSiteInput.value = ""
}

async function addSite(updateSites : (site : string) => void) {

    const newSiteInput = document.getElementById("newSite") as HTMLInputElement;

    updateSites(newSiteInput.value);

    // get site Categorization if exists
    const docSnap : DocumentSnapshot = await getDoc(doc(db, "Categorization", newSiteInput.value));
    if (!docSnap.exists()) {
        // TODO: query classifier to get results
    }

    // close this modal
    closeModal();

    // open Site Modal with this site
}

type Props = {
    updateSites : (site : string) => void
}

export default function AddSiteModal( { updateSites } : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newSiteInput = document.getElementById("addSite") as HTMLInputElement;

        newSiteInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addSite(updateSites);
            }
        });
    }, []);

    return (
        <>
            <div id="addSite" className="modal"
            ref={overlayRef}
            onClick={(e) => {if (e.target === overlayRef.current) closeModal()}}> 
                <div className="modal-content">
                    <span className="close" onClick={() => closeModal()}>&times;</span>
                    <p>Add New Site</p>
                    <input type="text" id="newSite" placeholder="example.com"/>
                    <br/>
                    <div>
                        <button id="cancelAddSite" onClick={() => closeModal()}>Cancel</button>
                        <button id="confirmAddSite" onClick={() => addSite(updateSites)}>Confirm</button>
                    </div>
                </div>
            </div>
        </>
    )
}