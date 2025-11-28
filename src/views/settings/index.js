import { getAccentClasses } from "../../core/modeStyle.js";
import { getSettings, saveSettings } from "../../core/storage.js";
import { setGlobalVolume, setMuted, playSound, stopAllSounds} from "../../core/sound.js";

const SOUND_OPTIONS = `
  <option value="alarm-327234">alarm-327234</option>
  <option value="alarm-clock-90867">alarm-clock-90867</option>
  <option value="bell-ringing-ii-98323">bell-ringing-ii-98323</option>
  <option value="bell-sound-370341">bell-sound-370341</option>
  <option value="chime-alert-demo-309545">chime-alert-demo-309545</option>
  <option value="notification-bell-sound-376888">notification-bell-sound-376888</option>
  <option value="simple-notification-152054">simple-notification-152054</option>
  <option value="slow-ding-354125">slow-ding-354125</option>
  <option value="winfantasia-6912">winfantasia-6912</option>
  <option value="wow-423653">wow-423653</option>
`;

function updateRepeatButtonUI(button, isOn) {
  if (isOn) {
    button.textContent = "ON";
    button.classList.remove("bg-slate-800", "text-slate-300");
    button.classList.add(
      "bg-emerald-500",
      "text-slate-300",
      "border-emerald-400"
    );
  } else {
    button.textContent = "OFF";
    button.classList.remove("bg-emerald-500", "text-slate-300", "border-emerald-400");
    button.classList.add("bg-slate-800", "text-slate-300");
  }
}

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
      stopAllSounds();
      playSound(sel.value);
    });
  });

  // Botón de previsualización (▶)
  const previewButtons = document.querySelectorAll("[data-sound-preview]");

  previewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      let select = btn.previousElementSibling;

      while (select && !select.matches("[data-sound-select]")) {
        select = select.previousElementSibling;
      }

      if (!select) return;

      const soundFile = select.value;
      stopAllSounds();
      playSound(soundFile);
    });
  });

    // --- Notificaciones (campana) ---
  const notifBtn = document.querySelector("[data-notifications-toggle]");
  if (notifBtn) {
    const iconEl = notifBtn.querySelector("[data-notifications-icon]");
    const labelEl = notifBtn.querySelector("[data-notifications-label]");

    const applyNotifUI = () => {
      const enabled = settings.notificationsEnabled;
      if (enabled) {
        iconEl.textContent = "🔔";
        labelEl.textContent = "On";
        notifBtn.classList.remove("opacity-50");
      } else {
        iconEl.textContent = "🔕";
        labelEl.textContent = "Off";
        notifBtn.classList.add("opacity-50");
      }
    };

    applyNotifUI();

    notifBtn.addEventListener("click", async () => {
      // vibración corta (si el dispositivo lo soporta)
      if ("vibrate" in navigator) {
        navigator.vibrate(80);
      }

      // alternar estado
      settings.notificationsEnabled = !settings.notificationsEnabled;
      saveSettings(settings);
      applyNotifUI();

      // si se activan y hay API de notificaciones, pedimos permiso (una vez)
      if (
        settings.notificationsEnabled &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.warn("No se pudo solicitar permiso de notificaciones", e);
        }
      }
    });
  }

  const repeatBtn = document.querySelector(
    '[data-setting="repeatIntervalSound"]'
  );

  if (repeatBtn) {
    // estado inicial
    updateRepeatButtonUI(repeatBtn, settings.repeatIntervalSound);

    repeatBtn.addEventListener("click", () => {
      const current = getSettings();
      const next = !current.repeatIntervalSound;

      saveSettings({
        ...current,
        repeatIntervalSound: next,
      });

      updateRepeatButtonUI(repeatBtn, next);
    });
  }
}

export function SettingsView() {
  const { bg, shadow } = getAccentClasses();

  return `
    <div class="space-y-6 max-w-md mx-auto transition-colors duration-500">
      
      <h1 class="text-2xl font-semibold text-center">Ajustes</h1>

      <!-- Tema -->
      <div class="p-4 rounded-xl card ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-medium">Tema</div>
          <div class="text-xs text-slate-400">Claro u oscuro</div>
        </div>

        <button
          id="theme-toggle"
          class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition"
        >
          <!-- Sol -->
          <svg
            id="icon-sun"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="hidden"
          >
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2"  x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
            <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22" />
          </svg>

          <!-- Luna -->
          <svg
            id="icon-moon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="hidden"
          >
            <path d="M21 12.79A7 7 0 0 1 12.21 4
                    5.5 5.5 0 1 0 21 12.79z" />
          </svg>
        </button>
      </div>

      <!-- Sonido (collapse) -->
      <details class="p-4 rounded-xl card ${shadow} group">
        <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
          <div>
            <div class="text-sm font-medium">Sonido</div>
            <div class="text-xs text-slate-400">Volumen y sonidos por modo</div>
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
              class="px-2 py-1 text-xs rounded-lg btn-secondary"
              data-sound-mute-toggle
            >
              🔊
            </button>
          </div>

          <!-- Flecha -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-muted transition-transform group-open:rotate-180"
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

            ${["trabajo", "estudio", "deporte"]
              .map(
                (modo) => `
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="font-medium text-sm capitalize">${modo}</div>
                <div class="flex flex-wrap gap-2">
                  <select
                    class="input-base text-sm px-2 py-1 rounded"
                    data-sound-select
                    data-mode="${modo}"
                    data-kind="start"
                  >
                    ${SOUND_OPTIONS}
                  </select>

                  <button
                    type="button"
                    class="px-2 py-1 text-xs btn-secondary rounded flex items-center justify-center"
                    data-sound-preview
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 4.5v11l9-5.5-9-5.5z" />
                    </svg>
                  </button>

                  <select
                    class="input-base text-sm px-2 py-1 rounded"
                    data-sound-select
                    data-mode="${modo}"
                    data-kind="end"
                  >
                    ${SOUND_OPTIONS}
                  </select>

                  <button
                    type="button"
                    class="px-2 py-1 text-xs btn-secondary rounded flex items-center justify-center"
                    data-sound-preview
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 4.5v11l9-5.5-9-5.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            `
              )
              .join("")
            }

            <div class="mt-6 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium">Repetir sonido</div>
                <div class="text-xs text-slate-400">
                  Mantener el sonido hasta pulsar un botón del timer
                </div>
              </div>

              <button
                type="button"
                data-setting="repeatIntervalSound"
                class="w-14 h-7 flex items-center justify-center rounded-full border border-slate-500/60 text-xs font-semibold bg-slate-800 text-slate-300"
              >
                OFF
              </button>
            </div>

          </div>
        </div>
      </details>

      <!-- Notificaciones -->
      <div class="p-4 rounded-xl card ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="text-sm font-medium">Notificaciones</div>
          <div class="text-xs text-slate-400">
            Avisos al terminar intervalos y rutinas
          </div>
        </div>

        <button
          type="button"
          data-notifications-toggle
          class="px-3 py-1.5 text-xs rounded-lg btn-secondary flex items-center gap-2"
        >
          <span data-notifications-icon>🔔</span>
          <span class="text-xs" data-notifications-label>On</span>
        </button>
      </div>

    </div>
  `;
}
