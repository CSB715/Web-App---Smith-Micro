// Settings Page Component
import { useEffect, useRef } from "react";
import "../styles/Page.css";
import { Link, useNavigate } from "react-router";
import NavBar from "../components/NavBar";
import { auth } from "../utils/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Settings() {
    const navigate = useNavigate();
    const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("User signed in:", user.uid);
        } else {
          console.log("no user currently signed in");
          navigate("/login", { replace: true });
        }
      });
      hasMounted.current = true;
    }
  }, [navigate]);
  return (
    <>
      <h1 className="title">Settings</h1>
      <hr className="divider" />
      <div className="settings-links">
        <Link to="/settings/flagged-sites">
          <h2>Flagged Sites</h2>
        </Link>
        <hr className="divider" />
        <Link to="/settings/site-categories">
          <h2>Site Categories</h2>
        </Link>
        <hr className="divider" />
        <Link to="/settings/notifications">
          <h2>Notifications</h2>
        </Link>
        <hr className="divider" />
        <Link to="/settings/account">
          <h2>Account</h2>
        </Link>
        <hr className="divider" />
      </div>
      <NavBar />
    </>
  );
}

export default Settings;
