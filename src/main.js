import { TimerView } from "./views/timer/index.js";
import { PresetsView } from "./views/presets/index.js";
import { StatsView } from "./views/stats/index.js";
import { SettingsView } from "./views/settings/index.js";
import { CreatePresetView } from "./views/presets/create.js";
import { EditPresetView } from "./views/presets/edit.js";
import { applyInitialTheme, updateTheme, updateActiveMode, getActiveMode } from "./core/theme.js";
import {
  getPresets,
  savePresets,
  updatePreset,
  deletePreset,
  getSettings,
  saveSettings,
  getStats,
  saveStats,
  resetStats,  
} from "./core/storage.js";
import {
  startTimer,
  loadPresetToTimer,
  stopTimer,
  resetTimer,
  subscribeToTimer,
  timerState,
} from "./core/timerState.js";

let lastAppliedMode = null;
let circle = null;
let lastIntervalIndex = timerState.currentIntervalIndex ?? 0;

function updateTimerCircleFromState() {
  if (!circle) return;

  const current = timerState.intervals[timerState.currentIntervalIndex];
  if (!current) {
    circle.set(0);
    return;
  }

  // duración total del intervalo actual
  const unit = current.unidad || "minutes";
  const base =
    unit === "seconds" ? 1000 :
    unit === "hours" ? 3600 * 1000 :
    60 * 1000;

  const totalMs = current.duracion * base;
  const remaining = timerState.remainingMs;

  if (!totalMs || totalMs <= 0) {
    circle.set(0);
    return;
  }

  const progress = 1 - Math.max(remaining, 0) / totalMs;
  circle.set(progress);
}

function updateTimerMessageFromState() {
  const el = document.getElementById("timer-status-message");
  if (!el) return;
  el.textContent = timerState.statusMessage || "";
}

function handleIntervalChangeAnimation() {
  const display = document.getElementById("timer-display");
  if (!display) return;

  display.classList.add("animate-pulse");
  setTimeout(() => {
    display.classList.remove("animate-pulse");
  }, 300);
}

function syncActiveModeWithCurrentInterval() {

  let newMode;
  // Sin preset (no hay intervalos) → neutral, sin sombra
  if (!timerState.intervals || timerState.intervals.length === 0) {
    newMode = "neutral";
  } else {
    // Con preset → siempre el modo base (trabajo / estudio / deporte)
    newMode = timerState.baseMode || "trabajo";
  }

   if (newMode === lastAppliedMode) return;

  lastAppliedMode = newMode;
  updateActiveMode(newMode); // cambia clases del body (mode-*)
  render(); 
}

function formatMsToMMSS(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );
}

function animateShadowBeat() {
  const body = document.body;

  // solo en la página Timer
  if (!body.classList.contains("page-timer")) return;

  if (!timerState.intervals || timerState.intervals.length === 0) return;

  body.classList.add("shadow-beat");
  setTimeout(() => body.classList.remove("shadow-beat"), 900);
}

function updateTimerDisplayFromState() {
  const display = document.getElementById("timer-display");
  if (!display) return;

  display.textContent = formatMsToMMSS(timerState.remainingMs);
}

subscribeToTimer(() => {
  const previousIndex = lastIntervalIndex;
  const currentIndex = timerState.currentIntervalIndex ?? 0;
  const intervalChanged = currentIndex !== previousIndex;
  lastIntervalIndex = currentIndex;

  updateTimerDisplayFromState();
  updateTimerMessageFromState();
  syncActiveModeWithCurrentInterval();
  updateTimerCircleFromState();
  updateTimerCircleColor();

  if (intervalChanged) {
    render();
  }

  if (timerState.status === "running") {
    animateShadowBeat();
  }
});

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

  const body = document.body;
  body.classList.remove("page-timer");
  if (path === "/") {
    body.classList.add("page-timer");
  }

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

  if (path === "/") {
    setTimeout(() => {
      initTimerCircle();
      updateTimerCircleFromState(); // refrescar progreso inicial
    }, 20);
  }
}

function initTimerCircle() {
  const container = document.getElementById("timer-circle");
  if (!container) {
    circle = null;
    return;
  }

  // Destruir círculo previo si la vista se vuelve a renderizar
  container.innerHTML = "";

  circle = new ProgressBar.Circle(container, {
    strokeWidth: 4,
    trailWidth: 4,
    easing: "easeInOut",
    duration: 300,
    color: "rgba(255,255,255,0.9)",      // se sobrescribe luego
    trailColor: "rgba(255,255,255,0.1)", // se sobrescribe luego
  });

  updateTimerCircleColor();
}

function updateTimerCircleColor() {
  if (!circle) return;

  const mode = getActiveMode(); // "trabajo" | "estudio" | "deporte" | "neutral"
  let color = "rgba(148, 163, 184, 0.9)";      // gris por defecto
  let trail = "rgba(148, 163, 184, 0.2)";

  if (mode === "trabajo") {
    color = "rgba(59, 130, 246, 0.95)";       // azul
    trail = "rgba(59, 130, 246, 0.2)";
  } else if (mode === "estudio") {
    color = "rgba(34, 197, 94, 0.95)";        // verde
    trail = "rgba(34, 197, 94, 0.2)";
  } else if (mode === "deporte") {
    color = "rgba(249, 115, 22, 0.95)";       // naranja
    trail = "rgba(249, 115, 22, 0.2)";
  }

  circle.path.setAttribute("stroke", color);
  if (circle.trail) {
    circle.trail.setAttribute("stroke", trail);
  }
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
  const bloques = Number(form.bloques.value) || 1;

  if (bloques <= 0) {
    alert("El número de bloques debe ser al menos 1.");
    return;
  }

  if (!nombre || !actividad || actividad <= 0) {
    alert("Introduce al menos un nombre y una duración de actividad.");
    return;
  }

  const intervalos = [];

  for (let i = 0; i < bloques; i++) {
    // bloque de actividad
    intervalos.push({
      duracion: actividad,
      modo: tipo,
      unidad,
    });

    // si no es el último bloque, añadimos descanso
    if (i < bloques - 1 && descanso > 0) {
      intervalos.push({
        duracion: descanso,
        modo: "descanso",
        unidad,
      });
    }
  }

  const presets = getPresets();
  const newId =
    presets.length > 0 ? Math.max(...presets.map((p) => p.id || 0)) + 1 : 1;

  const nuevoPreset = {
    id: newId,
    nombre,
    tipo,
    intervalos,
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
  const bloques = Number(form.bloques.value) || 1; 

  if (bloques <= 0) {
    alert("El número de bloques debe ser al menos 1.");
    return;
  }

  if (!nombre || !actividad || actividad <= 0) {
    alert("Introduce al menos un nombre y una duración de actividad.");
    return;
  }

  const intervalos = [];

  for (let i = 0; i < bloques; i++) {
    // intervalo de actividad
    intervalos.push({
      duracion: actividad,
      modo: tipo,
      unidad,
    });

    // descanso entre bloques (menos después del último)
    if (i < bloques - 1 && descanso > 0) {
      intervalos.push({
        duracion: descanso,
        modo: "descanso",
        unidad,
      });
    }
  }

  const updatedPreset = {
    id,
    nombre,
    tipo,
    intervalos,
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

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#timer-start");
  if (!btn) return;

  event.preventDefault();
  startTimer();
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#timer-stop");
  if (!btn) return;

  event.preventDefault();
  stopTimer();
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#timer-reset");
  if (!btn) return;

  event.preventDefault();
  resetTimer();
});

document.addEventListener("click", (event) => {
  const useBtn = event.target.closest("[data-use-preset]");
  if (!useBtn) return;

  event.preventDefault();
  const presetId = Number(useBtn.getAttribute("data-preset-id"));
  loadPresetToTimer(presetId);
  navigate("/");
  startTimer();
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#stats-reset");
  if (!btn) return;

  event.preventDefault();

  const ok = confirm("¿Seguro que quieres reiniciar todas las estadísticas?");
  if (!ok) return;

  resetStats();
  navigate("/stats"); // recarga la vista con todo a cero
});

