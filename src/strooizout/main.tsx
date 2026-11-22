import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./strooizout.css";
import "./winter.css";

createRoot(document.getElementById("sz-root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
