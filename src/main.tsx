import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import BrowserHistory from "./BrowserHistory.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <BrowserHistory />
  </StrictMode>
);
