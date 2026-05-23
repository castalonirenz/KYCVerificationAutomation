import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";

export function useDocuments(filters?: Record<string, any>) {
  return useQuery(["documents", filters], () => apiClient.get<{ data: any[]; meta?: any }>("/documents", filters), {
    keepPreviousData: true,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation((formData: FormData) => apiClient.post<any>("/documents/upload", formData), {
    onSuccess() {
      qc.invalidateQueries(["documents"]);
    },
  });
}

export function useBulkUploadDocuments() {
  const qc = useQueryClient();
  return useMutation((payload: { formData: FormData }) => apiClient.post<any>(`/documents/bulk-upload`, payload.formData), {
    onSuccess() {
      qc.invalidateQueries(["documents"]);
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation((id: string) => apiClient.delete(`/documents/${encodeURIComponent(id)}`), {
    onSuccess() {
      qc.invalidateQueries(["documents"]);
    },
  });
}

export default {};
