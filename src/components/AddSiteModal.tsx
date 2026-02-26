import { useRef, useEffect } from "react";
import "../styles/Modal.css";
import { doc, DocumentSnapshot, getDoc } from "firebase/firestore";
import { db } from "../utils/firestore";
import { classifyURL } from "../utils/classifier";


function closeModal() {
    const modal = document.getElementById("addSite");
    const newSiteInput = document.getElementById("newSite") as HTMLInputElement;
    modal!.style.display = "none";
    newSiteInput.value = ""
}

async function addSite(showThisModal : (modalId : string) => void) {

    const newSiteInput = document.getElementById("newSite") as HTMLInputElement;
    const url = newSiteInput.value;

    // get site Categorization if exists
    let docSnap : DocumentSnapshot = await getDoc(doc(db, "Categorization", url));
    if (!docSnap.exists()) {
        console.log("No categorization found, classifying...");
        classifyURL(url);
        // at this point, the site should be in the database
        docSnap = await getDoc(doc(db, "Categorization", url));
    }

    // close this modal
    closeModal();
    // open site modal
    showThisModal(url);
}

type Props = {
    showThisModal : (modalId : string) => void
}

export default function AddSiteModal( { showThisModal } : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newSiteInput = document.getElementById("addSite") as HTMLInputElement;

        newSiteInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addSite(showThisModal);
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
                        <button id="confirmAddSite" onClick={() => addSite(showThisModal)}>Confirm</button>
                    </div>
                </div>
            </div>
        </>
    )
}