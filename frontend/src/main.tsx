import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")!).render(<MotionConfig reducedMotion="user"><BrowserRouter><App /></BrowserRouter></MotionConfig>);
