import { getActiveMode } from "./theme.js";

export function getAccentClasses() {
  const mode = getActiveMode();

  if (mode === "trabajo") {
    return {
      bg: "bg-blue-600 hover:bg-blue-500",
      shadow: "shadow shadow-blue-500/40",
      tag: "bg-blue-600/20 text-blue-300",
    };
  }

  if (mode === "estudio") {
    return {
      bg: "bg-green-600 hover:bg-green-500",
      shadow: "shadow shadow-green-500/40",
      tag: "bg-green-600/20 text-green-300",
    };
  }

  if (mode === "deporte") {
    return {
      bg: "bg-orange-600 hover:bg-red-500",
      shadow: "shadow shadow-orange-500/40",
      tag: "bg-red-600/20 text-red-300",
    };
  }

  // modo neutral
  return {
    bg: "btn-primary",
    shadow: "shadow-md shadow-emerald-500/25",
    tag: "preset-tag-neutral",
  };
}
