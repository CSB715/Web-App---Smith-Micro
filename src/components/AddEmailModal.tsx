import { useRef, useEffect } from "react";
import { auth, db, GetDoc, type UserData } from "../utils/firestore";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { showErrorModal } from "./ErrorAlert";
import "../styles/Modal.css";

function closeModal() {
    const modal = document.getElementById("addEmailModal");
    const newEmailInput = document.getElementById("newEmail") as HTMLInputElement;
    modal!.style.display = "none";
    newEmailInput.value = ""
}

function addEmail(updateUserData : (data : UserData) => void, isAccount : boolean) {
    const newEmailInput = document.getElementById("newEmail") as HTMLInputElement;
    const newEmail = newEmailInput.value.trim();
    if (newEmail.trim() === "") {
        console.log("New email cannot be empty.");
        return;
    }

    // TODO: email authentication to new address

    // change the auth email
    if (isAccount) {
        
    }

    // add new email to contact list
    const userDoc = doc(db, "Users", auth.currentUser!.uid)
    getDoc(userDoc).then((snap) => {
        updateDoc(snap.ref, { emails: arrayUnion(newEmailInput.value) })
        .then(async () => {
            closeModal()
            updateUserData((await GetDoc(snap!.ref.path))!.data as UserData);         // reload phone number display
        })
        .catch((error) => {
            console.error("Error adding email address: ", error);
            closeModal();
            showErrorModal();
        });
    })

}

type Props = {
    updateUserData : (data : UserData) => void,
    isAccount : boolean
}

export default function AddEmailModal( {updateUserData, isAccount} : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newEmailInput = document.getElementById("newEmail") as HTMLInputElement;

        newEmailInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addEmail(updateUserData, isAccount);
            }
        });
    }, []);

    return (
        <div id="addEmailModal" className="modal"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeModal()}}> 
            <div className="modal-content">
                <span className="close" onClick={() => closeModal()}>&times;</span>
                <p>New Email Address</p>
                <input type="text" id="newEmail" placeholder="joesmith@example.com"/>
                <br/>
                <div>
                    <button id="cancelEditEmail" onClick={() => closeModal()}>Cancel</button>
                    <button id="confirmEditEmail" onClick={() => addEmail(updateUserData, isAccount)}>Confirm</button>
                </div>
            </div>
        </div>
    )
}