import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";
import useNotificationStore from "../../store/notificationStore";
import { useEffect } from "react";

export function useNotifications(params?: Record<string, any>) {
  return useQuery(["notifications", params], () => apiClient.get<{ data: any[]; meta?: any }>("/notifications", params));
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation((id: string) => apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`), {
    onSuccess() {
      qc.invalidateQueries(["notifications"]);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation(() => apiClient.patch(`/notifications/read-all`), {
    onSuccess() {
      qc.invalidateQueries(["notifications"]);
    },
  });
}

export function useNotificationsStream() {
  const store = useNotificationStore();
  useEffect(() => {
    store.startStream();
    return () => store.stopStream();
  }, [store]);
}

export default {};
