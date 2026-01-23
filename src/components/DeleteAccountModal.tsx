import { useRef } from "react";
import { DeleteUser } from "../utils/firestore";
import { showErrorModal } from "./ErrorAlert";
import "../styles/Modal.css";
import { useNavigate, type NavigateFunction } from "react-router";

function closeModal() {
    const modal = document.getElementById("deleteAccountModal");
    modal!.style.display = "none";
}

function onConfirm(uid : string, navigate : NavigateFunction) {    
    DeleteUser("Users/" + uid).then(() => {     // delete user in database and auth
        closeModal()
        navigate("/login", { replace: true }); // redirect to login page
    })
    .catch((error) => {
        console.log("Error Deleting User " + uid + ": " + error)
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