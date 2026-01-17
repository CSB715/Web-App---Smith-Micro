// Settings Page Component
import "../styles/Settings.css";
import { Link } from "react-router";

function Settings() {

    // -------------
    // Flagged Sites
    // -------------
    // Site Categories
    // -------------
    // Notifications
    // -------------
    // Account
    // -------------
    // 
    // Nav Bar


    return (
        <>
            <h1 className="settings-title">Settings</h1>
            <hr className="title-divider" />
            <div className="settings-links">
                <Link to="/settings/flagged-sites"> <h2>Flagged Sites</h2></Link>
                <hr className="title-divider" />
                <Link to="/settings/site-categories"> <h2>Site Categories</h2></Link>
                <hr className="title-divider" />
                <Link to="/settings/notifications"> <h2>Notifications</h2></Link>
                <hr className="title-divider" />
                <Link to="/settings/account"> <h2>Account</h2></Link>
                <hr className="title-divider" />
            </div>
            
        </>
    )
}

export default Settings;