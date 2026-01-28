import "./styles/App.css";
import { Routes, Route } from "react-router";
import Account from "./pages/AccountPage";
import CreateAccount from "./pages/CreateAccountPage";
import CreateNotification from "./pages/CreateNotificationPage";
import FlaggedSites from "./pages/FlaggedSitesPage";
import History from "./pages/HistoryPage";
import Notifications from "./pages/NotificationsPage";
import NotificationSettings from "./pages/NotificationSettingsPage";
import PasswordReset from "./pages/PasswordResetPage";
import Settings from "./pages/SettingsPage";
import SiteCategories from "./pages/SiteCategoriesPage";
import Summary from "./pages/SummaryPage";
import SignIn from "./mui-templates/sign-in/SignIn";
import SignUp from "./mui-templates/sign-up/SignUp";


const App = () => {
  return (
    <>
      <div className="app-viewport">
        <div className="app-container">
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
            <Route path="/settings/notifications/create-notification" element={<CreateNotification />} />
            
            {/* Authentication Pages */}
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/login" element={<SignIn />} /> 
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
