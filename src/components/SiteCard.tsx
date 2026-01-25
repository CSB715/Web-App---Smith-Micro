import "../styles/Card.css";
import { auth } from "../utils/firestore";
import SiteModal from "./SiteModal";

function showSiteModal() {

}

type Props = {
    url : string
}

export default function SiteCard({ url } : Props) {
    return (
        <>
            <div className="card">
                <div className="container" onClick={() => showSiteModal()}>
                    <h4><b>{url}</b></h4>
                </div>
            </div>

            <SiteModal url={url} user_id={auth.currentUser!.uid}/>
        </>
    )
}