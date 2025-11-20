export function CreatePresetView() {
  return `
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold text-center">Nuevo preset</h1>

      <form class="space-y-4 max-w-md mx-auto" data-form="create-preset">

        <!-- Nombre -->
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del preset"
          class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
        />

        <!-- Tipo -->
        <select
          name="tipo"
          class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
        >
          <option value="trabajo">Trabajo</option>
          <option value="estudio">Estudio</option>
          <option value="deporte">Deporte</option>
        </select>

        <!-- Selector de unidades -->
        <div class="space-y-2">
          <label class="text-sm text-slate-300">Unidad</label>

          <!-- valor por defecto: minutos -->
          <input type="hidden" name="unidad" value="minutes" />

          <div class="flex gap-2">
            <button
              type="button"
              data-unit="seconds"
              class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100"
            >
              Segundos
            </button>

            <button
              type="button"
              data-unit="minutes"
              class="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-900"
            >
              Minutos
            </button>

            <button
              type="button"
              data-unit="hours"
              class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-100"
            >
              Horas
            </button>
          </div>
        </div>

        <!-- Tiempos -->
        <div class="flex gap-3">
          <input
            type="number"
            name="actividad"
            placeholder="Actividad"
            class="w-1/2 px-3 py-2 rounded bg-slate-900 border border-slate-700"
          />
          <input
            type="number"
            name="descanso"
            placeholder="Descanso"
            class="w-1/2 px-3 py-2 rounded bg-slate-900 border border-slate-700"
          />
        </div>

        <div class="flex gap-3">
          <input
            type="number"
            name="bloques"
            placeholder="N1 de intervalos"
            class="px-3 py-2 rounded bg-slate-900 border border-slate-700 w-full"
            min="1"
            value="1"
          />
        </div>

        <!-- Guardar -->
        <button
          type="submit"
          class="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded"
        >
          Guardar preset
        </button>

      </form>
    </div>
  `;
}
