import { useEffect, useRef } from "react";
import { auth, db, GetDoc, type UserData } from "../utils/firestore";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { showErrorModal } from "./ErrorAlert";

function closeModal() {
    const modal = document.getElementById("addPhoneModal");
    modal!.style.display = "none";
}

function addPhone(updateUserData : (data : UserData) => void ) {
    const newPhoneInput = document.getElementById("newPhone") as HTMLInputElement;

    const newPhone = newPhoneInput.value.trim();
    if (newPhone.trim() === "") {
        console.log("New phone number cannot be empty.");
        return;
    }

    const userDoc = doc(db, "Users", auth.currentUser!.uid)
    const userDocRef = getDoc(userDoc).then((snap) => {
        updateDoc(snap.ref, { phones: arrayUnion(newPhoneInput.value) })
        .then(async () => {
            closeModal()
            updateUserData((await GetDoc(snap!.ref.path))!.data as UserData);         // reload phone number display
        })
        .catch((error) => {
            console.error("Error updating phone number: ", error);
            closeModal();
            showErrorModal();
        });
    })
    
    

}

type Props = {
    updateUserData : (data : UserData) => void
}

export default function AddPhoneModal( { updateUserData } : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newPhoneInput = document.getElementById("newPhone") as HTMLInputElement;

        newPhoneInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                addPhone(updateUserData);
            }
        });
    }, []);

    return (
        <div id="addPhoneModal" className="modal"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeModal()}}> 
            <div className="modal-content">
                <span className="close" onClick={() => closeModal()}>&times;</span>
                <p>New Phone Number</p>
                <input type="text" id="newPhone" placeholder="(555) 555-5555"/>
                <br/>
                <div>
                    <button id="cancelAddPhone" onClick={() => closeModal()}>Cancel</button>
                    <button id="confirmAddPhone" onClick={() => addPhone(updateUserData)}>Confirm</button>
                </div>
            </div>
        </div>
    );
}