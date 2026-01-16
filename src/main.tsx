import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import BrowserHistory from "./pages/BrowserHistory.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserHistory user_id={"7LpcmhJK1QCWn9ETqLN5"} />
  </StrictMode>
);
