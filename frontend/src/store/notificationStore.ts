import create from "zustand";
import { getAccessToken } from "../lib/apiClient";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message?: string;
  isRead?: boolean;
  severity?: "low" | "medium" | "high" | "critical" | "info";
  actionUrl?: string;
  createdAt?: string;
};

interface NotificationStore {
  notifications: AppNotification[];
  setNotifications: (items: AppNotification[]) => void;
  addNotification: (item: AppNotification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: string) => void;
  startStream: () => void;
  stopStream: () => void;
}

let es: EventSource | null = null;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  setNotifications(items) {
    set({ notifications: items });
  },

  addNotification(item) {
    set((state) => ({ notifications: [item, ...state.notifications] }));
  },

  async markAsRead(id) {
    // optimistic update
    set((state) => ({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)) }));

    try {
      const token = getAccessToken();
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      if (!token || !base) return;
      await fetch(`${base}/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("markAsRead failed", err);
    }
  },

  async markAllAsRead() {
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) }));
    try {
      const token = getAccessToken();
      const base = process.env.NEXT_PUBLIC_API_URL ?? "";
      if (!token || !base) return;
      await fetch(`${base}/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("markAllAsRead failed", err);
    }
  },

  dismiss(id) {
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
  },

  startStream() {
    if (typeof window === "undefined") return;
    if (es) return; // already running

    const token = getAccessToken();
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const origin = base || window.location.origin + "/api/v1";
    const url = token ? `${origin}/notifications/stream?access_token=${encodeURIComponent(token)}` : `${origin}/notifications/stream`;

    try {
      es = new EventSource(url);
      es.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          // payload expected to be a notification object
          get().addNotification(payload as AppNotification);
        } catch (e) {
          console.error("invalid notification payload", e);
        }
      };
      es.onerror = (err) => {
        console.warn("notifications stream error", err);
      };
    } catch (err) {
      console.error("startStream failed", err);
    }
  },

  stopStream() {
    if (es) {
      es.close();
      es = null;
    }
  },
}));

export default useNotificationStore;
