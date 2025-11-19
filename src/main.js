import { TimerView } from "./views/timer/index.js";
import { PresetsView } from "./views/presets/index.js";
import { StatsView } from "./views/stats/index.js";
import { SettingsView } from "./views/settings/index.js";
import { CreatePresetView } from "./views/presets/create.js";
import { EditPresetView } from "./views/presets/edit.js";
import { applyInitialTheme, updateTheme } from "./core/theme.js";
import {
  getPresets,
  savePresets,
  updatePreset,
  deletePreset,
} from "./core/storage.js";

const routes = {
  "/": TimerView,
  "/presets": PresetsView,
  "/presets/new": CreatePresetView,
  "/stats": StatsView,
  "/settings": SettingsView,
};

function render() {
  const path = window.location.pathname;
  const app = document.getElementById("app");

  // 1) Ruta dinámica: /presets/:id/edit
  if (path.startsWith("/presets/") && path.endsWith("/edit")) {
    const parts = path.split("/"); // ["", "presets", ":id", "edit"]
    const id = parts[2];
    app.innerHTML = EditPresetView({ id });
    return;
  }

  // 2) Rutas normales
  const viewFn = routes[path] || TimerView;
  app.innerHTML = viewFn();
}

export function navigate(path) {
  history.pushState({}, "", path);
  render();
}

window.addEventListener("popstate", render);

window.addEventListener("load", () => {
  applyInitialTheme();
  render();
});

document.addEventListener("click", (event) => {
  // 1) Cambio de tema
  const themeButton = event.target.closest("[data-theme]");
  if (themeButton) {
    event.preventDefault();
    const theme = themeButton.getAttribute("data-theme");
    updateTheme(theme);
    return;
  }

  // 2) Selector de unidad
  const unitButton = event.target.closest("[data-unit]");
  if (unitButton) {
    event.preventDefault();
    const form = unitButton.closest("form");
    if (form) {
      const unit = unitButton.getAttribute("data-unit");
      const hiddenInput = form.querySelector('input[name="unidad"]');

      if (hiddenInput) {
        hiddenInput.value = unit;
      }

      const buttons = form.querySelectorAll("[data-unit]");
      buttons.forEach((btn) => {
        btn.classList.remove("bg-emerald-600", "text-slate-900");
        btn.classList.add("bg-slate-800", "text-slate-100");
      });

      unitButton.classList.remove("bg-slate-800", "text-slate-100");
      unitButton.classList.add("bg-emerald-600", "text-slate-900");
    }
    return;
  }

  // 3) Navegación SPA
  const link = event.target.closest("[data-link]");
  if (!link) return;

  event.preventDefault();
  navigate(link.getAttribute("href"));
});

// 4) Envío del formulario "Nuevo preset"
document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form.matches('[data-form="create-preset"]')) return;

  event.preventDefault();

  const nombre = form.nombre.value.trim();
  const tipo = form.tipo.value;
  const actividad = Number(form.actividad.value);
  const descanso = Number(form.descanso.value);
  const unidad = form.unidad.value || "minutes";

  if (!nombre || !actividad || actividad <= 0) {
    alert("Introduce al menos un nombre y una duración de actividad.");
    return;
  }

  const presets = getPresets();
  const newId =
    presets.length > 0 ? Math.max(...presets.map((p) => p.id || 0)) + 1 : 1;

  const nuevoPreset = {
    id: newId,
    nombre,
    tipo,
    intervalos: [
      { duracion: actividad, modo: tipo, unidad },
      { duracion: descanso || 0, modo: "descanso", unidad },
    ],
  };

  savePresets([...presets, nuevoPreset]);
  navigate("/presets");
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!form.matches('[data-form="edit-preset"]')) return;

  event.preventDefault();

  const ok = confirm("¿Quieres guardar los cambios de este preset?");
  if (!ok) return;

  const id = Number(form.id.value);
  const nombre = form.nombre.value.trim();
  const tipo = form.tipo.value;
  const actividad = Number(form.actividad.value);
  const descanso = Number(form.descanso.value);
  const unidad = form.unidad.value || "minutes";

  const updatedPreset = {
    id,
    nombre,
    tipo,
    intervalos: [
      { duracion: actividad, modo: tipo, unidad },
      { duracion: descanso || 0, modo: "descanso", unidad },
    ],
  };

  updatePreset(updatedPreset);
  navigate("/presets");
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#delete-preset");
  if (!btn) return;

  event.preventDefault();

  const ok = confirm("¿Seguro que quieres eliminar este preset? Esta acción no se puede deshacer.");
  if (!ok) return;

  const form = btn.closest("form");
  const id = Number(form.id.value);

  deletePreset(id);
  navigate("/presets");
});
