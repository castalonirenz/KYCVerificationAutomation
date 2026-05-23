import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../apiClient";

export type ClientType = "individual" | "corporate";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Client {
  id: string;
  clientCode?: string;
  type: ClientType;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  riskLevel?: RiskLevel;
  riskScore?: number;
  status?: string;
  assignedTo?: { id: string; firstName: string; lastName: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export function useClients(filters?: Record<string, any>) {
  return useQuery(["clients", filters], () => apiClient.get<{ data: Client[]; meta?: any }>("/clients", filters), {
    keepPreviousData: true,
  });
}

export function useClient(id?: string) {
  return useQuery(["client", id], () => apiClient.get<Client>(`/clients/${id}`), { enabled: !!id });
}

export function useCreateClientDraft() {
  const qc = useQueryClient();
  return useMutation((payload: Partial<Client>) => apiClient.post<{ draftId: string; updatedAt: string }>("/clients/drafts", payload), {
    onSuccess() {
      qc.invalidateQueries(["clients"]);
    },
  });
}

export function useCompleteClientFromDraft() {
  const qc = useQueryClient();
  return useMutation(async ({ draftId }: { draftId: string }) => apiClient.post<Client>(`/clients/drafts/${draftId}/complete`), {
    onSuccess() {
      qc.invalidateQueries(["clients"]);
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation((payload: Partial<Client>) => apiClient.post<Client>("/clients", payload), {
    onSuccess() {
      qc.invalidateQueries(["clients"]);
    },
  });
}

export function useUpdateClient(clientId: string) {
  const qc = useQueryClient();
  return useMutation((payload: Partial<Client>) => apiClient.put<Client>(`/clients/${clientId}`, payload), {
    onSuccess() {
      qc.invalidateQueries(["clients", { id: clientId }]);
      qc.invalidateQueries(["clients"]);
    },
  });
}

export default {};
