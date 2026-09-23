import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const REDIRECT_URL = "https://beautiful-layout-tool.lovable.app";

window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", () => {
  window.location.href = REDIRECT_URL;
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);