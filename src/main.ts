import "./styles/app.css";
import { mountAppShell } from "./app/AppShell";

function start(): void {
  const root = document.getElementById("app");
  if (root) mountAppShell(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
