import { getAccentClasses } from "../../core/modeStyle.js";
import { getSettings, saveSettings } from "../../core/storage.js";
import { setGlobalVolume, setMuted, playSound } from "../../core/sound.js";

export function initSettingsView() {
  // --- Collapse (ya lo tienes) ---
  const panel = document.querySelector("[data-sound-panel]");
  const toggle = panel?.querySelector("[data-sound-toggle]");
  const content = panel?.querySelector("[data-sound-content]");
  const arrow = panel?.querySelector("[data-sound-arrow]");

  if (toggle && content && arrow) {
    let open = false;

    const updateState = () => {
      content.style.maxHeight = open ? content.scrollHeight + "px" : "0px";
      arrow.classList.toggle("rotate-180", open);
    };

    updateState();

    toggle.addEventListener("click", () => {
      open = !open;
      updateState();
    });
  }

  // --- Settings / Sonido ---

  const settings = getSettings();

  // Volumen global
  const volumeInput = document.querySelector("[data-sound-volume]");
  if (volumeInput) {
    volumeInput.value = Math.round(settings.sounds.volume * 100);
    volumeInput.addEventListener("input", () => {
      const v = volumeInput.value / 100;
      setGlobalVolume(v);
    });
  }

  // Mute global
  const muteBtn = document.querySelector("[data-sound-mute-toggle]");
  if (muteBtn) {
    const updateMuteIcon = () => {
      muteBtn.textContent = settings.sounds.muted ? "🔇" : "🔊";
    };

    updateMuteIcon();

    muteBtn.addEventListener("click", () => {
      settings.sounds.muted = !settings.sounds.muted;
      setMuted(settings.sounds.muted);
      updateMuteIcon();
    });
  }

  // Selectores de sonido por modo
  const selects = document.querySelectorAll("[data-sound-select]");
  selects.forEach((sel) => {
    const mode = sel.dataset.mode;
    const kind = sel.dataset.kind; // start | end

    sel.value = settings.sounds[mode][kind];

    sel.addEventListener("change", () => {
      settings.sounds[mode][kind] = sel.value;
      saveSettings(settings);

      // Sonido de preview
      playSound(sel.value);
    });
  });
}

export function SettingsView() {
  const { bg, shadow } = getAccentClasses();

  return `
    <div class="space-y-6 max-w-md mx-auto transition-colors duration-500">
      <h1 class="text-2xl font-semibold text-center">Ajustes</h1>

      <!-- Tema -->
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Tema</div>
        </div>
        <div class="flex gap-2">
          <button
            data-theme="light"
            class="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600"
          >
            Claro
          </button>
          <button
            data-theme="dark"
            class="px-3 py-1.5 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600"
          >
            Oscuro
          </button>
        </div>
      </div>

      <!-- Sonido (collapse) -->
      <details
        class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow shadow-white/40 items-center justify-between gap-4 group"
      >
        <summary class="flex items-center justify-between cursor-pointer list-none">

          <div>
            <div class="font-medium">Sonido</div>
          </div>

          <div class="flex items-center gap-3">

            <!-- Volumen global -->
            <input
              type="range"
              min="0"
              max="100"
              value="80"
              class="w-32 accent-sky-400"
              data-sound-volume
            />

            <!-- Mute global -->
            <button
              type="button"
              class="px-2 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded"
              data-sound-mute-toggle
            >
              🔊
            </button>
          </div>

          <!-- Nueva flecha -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </summary>

        <div class="overflow-hidden transition-all duration-500 max-h-0 group-open:max-h-[600px]">
          <div class="mt-4 border-t border-slate-700 pt-4 space-y-4">
            <div class="text-sm text-slate-400">
              Sonidos por modo (inicio y fin)
            </div>

            <!-- Trabajo -->
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="font-medium text-sm">Trabajo</div>
              <div class="flex flex-wrap gap-2">
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="trabajo"
                  data-kind="start"
                >
                  <option value="chime-alert-demo-309545">Inicio 1</option>
                  <option value="bell-sound-370341">Inicio 2</option>
                </select>
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="trabajo"
                  data-kind="end"
                >
                  <option value="winfantasia-6912">Fin 1</option>
                  <option value="alarm-clock-90867">Fin 2</option>
                </select>
              </div>
            </div>

            <!-- Estudio -->
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="font-medium text-sm">Estudio</div>
              <div class="flex flex-wrap gap-2">
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="estudio"
                  data-kind="start"
                >
                  <option value="bell-sound-370341">Inicio 1</option>
                  <option value="chime-alert-demo-309545">Inicio 2</option>
                </select>
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="estudio"
                  data-kind="end"
                >
                  <option value="winfantasia-6912">Fin 1</option>
                  <option value="alarm-clock-90867">Fin 2</option>
                </select>
              </div>
            </div>

            <!-- Deporte -->
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div class="font-medium text-sm">Deporte</div>
              <div class="flex flex-wrap gap-2">
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="deporte"
                  data-kind="start"
                >
                  <option value="alarm-clock-90867">Inicio 1</option>
                  <option value="chime-alert-demo-309545">Inicio 2</option>
                </select>
                <select
                  class="bg-slate-700 text-sm px-2 py-1 rounded"
                  data-sound-select
                  data-mode="deporte"
                  data-kind="end"
                >
                  <option value="winfantasia-6912">Fin 1</option>
                  <option value="bell-sound-370341">Fin 2</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </details>

      <!-- Notificaciones -->
      <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Notificaciones</div>
          <div class="text-sm text-slate-400">Avisos cuando termine un intervalo</div>
        </div>
        <div class="text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
          Próximamente
        </div>
      </div>
    </div>
  `;
}
