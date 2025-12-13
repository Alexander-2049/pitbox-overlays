import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// This App.tsx is not used in the current structure, as Standings is directly rendered in Storybook.
// If this were a standalone app, App.tsx would typically render Standings.
// For now, keeping it as is, but it's effectively unused in the context of Storybook.
// If the user wants a runnable app, App.tsx would need to be updated to render Standings.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
