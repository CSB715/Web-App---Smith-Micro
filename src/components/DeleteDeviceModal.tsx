import type { DocumentData } from "firebase/firestore";
import { useRef } from "react";
import { showErrorModal } from "./ErrorAlert";
import { doc, deleteDoc } from "firebase/firestore";
import { getDb, getAuthInstance, GetUserDevices, DeleteCollection } from "../utils/firestore";
import "../styles/Modal.css";


type Props = {
    currDevice : DocumentData | null,
    updateDevices : (data: Array<DocumentData>) => void
}

function closeModal() {
    const modal = document.getElementById("deleteDeviceModal");
    modal!.style.display = "none";
}

function deleteDevice(currDevice : DocumentData, updateDevices : (data: Array<DocumentData>) => void) {
    const docRef = doc(getDb(), "Users", getAuthInstance().currentUser!.uid, "Devices", currDevice.id);

    DeleteCollection(docRef.path + "/Visits").then(() => {
        deleteDoc(docRef)
        .then(async () => {
            closeModal()
            GetUserDevices(doc(getDb(), "Users", getAuthInstance().currentUser!.uid)).then((docArr) => {
                updateDevices(docArr)
            });
        })
        .catch((error) => {
            console.error("Error removing device: ", error);
            closeModal()
            showErrorModal();                // show error modal
        });
    });
}

export default function DeleteDeviceModal({ currDevice, updateDevices } : Props) {
    const overlayRef = useRef<HTMLDivElement | null>(null);

    return (
        <div id="deleteDeviceModal" className="modal"
        ref={overlayRef}
        onClick={(e) => {if (e.target === overlayRef.current) closeModal()}}> 
            <div className="modal-content">
                <span className="close" onClick={() => closeModal()}>&times;</span>
                <p>Delete {currDevice?.name}?</p>
                <p>If you delete this device, all data associated with it will be lost.</p>
                <div>
                    <button id="cancelDeleteDevice" onClick={() => closeModal()}>Cancel</button>
                    <button id="confirmDeleteDevice" onClick={() => deleteDevice(currDevice!, updateDevices)}>Confirm</button>
                </div>
            </div>
        </div>
    )

}