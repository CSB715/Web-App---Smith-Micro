import type { DocumentData } from "firebase/firestore"
import { useRef } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { getDb, getAuthInstance, GetUserDevices } from "../utils/firestore";
import { showErrorModal } from "./ErrorAlert";
import "../styles/Modal.css";

function closeModal() {
    const modal = document.getElementById("renameDeviceModal");
    const newDeviceNameInput = document.getElementById("newDeviceName") as HTMLInputElement;
    modal!.style.display = "none";
    newDeviceNameInput.value = ""
}

function renameDevice(currDevice : DocumentData, updateDevices : (data : Array<DocumentData>) => void) {
    const newDeviceNameInput = document.getElementById("newDeviceName") as HTMLInputElement;
    const newName = newDeviceNameInput.value.trim();
    if (newName.trim() === "") {
        console.log("New device name cannot be empty.");
        return;
    }

    const docRef = doc(getDb(), "Users", getAuthInstance().currentUser!.uid, "Devices", currDevice.id);
    updateDoc(docRef, { name: newName })
    .then(async () => {
        closeModal()
        GetUserDevices(doc(getDb(), "Users", getAuthInstance().currentUser!.uid)).then((docArr) => {
            updateDevices(docArr);
        })
    })
    .catch((error) => {
        console.error("Error renaming device: ", error);
        closeModal();
        showErrorModal();
    });
}

type Props = {
    currDevice : DocumentData | null,
    updateDevices : (data: Array<DocumentData>) => void
}

function handleEnter(event: React.KeyboardEvent<HTMLInputElement>, currDevice: DocumentData, updateDevices: (data: Array<DocumentData>) => void) {
    if (event.key === "Enter") {
        event.preventDefault();
        console.log(currDevice)
        renameDevice(currDevice!, updateDevices);
    }
}

export default function RenameDeviceModal({ currDevice, updateDevices } : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);
    
    return (
        <div id="renameDeviceModal" className="modal"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeModal()}}> 
            <div className="modal-content">
                <span className="close" onClick={() => closeModal()}>&times;</span>
                <p>Rename {currDevice?.name}?</p>
                <input type="text" id="newDeviceName" placeholder="New Name" onKeyDown={(e) => handleEnter(e, currDevice!, updateDevices)}/>
                <br/>
                <div>
                    <button id="cancelRenameDevice" onClick={() => closeModal()}>Cancel</button>
                    <button id="confirmRenameDevice" onClick={() => renameDevice(currDevice!, updateDevices)}>Confirm</button>
                </div>
            </div>
        </div>
    )
}