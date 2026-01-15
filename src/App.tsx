import "./App.css";
import { Routes, Route } from "react-router-dom";
import Account from "./components/AccountPage";
import CreateAccount from "./components/CreateAccountPage";
import CreateNotification from "./components/CreateNotificationPage";
import FlaggedSites from "./components/FlaggedSitesPage";
import History from "./components/HistoryPage";
import Login from "./components/LoginPage";
import Notifications from "./components/NotificationsPage";
import NotificationSettings from "./components/NotificationSettingsPage";
import PasswordReset from "./components/PasswordResetPage";
import Settings from "./components/SettingsPage";
import SiteCategories from "./components/SiteCategoriesPage";
import Summary from "./components/SummaryPage";


const App = () => {
  return (
    <>
      <Routes>

        {/* Main Pages */}
        <Route path="/" element={<Notifications />} /> {/* Default route */}
        <Route path="/summary" element={<Summary />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />


        {/* Settings Subpages */}
        <Route path="/settings/account" element={<Account />} />
        <Route path="/settings/flagged-sites" element={<FlaggedSites />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/site-categories" element={<SiteCategories />} />
        <Route path="/settings/create-notification" element={<CreateNotification />} />

        {/* Authentication Pages */}
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        
      </Routes>
    </>
  );
}

export default App;
