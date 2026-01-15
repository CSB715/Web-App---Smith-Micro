// Settings Page Component
// STUB

import { Link } from "react-router";

function Settings() {


    // Page Name
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
            <h1>Settings Page</h1>
            <hr></hr>
            <Link to="/settings/flagged-sites">Flagged Sites</Link>
            <hr></hr>
            <Link to="/settings/site-categories">Site Categories</Link>
            <hr></hr>
            <Link to="/settings/notifications">Notifications</Link>
            <hr></hr>
            <Link to="/settings/account">Account</Link>
        </>
    )
}

export default Settings;