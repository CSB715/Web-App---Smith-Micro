import { useEffect, useState, useRef } from "react";
import "../styles/Page.css"
import { DocumentSnapshot, getDocs, collection, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../utils/firestore";
import { useNavigate, type NavigateFunction } from "react-router";

async function getNotifications() {
    const notifications : DocumentSnapshot[] = []
    const snap = await getDocs(collection(db, "Users", auth.currentUser!.uid, "Notifications"))
    for (const doc of snap.docs) {
        notifications.push(doc)
    }
    return notifications;
}

function NotificationSettings() {
    const navigate = useNavigate();
    const hasMounted = useRef(false);
    const [notifications, setNotifications] = useState<DocumentSnapshot[]>([]);

    useEffect(() => {
        if(!hasMounted.current) {
            signInWithEmailAndPassword(auth, "spiderman@example.com", "spiders").then(async () => {
                setNotifications(await getNotifications());
            });

            hasMounted.current = true
        }
    }, []);

    const handleDeleteNotification = (notification: DocumentSnapshot) => {
        deleteDoc(notification.ref).then(async () => {
            setNotifications( await getNotifications());
        });
    }


    const handleEditNotification = (notification: DocumentSnapshot, navigate: NavigateFunction) => {
        // redirect to Notification Create page and load current information
        navigate("/settings/notifications/create-notification");
    }


    return (
        <>
            <h1 className="title">Notification Settings</h1>
            <hr className="divider" />

            <br />

            <div>
                <table>
                    <tbody>
                        {notifications.map((notification) => (
                            <tr key={notification.id}>
                                <td>{notification.data()!.name}</td>
                                <td><button onClick={() => handleDeleteNotification(notification)}>Del</button></td>
                                <td><button onClick={()=> handleEditNotification(notification, navigate)}>Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={() => navigate("/settings/notifications/create-notification")}>New Notification</button>

        </>
    )
}

export default NotificationSettings;