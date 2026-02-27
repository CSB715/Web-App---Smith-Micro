// main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import App from "./App";

console.log("Starting app...");
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
console.log("App rendered");
