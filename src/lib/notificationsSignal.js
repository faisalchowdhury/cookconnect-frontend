"use client";

/** Fired after notification read state changes so the navbar badge can refresh. */
export const NOTIFICATIONS_CHANGED_EVENT = "nkhedmou:notifications-changed";

export function notifyNotificationsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}
