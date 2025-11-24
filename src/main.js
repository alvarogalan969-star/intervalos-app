import { TimerView } from "./views/timer/index.js";
import { PresetsView } from "./views/presets/index.js";
import { StatsView } from "./views/stats/index.js";
import { SettingsView, initSettingsView } from "./views/settings/index.js";
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
  startCountdownThenStartTimer,
} from "./core/timerState.js";
import { stopAllSounds } from "./core/sound.js";

let lastAppliedMode = null;
let circle = null;
let lastIntervalIndex = timerState.currentIntervalIndex ?? 0;
let lastCountdownActive = timerState.countdownActive ?? false;
let lastCountdownValue = timerState.countdownValue ?? 0;

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

  const countdownActiveChanged =
    timerState.countdownActive !== lastCountdownActive;
  lastCountdownActive = timerState.countdownActive;

  const countdownValueChanged =
    timerState.countdownValue !== lastCountdownValue;
  lastCountdownValue = timerState.countdownValue;

  updateTimerDisplayFromState();
  updateTimerMessageFromState();
  syncActiveModeWithCurrentInterval();
  updateTimerCircleFromState();
  updateTimerCircleColor();

  if (intervalChanged || countdownActiveChanged || countdownValueChanged) {
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

  if (path === "/stats") {
    setTimeout(() => {
      initStatsChart();
    }, 20);
  }

  if (path === "/settings") {
    setTimeout(() => {
      initSettingsView();
    }, 0);
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

function getLast7DaysSeriesForChart() {
  const stats = getStats();
  const byDay = stats.byDay || {};

  const labels = [];
  const values = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().slice(0, 10);
    const dayStats = byDay[key] || { totalMs: 0 };

    labels.push(
      d.toLocaleDateString(undefined, { weekday: "short" }) // lun, mar...
    );
    // pasamos a minutos para el gráfico
    values.push(Math.round((dayStats.totalMs || 0) / 60000));
  }

  return { labels, values };
}

function initStatsChart() {
  const el = document.getElementById("stats-chart-7d");
  if (!el || !window.echarts) return;

  const { labels, values } = getLast7DaysSeriesForChart();

  const chart = echarts.init(el);

  chart.setOption({
    tooltip: {
    trigger: "axis",
    backgroundColor: "rgba(15,23,42,0.96)",   // bg-slate-900 aprox
    borderColor: "#1e293b",                   // border-slate-800
    borderWidth: 1,
    padding: [8, 10],
    textStyle: {
      color: "#e5e7eb",                       // text-slate-200
      fontSize: 11,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    axisPointer: {
      type: "shadow",
      shadowStyle: {
        color: "rgba(15,23,42,0.65)",         // sombra suave bajo la barra
      },
    },
    formatter: (params) => {
      const p = params[0];
      // p.axisValue = "lun", "mar"...
      // p.data = minutos
      return `
        <div style="display:flex;flex-direction:column;gap:2px;">
          <span style="font-size:11px;opacity:0.8;">${p.axisValue}</span>
          <span style="font-size:12px;font-weight:500;">${p.data} min</span>
        </div>
      `;
    },
  },
    grid: { left: 30, right: 10, top: 20, bottom: 25 },
    xAxis: {
      type: "category",
      data: labels,
      axisLine: { lineStyle: { color: "#64748b" } },
      axisLabel: { color: "#cbd5f5", fontSize: 10 },
    },
    yAxis: {
      type: "value",
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#1e293b" } },
      axisLabel: { color: "#94a3b8", fontSize: 10 },
      nameTextStyle: { color: "#94a3b8", fontSize: 10, padding: [0, 0, 0, -10] },
    },
    series: [
      {
        type: "bar",
        data: values,
        barWidth: "50%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 1,
            x2: 0,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#034111ff" },
              { offset: 1, color: "#4ade80" },
            ],
          },
        },
      },
    ],
  });

  // opcional: resize al cambiar tamaño de ventana
  window.addEventListener("resize", () => {
    chart.resize();
  });
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

   // 3) Selector de tipo de preset (todos iguales / intervalos distintos)
  const intervalModeButton = event.target.closest("[data-interval-mode]");
  if (intervalModeButton) {
    event.preventDefault();

    const form = intervalModeButton.closest("form");
    if (!form) return;

    const mode = intervalModeButton.getAttribute("data-interval-mode");

    // Actualizamos el hidden
    const hiddenInput = form.querySelector('input[name="interval-mode"]');
    if (hiddenInput) {
      hiddenInput.value = mode;
    }

    // Estilos de los botones
    const buttons = form.querySelectorAll("[data-interval-mode]");
    buttons.forEach((btn) => {
      btn.classList.remove("bg-emerald-600", "text-slate-900");
      btn.classList.add("bg-slate-800", "border", "border-slate-700", "text-slate-100");
    });

    intervalModeButton.classList.remove("bg-slate-800", "border-slate-700", "text-slate-100");
    intervalModeButton.classList.add("bg-emerald-600", "text-slate-900");

    // Mostrar / ocultar secciones
    const sections = form.querySelectorAll("[data-interval-section]");
    sections.forEach((section) => {
      const sectionMode = section.getAttribute("data-interval-section");
      if (sectionMode === mode) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });

    return;
  }

  const addIntervalButton = event.target.closest("[data-add-interval]");
  if (addIntervalButton) {
    event.preventDefault();

    const form = addIntervalButton.closest("form");
    if (!form) return;

    const list = form.querySelector("#intervals-list");
    if (!list) return;

    const rowHtml = `
      <div
        data-interval-row
        class="flex items-center gap-2 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2"
      >
        <select
          name="tipo-intervalo"
          class="px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-slate-500"
        >
          <option value="actividad">Actividad</option>
          <option value="descanso">Descanso</option>
        </select>

        <input
          type="number"
          name="duracion"
          placeholder="Tiempo"
          class="w-20 px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-slate-500"
          min="1"
        />

        <select
          name="unidad-fila"
          class="px-2 py-1 rounded bg-slate-900/80 border border-slate-700 text-sm focus:outline-none focus:border-slate-500"
        >
          <option value="seconds">s</option>
          <option value="minutes" selected>min</option>
          <option value="hours">h</option>
        </select>

        <button
          type="button"
          data-remove-interval-row
          class="ml-auto text-slate-400 hover:text-red-400 text-xs"
          title="Eliminar intervalo"
        >
          ✕
        </button>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", rowHtml);
    return;
  }

  // 5) Eliminar fila de intervalo personalizado
  const removeIntervalButton = event.target.closest("[data-remove-interval-row]");
  if (removeIntervalButton) {
    event.preventDefault();
    const row = removeIntervalButton.closest("[data-interval-row]");
    if (row) {
      row.remove();
    }
    return;
  }

  // 4) Navegación SPA
  const link = event.target.closest("[data-link]");
  if (!link) return;

  event.preventDefault();
  navigate(link.getAttribute("href"));
});

// 4) Envío del formulario "Nuevo preset"
document.addEventListener("submit", (event) => {
  const form = event.target;

  // 🟢 CREAR PRESET
  if (form.matches('[data-form="create-preset"]')) {
    event.preventDefault();

    const nombre = form.nombre.value.trim();
    const tipo = form.tipo.value;
    const actividad = Number(form.actividad.value);
    const descanso = Number(form.descanso.value);
    const unidad = form.unidad.value || "minutes";
    const bloques = Number(form.bloques.value) || 1;
    const presetMode = form["interval-mode"].value || "uniforme";

    if (!nombre) {
      alert("Introduce un nombre para el preset.");
      return;
    }

    if (presetMode === "uniforme") {
      if (bloques <= 0) {
        alert("El número de bloques debe ser al menos 1.");
        return;
      }

      if (!actividad || actividad <= 0) {
        alert("Introduce una duración de actividad mayor que 0.");
        return;
      }
    }

    const intervalos = [];

    if (presetMode === "uniforme") {
      for (let i = 0; i < bloques; i++) {
        intervalos.push({
          duracion: actividad,
          modo: tipo,
          unidad,
        });

        if (i < bloques - 1 && descanso > 0) {
          intervalos.push({
            duracion: descanso,
            modo: "descanso",
            unidad,
          });
        }
      }
    } else {
      const filas = form.querySelectorAll("[data-interval-row]");

      if (filas.length === 0) {
        alert("Añade al menos un intervalo.");
        return;
      }

      filas.forEach((fila) => {
        const duracion = Number(
          fila.querySelector("[name='duracion']").value
        );
        const tipoIntervalo = fila.querySelector(
          "[name='tipo-intervalo']"
        ).value;
        const unidadFila =
          fila.querySelector("[name='unidad-fila']").value || unidad;

        if (!duracion || duracion <= 0) return;

        const modoFinal =
          tipoIntervalo === "actividad" ? tipo : "descanso";

        intervalos.push({
          duracion,
          modo: modoFinal,
          unidad: unidadFila,
        });
      });

      if (intervalos.length === 0) {
        alert(
          "Todos los intervalos personalizados tienen duración 0. Revisa los tiempos."
        );
        return;
      }
    }

    const presets = getPresets();
    const newId =
      presets.length > 0
        ? Math.max(...presets.map((p) => p.id || 0)) + 1
        : 1;

    const nuevoPreset = {
      id: newId,
      nombre,
      tipo,
      intervalos,
    };

    savePresets([...presets, nuevoPreset]);
    navigate("/presets");
    return;
  }

  // 🔵 EDITAR PRESET
  if (form.matches('[data-form="edit-preset"]')) {
    event.preventDefault();

    const id = Number(form.id.value);
    const nombre = form.nombre.value.trim();
    const tipo = form.tipo.value;
    const actividad = Number(form.actividad.value);
    const descanso = Number(form.descanso.value);
    const unidad = form.unidad?.value || "minutes";
    const bloques = Number(form.bloques.value) || 1;
    const presetMode = form["interval-mode"].value || "uniforme";

    if (!nombre) {
      alert("Introduce un nombre para el preset.");
      return;
    }

    if (presetMode === "uniforme") {
      if (bloques <= 0) {
        alert("El número de bloques debe ser al menos 1.");
        return;
      }

      if (!actividad || actividad <= 0) {
        alert("Introduce una duración de actividad mayor que 0.");
        return;
      }
    }

    const intervalos = [];

    if (presetMode === "uniforme") {
      for (let i = 0; i < bloques; i++) {
        intervalos.push({
          duracion: actividad,
          modo: tipo,
          unidad,
        });

        if (i < bloques - 1 && descanso > 0) {
          intervalos.push({
            duracion: descanso,
            modo: "descanso",
            unidad,
          });
        }
      }
    } else {
      const filas = form.querySelectorAll("[data-interval-row]");

      if (filas.length === 0) {
        alert("Añade al menos un intervalo.");
        return;
      }

      filas.forEach((fila) => {
        const duracion = Number(
          fila.querySelector("[name='duracion']").value
        );
        const tipoIntervalo = fila.querySelector(
          "[name='tipo-intervalo']"
        ).value;
        const unidadFila =
          fila.querySelector("[name='unidad-fila']").value || unidad;

        if (!duracion || duracion <= 0) return;

        const modoFinal =
          tipoIntervalo === "actividad" ? tipo : "descanso";

        intervalos.push({
          duracion,
          modo: modoFinal,
          unidad: unidadFila,
        });
      });

      if (intervalos.length === 0) {
        alert(
          "Todos los intervalos personalizados tienen duración 0. Revisa los tiempos."
        );
        return;
      }
    }

    const presets = getPresets();
    const index = presets.findIndex((p) => p.id === id);
    if (index === -1) {
      alert("No se ha encontrado el preset a editar.");
      return;
    }

    presets[index] = {
      ...presets[index],
      nombre,
      tipo,
      intervalos,
    };

    savePresets(presets);
    navigate("/presets");
    return;
  }
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

  const presetMode = form["interval-mode"].value || "uniforme";
  const intervalos = [];

  if (presetMode === "uniforme") {
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
  } else {

    const filas = form.querySelectorAll("[data-interval-row]");

    if (filas.length === 0) {
      alert("Añade al menos un intervalo.");
      return;
    }

    filas.forEach((fila) => {
      const duracion = Number(
        fila.querySelector("[name='duracion']").value
      );
      const tipoIntervalo = fila.querySelector(
        "[name='tipo-intervalo']"
      ).value; // "actividad" | "descanso"
      const unidadFila =
        fila.querySelector("[name='unidad-fila']").value || unidad;

      if (!duracion || duracion <= 0) return;

      const modoFinal =
        tipoIntervalo === "actividad" ? tipo : "descanso";

      intervalos.push({
        duracion,
        modo: modoFinal, // trabajo/estudio/deporte o "descanso"
        unidad: unidadFila,
      });
    });
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
  stopAllSounds(); 
  startTimer();
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#timer-stop");
  if (!btn) return;

  event.preventDefault();
  stopAllSounds(); 
  stopTimer();
});

document.addEventListener("click", (event) => {
  const btn = event.target.closest("#timer-reset");
  if (!btn) return;

  event.preventDefault();
  stopAllSounds(); 
  resetTimer();
});

document.addEventListener("click", (event) => {
  const useBtn = event.target.closest("[data-use-preset]");
  if (!useBtn) return;

  event.preventDefault();
  const presetId = Number(useBtn.getAttribute("data-preset-id"));
  loadPresetToTimer(presetId);
  navigate("/");
  startCountdownThenStartTimer();
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

