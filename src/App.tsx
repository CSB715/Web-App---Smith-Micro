import { Routes, Route, useLocation } from "react-router";

// Pages
import Account from "./pages/AccountPage";
import CreateNotificationTriggerPage from "./pages/CreateNotificationTriggerPage";
import FlaggedSites from "./pages/FlaggedSitesPage";
import History from "./pages/HistoryPage";
import Notifications from "./pages/NotificationsPage";
import NotificationSettings from "./pages/NotificationSettingsPage";
import PasswordReset from "./pages/PasswordResetPage";
import Settings from "./pages/SettingsPage";
import SiteCategories from "./pages/SiteCategoriesPage";
import Summary from "./pages/SummaryPage";
import AdminDashboard from "./pages/AdminDashboard";

// Auth Templates
import SignIn from "./mui-templates/sign-in/SignIn";
import SignUp from "./mui-templates/sign-up/SignUp";

// Components
import NavBar from "./components/NavBar";

const App = () => {
  const location = useLocation();

  const pagesWithoutNavBar = ["/login", "/sign-up", "/admin-dashboard"];
  const showNavBar = !pagesWithoutNavBar.includes(location.pathname);

  const fullWidthPages = ["/admin-dashboard"];
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <div className="app-viewport">
      <div className={`app-container ${isFullWidth ? "full-width" : ""}`}>
        {showNavBar && <NavBar />}
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Notifications />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />

          {/* Settings Subpages */}
          <Route path="/settings/account" element={<Account />} />
          <Route path="/settings/flagged-sites" element={<FlaggedSites />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/settings/site-categories" element={<SiteCategories />} />
          <Route
            path="/settings/notifications/create-notification"
            element={<CreateNotificationTriggerPage />}
          />

          {/* Authentication Pages */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/password-reset" element={<PasswordReset />} />

          {/* Admin Pages */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;