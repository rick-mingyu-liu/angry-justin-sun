import "./styles/app.css";
import { startAnalytics } from "./app/analytics";
import { mountAppShell } from "./app/AppShell";

function start(): void {
  const root = document.getElementById("app");
  if (root) mountAppShell(root);
  startAnalytics();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
