export function CreatePresetView() {
  return `
    <div class="space-y-6 max-w-md mx-auto">

      <h1 class="text-2xl font-semibold text-center">Nuevo preset</h1>

      <form class="space-y-5" data-form="create-preset">

        <!-- Nombre -->
        <div class="space-y-1">
          <label class="text-sm text-slate-300">Nombre</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del preset"
            class="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500"
          />
        </div>

        <!-- Tipo -->
        <div class="space-y-1 relative">
          <label class="text-sm text-slate-300">Tipo de actividad</label>
          <select
            name="tipo"
            class="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500 appearance-none cursor-pointer"
          >
            <option value="trabajo">Trabajo</option>
            <option value="estudio">Estudio</option>
            <option value="deporte">Deporte</option>
          </select>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        <div class="space-y-1">
          <label class="text-sm text-slate-300">Tipo de preset</label>

          <!-- Guardamos el modo elegido aquí (por defecto: uniforme) -->
          <input type="hidden" name="interval-mode" value="uniforme" />

          <div class="flex gap-2 text-sm">
            <button
              type="button"
              data-interval-mode="uniforme"
              class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-medium"
            >
              Todos iguales
            </button>

            <button
              type="button"
              data-interval-mode="personalizado"
              class="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100"
            >
              Intervalos distintos
            </button>
          </div>
        </div>

        <div
          data-interval-section="uniforme"
          class="space-y-4 mt-4"
        >

          <!-- Selector de unidades -->
          <div class="space-y-2">
            <label class="text-sm text-slate-300">Unidad de tiempo</label>

            <input type="hidden" name="unidad" value="minutes" />

            <div class="flex gap-2">
              <button
                type="button"
                data-unit="seconds"
                class="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 text-sm"
              >
                Segundos
              </button>

              <button
                type="button"
                data-unit="minutes"
                class="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-sm"
              >
                Minutos
              </button>

              <button
                type="button"
                data-unit="hours"
                class="flex-1 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 text-sm"
              >
                Horas
              </button>
            </div>
          </div>

          <!-- Duraciones -->
          <div class="space-y-2">
            <label class="text-sm text-slate-300">Duraciones</label>
            <div class="flex gap-3">
              <input
                type="number"
                name="actividad"
                placeholder="Actividad"
                class="w-1/2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500"
              />
              <input
                type="number"
                name="descanso"
                placeholder="Descanso"
                class="w-1/2 px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <!-- Bloques -->
          <div class="space-y-1">
            <label class="text-sm text-slate-300">Número de bloques</label>
            <input
              type="number"
              name="bloques"
              placeholder="Número de intervalos"
              class="w-full px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-700 focus:outline-none focus:border-slate-500"
              min="1"
            />
          </div>
        </div>

        <div
          data-interval-section="personalizado"
          class="space-y-3 mt-4 hidden"
        >
          <div class="text-sm text-slate-400">
            Aquí podrás añadir intervalos de actividad y descanso con tiempos distintos.
          </div>

          <div
            id="intervals-list"
            class="space-y-2"
          >
            <!-- Aquí añadiremos filas dinámicas con JS -->
          </div>

          <button
            type="button"
            data-add-interval
            class="w-full py-2 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sm font-medium"
          >
            + Añadir intervalo
          </button>
        </div>

        <!-- Guardar -->
        <button
          type="submit"
          class="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-semibold"
        >
          Guardar preset
        </button>

      </form>
    </div>
  `;
}
