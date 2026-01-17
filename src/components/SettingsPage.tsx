// Settings Page Component
import "../styles/Page.css";
import { Link } from "react-router";

function Settings() {

    return (
        <>
            <h1 className="title">Settings</h1>
            <hr className="divider" />
            <div className="settings-links">
                <Link to="/settings/flagged-sites"> <h2>Flagged Sites</h2></Link>
                <hr className="divider" />
                <Link to="/settings/site-categories"> <h2>Site Categories</h2></Link>
                <hr className="divider" />
                <Link to="/settings/notifications"> <h2>Notifications</h2></Link>
                <hr className="divider" />
                <Link to="/settings/account"> <h2>Account</h2></Link>
                <hr className="divider" />
            </div>
            
        </>
    )
}

export default Settings;