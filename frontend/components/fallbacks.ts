import type { ModulePayload } from "./api";

export const usersFallback: ModulePayload = {
  data: [],
};

export const clientsFallback: ModulePayload = {
  data: [],
};

export const documentsFallback: ModulePayload = {
  data: [],
};

export const riskFallback: ModulePayload = {
  data: [],
};

export const screeningFallback: ModulePayload = {
  data: [],
};

export const workflowFallback: ModulePayload = {
  data: [],
  stages: ["Pending Verification", "Under Review", "Requires Additional Documents", "Approved", "Rejected", "Escalated"],
};

export const auditFallback: ModulePayload = {
  data: [],
};

export const notificationsFallback: ModulePayload = {
  data: [],
  events: ["notification:new", "risk:updated", "kyc:approved", "document:uploaded", "case:escalated", "sla:breached"],
};

export const reportsFallback: ModulePayload = {
  data: [],
  export_formats: ["pdf", "csv", "xlsx"],
};
