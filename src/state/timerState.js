export const timerState = {
  mode: "work",      // work | study | exercise
  duration: 1500,    // duración en segundos (25 min por defecto)
  rest: 300,         // descanso en segundos (5 min)
  remaining: 1500,   // tiempo restante actual
  running: false,    // ¿el temporizador está corriendo?
  intervalId: null,  // aquí guardaremos el setInterval
};
