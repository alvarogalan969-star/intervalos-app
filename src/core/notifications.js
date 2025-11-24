export function showNotification(title, body) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  const show = () => {
    try {
      new Notification(title, { body });
    } catch (e) {
      console.warn("Error mostrando notificación", e);
    }
  };

  if (Notification.permission === "granted") {
    show();
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") show();
    });
  }
  // si es "denied", no hacemos nada
}
