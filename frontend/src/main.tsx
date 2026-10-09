import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "./auth";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </MotionConfig>
);
