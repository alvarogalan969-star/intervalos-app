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

}

export function SettingsView() {
  const { bg, shadow } = getAccentClasses();

  return `
    <div class="space-y-6 max-w-md mx-auto transition-colors duration-500">
      
      <h1 class="text-2xl font-semibold text-center">Ajustes</h1>

      <!-- Tema -->
      <div class="p-4 rounded-xl card ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Tema</div>
        </div>
        <div class="flex gap-2">
          <button
            data-theme="light"
            class="px-3 py-1.5 text-sm rounded-lg btn-secondary"
          >
            Claro
          </button>
          <button
            data-theme="dark"
            class="px-3 py-1.5 text-sm rounded-lg btn-secondary"
          >
            Oscuro
          </button>
        </div>
      </div>

      <!-- Sonido (collapse) -->
      <details class="p-4 rounded-xl card ${shadow} group">
        <summary class="flex items-center justify-between cursor-pointer list-none">

          <div class="font-medium">Sonido</div>

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
              class="px-2 py-1 text-sm btn-secondary rounded"
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
          <div class="mt-4 border-t border-slate-700 dark:border-slate-700 border-slate-200 pt-4 space-y-4">
            <div class="text-sm text-muted">
              Sonidos por modo (inicio y fin)
            </div>

            ${["trabajo", "estudio", "deporte"]
              .map(
                (modo) => `
              <div class="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
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
                    class="px-2 py-1 text-sm btn-secondary rounded"
                    data-sound-preview
                  >
                    ▶
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
                    class="px-2 py-1 text-sm btn-secondary rounded"
                    data-sound-preview
                  >
                    ▶
                  </button>

                </div>
              </div>
            `
              )
              .join("")}

          </div>
        </div>
      </details>

      <!-- Notificaciones -->
      <div class="p-4 rounded-xl card ${shadow} flex items-center justify-between gap-4">
        <div>
          <div class="font-medium">Notificaciones</div>
        </div>

        <button
          type="button"
          data-notifications-toggle
          class="px-3 py-1.5 text-sm rounded-lg btn-secondary flex items-center gap-2"
        >
          <span data-notifications-icon>🔔</span>
          <span class="text-xs" data-notifications-label>On</span>
        </button>
      </div>

    </div>
  `;
}
