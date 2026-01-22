import { useRef } from "react";
import { getAuth } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firestore";
import { showErrorModal } from "./ErrorAlert";
import "../styles/Modal.css";
import { useNavigate, type NavigateFunction } from "react-router";

function closeModal() {
    const modal = document.getElementById("deleteAccountModal");
    modal!.style.display = "none";
}

function onConfirm(uid : string, navigate : NavigateFunction) {

    console.log("Confirmed account deletion");
    
    // sign out
    const auth = getAuth();
    auth.signOut().then(() => {
        console.log("User signed out");

        // then delete user document
        deleteDoc(doc(db, "Users", uid))
        .then(() => {
            closeModal()
            // redirect to login page
            navigate("/login", { replace: true });
        })
        .catch((error) => {
            closeModal();
            showErrorModal();
        });
    }).catch((error) => {
        console.error("Error signing out: ", error);
        closeModal();
        showErrorModal();
    });
}

type Props = {
    uid: string
}

function DeleteAccountModal({uid} : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    return (
        <div id="deleteAccountModal" className="modal"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeModal(); }}> 
            <div className="modal-content">
                <span className="close" onClick={() => closeModal()}>&times;</span>
                <p>Delete Account?</p>
                <p>If you delete your account, all data associated with it will be lost.</p>
                <div>
                    <button id="cancelDeleteAccount" onClick={() => closeModal()}>Cancel</button>
                    <button id="confirmDeleteAccount" onClick={() => onConfirm(uid, navigate)}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountModal;