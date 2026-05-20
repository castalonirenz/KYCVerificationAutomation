"use client";

import { useEffect, useMemo, useState } from "react";

type ClientStatus =
  | "Pending Verification"
  | "Under Review"
  | "Requires Documents"
  | "Approved"
  | "Escalated";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type ClientRecord = {
  id: string;
  name: string;
  type: "Individual" | "Corporate";
  owner: string;
  country: string;
  industry: string;
  status: ClientStatus;
  risk: RiskLevel;
  score: number;
  sla: number;
  docs: number;
  alerts: number;
  lastActivity: string;
};

type ApiClientRecord = Omit<ClientRecord, "lastActivity"> & {
  last_activity: string;
};

type DocumentRecord = {
  name: string;
  status: string;
  note: string;
};

type AuditRecord = {
  timestamp: string;
  message: string;
};

type AlertRecord = {
  id: string;
  severity: string;
  message: string;
  channel?: string;
};

type OverviewMetrics = {
  total_cases: number;
  open_cases: number;
  high_risk_cases: number;
  average_risk_score: number;
  active_alerts: number;
  sla_hours_remaining: number;
};

type CaseDetail = ClientRecord & {
  documents: DocumentRecord[];
  workflow: string[];
  auditTrail: AuditRecord[];
};

type PlatformModule = {
  label: string;
  endpoint: string;
  description: string;
};

type ModuleItem = Record<string, string | number | boolean | string[] | null>;

type ModulePayload = {
  data: ModuleItem[];
  rules?: ModuleItem[];
  stages?: string[];
  events?: string[];
  export_formats?: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const fallbackClients: ClientRecord[] = [
  {
    id: "KYC-1048",
    name: "Northbridge Capital Holdings",
    type: "Corporate",
    owner: "M. Santos",
    country: "Philippines",
    industry: "Financial services",
    status: "Escalated",
    risk: "Critical",
    score: 92,
    sla: 6,
    docs: 9,
    alerts: 5,
    lastActivity: "Risk override requested",
  },
  {
    id: "KYC-1047",
    name: "Elena V. Cruz",
    type: "Individual",
    owner: "A. Reyes",
    country: "Singapore",
    industry: "Private banking",
    status: "Under Review",
    risk: "High",
    score: 78,
    sla: 14,
    docs: 6,
    alerts: 3,
    lastActivity: "PEP screening matched",
  },
  {
    id: "KYC-1046",
    name: "Maritime One Logistics",
    type: "Corporate",
    owner: "J. Lim",
    country: "Malaysia",
    industry: "Shipping",
    status: "Requires Documents",
    risk: "Medium",
    score: 54,
    sla: 28,
    docs: 4,
    alerts: 1,
    lastActivity: "Proof of address expired",
  },
  {
    id: "KYC-1045",
    name: "Tala Renewable Energy Corp.",
    type: "Corporate",
    owner: "C. Mendoza",
    country: "Philippines",
    industry: "Energy",
    status: "Pending Verification",
    risk: "Medium",
    score: 47,
    sla: 32,
    docs: 7,
    alerts: 0,
    lastActivity: "Documents uploaded",
  },
  {
    id: "KYC-1044",
    name: "Daniel Foster",
    type: "Individual",
    owner: "R. Tan",
    country: "United States",
    industry: "Consulting",
    status: "Approved",
    risk: "Low",
    score: 21,
    sla: 0,
    docs: 5,
    alerts: 0,
    lastActivity: "Reviewer approved profile",
  },
];

const fallbackWorkflowStages = [
  "Draft",
  "Pending Verification",
  "Under Review",
  "Manager Approval",
  "Approved",
];

const fallbackDocuments: DocumentRecord[] = [
  { name: "Government ID", status: "Reviewed", note: "Valid until 2028" },
  { name: "Business permit", status: "Ready to review", note: "Uploaded today" },
  { name: "Proof of address", status: "Awaiting data", note: "Expired 3 days ago" },
  { name: "Beneficial ownership", status: "Unmatched", note: "Needs reviewer decision" },
];

const fallbackAuditTrail: AuditRecord[] = [
  { timestamp: "2026-05-20T10:42:00+08:00", message: "Risk Analyst A. Reyes completed sanctions screening" },
  { timestamp: "2026-05-20T10:35:00+08:00", message: "Compliance Officer M. Santos added high-risk jurisdiction flag" },
  { timestamp: "2026-05-20T10:28:00+08:00", message: "System recalculated AML score after document update" },
  { timestamp: "2026-05-20T10:21:00+08:00", message: "Reviewer C. Mendoza requested additional proof of address" },
];

const fallbackAlerts: AlertRecord[] = [
  { id: "ALT-9001", severity: "critical", message: "SLA breach risk for Northbridge Capital Holdings" },
  { id: "ALT-9002", severity: "high", message: "PEP match requires reviewer confirmation" },
  { id: "ALT-9003", severity: "medium", message: "Proof of address expiration reminder sent" },
];

const tabs = ["Overview", "Screening", "Documents", "Audit"];

const platformModules: PlatformModule[] = [
  { label: "Users & RBAC", endpoint: "/users", description: "Authentication users, roles, departments, MFA, and account status." },
  { label: "Client Profiles", endpoint: "/clients", description: "Individual and corporate profiles, ownership, status, and history." },
  { label: "Documents", endpoint: "/documents", description: "KYC document categories, versions, expiry monitoring, and review state." },
  { label: "Risk Scoring", endpoint: "/risk/assessments", description: "Automated risk score, risk factors, rules, and override support." },
  { label: "Compliance Screening", endpoint: "/compliance/screenings", description: "PEP, sanctions, watchlist, and compliance rule screening results." },
  { label: "Workflows", endpoint: "/workflows", description: "Approval stages, assignments, escalations, and next reviewer actions." },
  { label: "Audit Logs", endpoint: "/audit-logs", description: "Immutable profile, document, risk, approval, and login activity events." },
  { label: "Notifications", endpoint: "/notifications", description: "System alerts, email reminders, SLA events, and WebSocket contract." },
  { label: "Reports", endpoint: "/reports", description: "High-risk, pending verification, expired document, and activity exports." },
];

const fallbackModuleData: Record<string, ModulePayload> = {
  "Users & RBAC": {
    data: [
      { id: "USR-001", name: "Maria Santos", role: "Compliance Manager", department: "RM Compliance", status: "Active" },
      { id: "USR-002", name: "Ana Reyes", role: "Risk Analyst", department: "Risk Review", status: "Active" },
    ],
  },
  "Client Profiles": {
    data: fallbackClients.map((client) => ({
      id: client.id,
      name: client.name,
      type: client.type,
      status: client.status,
      risk_classification: client.risk,
    })),
  },
  Documents: {
    data: fallbackDocuments.map((document, index) => ({ id: `DOC-${index + 1}`, ...document })),
  },
  "Risk Scoring": {
    data: fallbackClients.map((client) => ({ case_id: client.id, score: client.score, category: client.risk, factors: [client.lastActivity] })),
  },
  "Compliance Screening": {
    data: [{ id: "SCR-7001", case_id: "KYC-1048", type: "Sanctions", result: "Potential match", status: "Escalated" }],
  },
  Workflows: {
    data: [{ case_id: "KYC-1048", stage: "Escalated", assignee: "Compliance Manager", next_action: "Approve risk override" }],
  },
  "Audit Logs": {
    data: fallbackAuditTrail,
  },
  Notifications: {
    data: fallbackAlerts,
    events: ["notification:new", "risk:updated", "kyc:approved", "document:uploaded", "case:escalated", "sla:breached"],
  },
  Reports: {
    data: [{ id: "RPT-001", name: "High-risk client report", format: "PDF/CSV", records: 2 }],
    export_formats: ["pdf", "csv", "xlsx"],
  },
};

function statusBadge(status: string) {
  if (status === "Reviewed" || status === "Approved") return "bg-[#ECFDF5]";
  if (status === "Awaiting data" || status === "Requires Documents") return "bg-[#FEF2F2]";
  if (status === "Ready to review" || status === "Under Review" || status === "Pending Verification") {
    return "bg-[#EFF6FF]";
  }
  return "bg-[#FCFAEA]";
}

function riskColor(risk: RiskLevel) {
  return {
    Low: "bg-[#ECFDF5]",
    Medium: "bg-[#FCFAEA]",
    High: "bg-[#FEF2F2]",
    Critical: "bg-[#FD5109] text-white",
  }[risk];
}

function normalizeClient(client: ApiClientRecord): ClientRecord {
  return {
    ...client,
    lastActivity: client.last_activity,
  };
}

function formatAuditTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(timestamp));
}

function formatModuleValue(value: ModuleItem[string]) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null) return "None";
  return String(value);
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [activeModule, setActiveModule] = useState(platformModules[0].label);
  const [modulePayload, setModulePayload] = useState<ModulePayload>(fallbackModuleData[platformModules[0].label]);
  const [clients, setClients] = useState<ClientRecord[]>(fallbackClients);
  const [selectedId, setSelectedId] = useState(fallbackClients[0].id);
  const [selectedCase, setSelectedCase] = useState<CaseDetail | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertRecord[]>(fallbackAlerts);
  const [auditTrail, setAuditTrail] = useState<AuditRecord[]>(fallbackAuditTrail);
  const [query, setQuery] = useState("");
  const [riskThreshold, setRiskThreshold] = useState(60);
  const [showOnlyAlerts, setShowOnlyAlerts] = useState(false);
  const [apiStatus, setApiStatus] = useState<"connecting" | "connected" | "fallback">("connecting");
  const [actionMessage, setActionMessage] = useState("No workflow action submitted yet.");

  useEffect(() => {
    const controller = new AbortController();

    async function loadOverview() {
      try {
        const response = await fetch(`${API_BASE_URL}/kyc/overview`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Overview request failed.");

        const payload = await response.json();
        setOverviewMetrics(payload.data.metrics);
        setAlerts(payload.data.alerts);
        setAuditTrail(payload.data.audit_trail);
        setApiStatus("connected");
      } catch {
        if (!controller.signal.aborted) setApiStatus("fallback");
      }
    }

    loadOverview();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      search: query,
      risk_threshold: String(riskThreshold),
      alerts_only: String(showOnlyAlerts),
    });

    async function loadCases() {
      try {
        const response = await fetch(`${API_BASE_URL}/kyc/cases?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Cases request failed.");

        const payload = await response.json();
        const apiClients = payload.data.map(normalizeClient);
        setClients(apiClients.length > 0 ? apiClients : fallbackClients);
        setApiStatus("connected");
      } catch {
        if (!controller.signal.aborted) {
          setClients(fallbackClients);
          setApiStatus("fallback");
        }
      }
    }

    loadCases();

    return () => controller.abort();
  }, [query, riskThreshold, showOnlyAlerts]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCaseDetail() {
      try {
        const response = await fetch(`${API_BASE_URL}/kyc/cases/${selectedId}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Case detail request failed.");

        const payload = await response.json();
        const detail = normalizeClient(payload.data);
        setSelectedCase({
          ...detail,
          documents: payload.data.documents,
          workflow: payload.data.workflow,
          auditTrail: payload.data.audit_trail,
        });
        setApiStatus("connected");
      } catch {
        if (!controller.signal.aborted) {
          const fallbackClient = fallbackClients.find((client) => client.id === selectedId) ?? fallbackClients[0];
          setSelectedCase({
            ...fallbackClient,
            documents: fallbackDocuments,
            workflow: fallbackWorkflowStages,
            auditTrail: fallbackAuditTrail,
          });
          setApiStatus("fallback");
        }
      }
    }

    loadCaseDetail();

    return () => controller.abort();
  }, [selectedId]);

  useEffect(() => {
    const controller = new AbortController();
    const selectedModule = platformModules.find((item) => item.label === activeModule) ?? platformModules[0];

    async function loadModule() {
      try {
        const response = await fetch(`${API_BASE_URL}${selectedModule.endpoint}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Module request failed.");

        const payload = await response.json();
        setModulePayload({
          ...payload,
          data: payload.data ?? [],
        });
        setApiStatus("connected");
      } catch {
        if (!controller.signal.aborted) {
          setModulePayload(fallbackModuleData[selectedModule.label]);
          setApiStatus("fallback");
        }
      }
    }

    loadModule();

    return () => controller.abort();
  }, [activeModule]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const queryMatch = `${client.name} ${client.id} ${client.owner}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const alertMatch = showOnlyAlerts ? client.alerts > 0 || client.score >= riskThreshold : true;
      return queryMatch && alertMatch;
    });
  }, [clients, query, riskThreshold, showOnlyAlerts]);

  const selectedClient =
    selectedCase ?? filteredClients.find((client) => client.id === selectedId) ?? filteredClients[0] ?? fallbackClients[0];

  const highRiskCount = clients.filter((client) => client.score >= riskThreshold).length;
  const pendingCount = clients.filter((client) => client.status !== "Approved").length;
  const avgScore = Math.round(clients.reduce((total, client) => total + client.score, 0) / clients.length);
  const documents = selectedCase?.documents ?? fallbackDocuments;
  const workflowStages = selectedCase?.workflow ?? fallbackWorkflowStages;
  const dashboardMetrics = overviewMetrics ?? {
    total_cases: clients.length,
    open_cases: pendingCount,
    high_risk_cases: highRiskCount,
    average_risk_score: avgScore,
    active_alerts: clients.reduce((total, client) => total + client.alerts, 0),
    sla_hours_remaining: clients.reduce((total, client) => total + client.sla, 0),
  };

  async function submitAction(action: "approve" | "escalate") {
    setActionMessage(`Submitting ${action} action...`);

    try {
      const response = await fetch(`${API_BASE_URL}/kyc/cases/${selectedClient.id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          notes: `Submitted from KYC frontend ${activeTab} workspace.`,
        }),
      });

      if (!response.ok) throw new Error("Action request failed.");

      const payload = await response.json();
      setActionMessage(payload.data.message);
      setApiStatus("connected");
    } catch {
      setActionMessage("Backend is offline, so the action was kept in the frontend preview only.");
      setApiStatus("fallback");
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7F8] text-[#111113]">
      <section className="bg-[#111113] px-[40px] pb-[40px] pt-[24px] text-white">
        <div className="flex items-start justify-between gap-[24px]">
          <div>
            <p className="font-helvetica-medium text-[10.88px] leading-[1.35] text-[#FFAA72]">
              RM Compliance Team
            </p>
            <h1 className="mt-[8px] max-w-[900px] font-charter-bold text-[48.96px] leading-[1.1] tracking-[-0.9792px]">
              KYC Smart Verification System
            </h1>
            <p className="mt-[12px] max-w-[760px] font-helvetica-regular text-[18px] leading-[1.4] text-[#EEEFF1]">
              Centralized onboarding, AML screening, risk scoring, approvals, and audit readiness for internal compliance operations.
            </p>
            <p className="mt-[12px] inline-flex bg-[#F5F7F8] px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4] text-[#111113]">
              API status: {apiStatus}
            </p>
          </div>
          <div className="hidden min-w-[110px] bg-[linear-gradient(to_bottom,#FE8303_0%,#FD5108_75%,#EE3D08_100%)] px-[13.6px] py-[8.16px] text-right md:block">
            <p className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">PwC</p>
          </div>
        </div>
      </section>

      <section className="px-[40px] py-[24px]">
        <div className="grid gap-[16px] lg:grid-cols-[280px_1fr_360px]">
          <aside className="bg-white p-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">Queue</h2>
              <span className="bg-[#FCFAEA] px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]">
                {pendingCount} open
              </span>
            </div>

            <label className="mt-[16px] block font-helvetica-medium text-[10.88px] leading-[1.35]">
              Search client
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
              placeholder="Name, case ID, owner"
            />

            <label className="mt-[20px] flex items-center gap-[8px] font-helvetica-medium text-[10.88px] leading-[1.35]">
              <input
                type="checkbox"
                checked={showOnlyAlerts}
                onChange={(event) => setShowOnlyAlerts(event.target.checked)}
                className="size-[16px] accent-[#FD5109]"
              />
              Show alerts only
            </label>

            <div className="mt-[24px] flex flex-col gap-[8.16px]">
              <div className="flex items-center justify-between">
                <p className="font-helvetica-medium text-[10.88px] leading-[1.35]">Risk threshold</p>
                <p className="font-helvetica-regular text-[10.88px] leading-[1.4] text-[#626771]">{riskThreshold}</p>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={riskThreshold}
                onChange={(event) => setRiskThreshold(Number(event.target.value))}
                className="w-full accent-[#FD5109]"
              />
            </div>

            <div className="mt-[24px] grid grid-cols-2 gap-[10.387px]">
              {[
                ["High risk", dashboardMetrics.high_risk_cases],
                ["Avg score", dashboardMetrics.average_risk_score],
                ["Alerts", dashboardMetrics.active_alerts],
                ["SLA hrs", dashboardMetrics.sla_hours_remaining],
              ].map(([label, value]) => (
                <div key={label} className="border-[0.697px] border-[#CBD1D6] bg-[#F5F7F8] p-[10.387px]">
                  <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">{label}</p>
                  <p className="mt-[4px] font-charter-bold text-[32px] leading-[1.1]">{value}</p>
                </div>
              ))}
            </div>
          </aside>

          <section className="bg-white">
            <div className="flex items-center border-[0.895px] border-[#CBD1D6] border-b-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative h-[59.84px] min-w-[53.04px] grow px-[10.88px] py-[16.32px] font-helvetica-medium text-[12.24px] leading-[1.4]"
                >
                  <span className={activeTab === tab ? "text-[#111113]" : "text-[#626771]"}>{tab}</span>
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 pointer-events-none border-solid ${
                      activeTab === tab
                        ? "border-[#FD5108] border-[0px_0px_2.72px]"
                        : "border-[#8E95A2] border-[0px_0px_0.68px]"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border-[0.895px] border-[#CBD1D6]">
              <div className="grid min-w-[760px] grid-cols-[100px_1.4fr_110px_120px_90px_90px]">
                {["Case", "Client", "Status", "Owner", "Risk", "SLA"].map((header) => (
                  <div key={header} className="relative flex h-[22.47px] items-center px-[8.366px]">
                    <p className="font-helvetica-medium text-[9.761px] leading-[1.35]">{header}</p>
                    <span aria-hidden="true" className="absolute inset-0 border-[#CBD1D6] border-[0px_0px_0.697px]" />
                  </div>
                ))}

                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={`contents text-left ${selectedClient.id === client.id ? "selected-row" : ""}`}
                  >
                    {[client.id, client.name, client.status, client.owner, client.risk, `${client.sla}h`].map((cell, index) => (
                      <div
                        key={`${client.id}-${cell}`}
                        className={`relative flex h-[39.376px] items-center px-[8.366px] ${
                          selectedClient.id === client.id ? "bg-[rgba(17,17,19,0.08)]" : "bg-white"
                        }`}
                      >
                        {index === 2 ? (
                          <span className={`${statusBadge(String(cell))} px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]`}>
                            {cell}
                          </span>
                        ) : index === 4 ? (
                          <span className={`${riskColor(client.risk)} px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]`}>
                            {cell}
                          </span>
                        ) : (
                          <p className="truncate font-helvetica-regular text-[9.761px] leading-[1.4]">{cell}</p>
                        )}
                        <span aria-hidden="true" className="absolute inset-0 border-[#CBD1D6] border-[0px_0px_0.697px]" />
                      </div>
                    ))}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-white p-[16px]">
            <div className="flex items-start justify-between gap-[16px]">
              <div>
                <p className="font-helvetica-medium text-[10.88px] leading-[1.35] text-[#626771]">{selectedClient.id}</p>
                <h2 className="mt-[4px] font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">
                  {selectedClient.name}
                </h2>
              </div>
              <span className={`${riskColor(selectedClient.risk)} px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]`}>
                {selectedClient.risk}
              </span>
            </div>

            <div className="mt-[20px] grid grid-cols-3 gap-[10.387px]">
              {[
                ["Score", selectedClient.score],
                ["Docs", selectedClient.docs],
                ["Alerts", selectedClient.alerts],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#F5F7F8] p-[10.387px]">
                  <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">{label}</p>
                  <p className="mt-[4px] font-charter-bold text-[32px] leading-[1.1]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-[24px]">
              <p className="font-helvetica-medium text-[12.24px] leading-[1.4]">Workflow</p>
              <div className="mt-[12px] flex flex-col gap-[8px]">
                {workflowStages.map((stage, index) => {
                  const currentIndex = workflowStages.findIndex((item) => item === selectedClient.status);
                  const active = index <= Math.max(currentIndex, 1);
                  return (
                    <div key={stage} className="flex items-center gap-[8px]">
                      <span className={`size-[11.155px] ${active ? "bg-[#FD5108]" : "border border-[#8E95A2]"}`} />
                      <p className={`font-helvetica-regular text-[9.761px] leading-[1.4] ${active ? "text-[#111113]" : "text-[#626771]"}`}>
                        {stage}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-[24px]">
              <p className="font-helvetica-medium text-[12.24px] leading-[1.4]">Documents</p>
              <div className="mt-[8px] flex flex-col">
                {documents.map(({ name, status, note }) => (
                  <div key={name} className="border-t-[0.697px] border-[#CBD1D6] py-[8.366px]">
                    <div className="flex items-center justify-between gap-[8px]">
                      <p className="font-helvetica-regular text-[9.761px] leading-[1.4]">{name}</p>
                      <span className={`${statusBadge(status)} px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-[4px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[24px] flex gap-[8.16px]">
              <button
                onClick={() => submitAction("approve")}
                className="h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]"
              >
                Approve
              </button>
              <button
                onClick={() => submitAction("escalate")}
                className="h-[32.64px] border-[0.787px] border-[#A1A8B3] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#111113]"
              >
                Escalate
              </button>
            </div>
            <p className="mt-[8px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">
              {actionMessage}
            </p>
          </aside>
        </div>

        <section className="mt-[16px] grid gap-[16px] lg:grid-cols-[1fr_360px]">
          <div className="bg-white p-[16px]">
            <div className="flex items-center justify-between">
              <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">Audit trail</h2>
              <span className="font-helvetica-regular text-[10.88px] leading-[1.4] text-[#626771]">
                Immutable activity log
              </span>
            </div>
            <div className="mt-[12px] grid gap-[8px] md:grid-cols-2">
              {auditTrail.map((item) => (
                <div key={`${item.timestamp}-${item.message}`} className="border-[0.697px] border-[#CBD1D6] p-[10.387px]">
                  <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">
                    {formatAuditTime(item.timestamp)}
                  </p>
                  <p className="mt-[4px] font-helvetica-regular text-[12.24px] leading-[1.4]">{item.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-[16px]">
            <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">Alerts</h2>
            <div className="mt-[12px] flex flex-col gap-[8px]">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-[#FEF2F2] p-[10.387px]">
                  <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">
                    {alert.severity}
                  </p>
                  <p className="mt-[4px] font-helvetica-regular text-[12.24px] leading-[1.4]">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-[16px] grid gap-[16px] lg:grid-cols-[280px_1fr]">
          <aside className="bg-white p-[16px]">
            <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">Modules</h2>
            <div className="mt-[12px] flex flex-col">
              {platformModules.map((module) => (
                <button
                  key={module.label}
                  onClick={() => setActiveModule(module.label)}
                  className={`border-t-[0.697px] border-[#CBD1D6] px-[8.366px] py-[8.366px] text-left font-helvetica-medium text-[10.88px] leading-[1.35] ${
                    activeModule === module.label ? "bg-[rgba(17,17,19,0.08)] text-[#111113]" : "bg-white text-[#626771]"
                  }`}
                >
                  {module.label}
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-white p-[16px]">
            <div className="flex flex-wrap items-start justify-between gap-[16px]">
              <div>
                <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">{activeModule}</h2>
                <p className="mt-[8px] max-w-[720px] font-helvetica-regular text-[12.24px] leading-[1.4] text-[#626771]">
                  {platformModules.find((module) => module.label === activeModule)?.description}
                </p>
              </div>
              <span className="bg-[#EFF6FF] px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4]">
                {modulePayload.data.length} records
              </span>
            </div>

            <div className="mt-[16px] grid gap-[10.387px] md:grid-cols-2 xl:grid-cols-3">
              {modulePayload.data.map((item, index) => (
                <article key={`${activeModule}-${index}`} className="border-[0.697px] border-[#CBD1D6] p-[10.387px]">
                  {Object.entries(item).slice(0, 6).map(([key, value]) => (
                    <div key={key} className="border-t-[0.697px] border-[#CBD1D6] py-[5.44px] first:border-t-0 first:pt-0">
                      <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">
                        {key.replaceAll("_", " ")}
                      </p>
                      <p className="mt-[2px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                        {formatModuleValue(value)}
                      </p>
                    </div>
                  ))}
                </article>
              ))}
            </div>

            {(modulePayload.rules || modulePayload.stages || modulePayload.events || modulePayload.export_formats) && (
              <div className="mt-[16px] bg-[#F5F7F8] p-[10.387px]">
                <p className="font-helvetica-medium text-[12.24px] leading-[1.4]">Contract metadata</p>
                {modulePayload.rules && (
                  <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                    Rules: {modulePayload.rules.map((rule) => `${rule.name} (${rule.weight})`).join(", ")}
                  </p>
                )}
                {modulePayload.stages && (
                  <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                    Stages: {modulePayload.stages.join(", ")}
                  </p>
                )}
                {modulePayload.events && (
                  <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                    Events: {modulePayload.events.join(", ")}
                  </p>
                )}
                {modulePayload.export_formats && (
                  <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                    Export formats: {modulePayload.export_formats.join(", ")}
                  </p>
                )}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
