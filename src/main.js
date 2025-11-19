import { TimerView } from "./views/timer/index.js";
import { PresetsView } from "./views/presets/index.js";
import { StatsView } from "./views/stats/index.js";
import { SettingsView } from "./views/settings/index.js";

const routes = {
  "/": TimerView,
  "/presets": PresetsView,
  "/stats": StatsView,
  "/settings": SettingsView,
};

function render() {
  const path = routes[window.location.pathname] ? window.location.pathname : "/";
  const view = routes[path]();
  document.getElementById("app").innerHTML = view;
}


export function navigate(path) {
  history.pushState({}, "", path);
  render();
}

window.addEventListener("popstate", render);
window.addEventListener("load", render);

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-link]");
  if (!link) return;

  event.preventDefault();
  navigate(link.getAttribute("href"));
});
