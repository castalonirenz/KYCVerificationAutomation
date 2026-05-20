"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiStatus, formatValue, getJson, ModulePayload, postJson } from "./api";
import { Shell } from "./Shell";

type ModulePageProps = {
  title: string;
  description: string;
  endpoint: string;
  fallback: ModulePayload;
  searchKeys?: string[];
  primaryAction?: string;
};

export function ModulePage({
  title,
  description,
  endpoint,
  fallback,
  searchKeys,
  primaryAction,
}: ModulePageProps) {
  const [payload, setPayload] = useState<ModulePayload>(fallback);
  const [status, setStatus] = useState<ApiStatus>("connecting");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notice, setNotice] = useState("Ready");

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const response = await getJson<ModulePayload>(endpoint, controller.signal);
        setPayload({ ...response, data: response.data ?? [] });
        setStatus("connected");
      } catch {
        if (!controller.signal.aborted) {
          setPayload(fallback);
          setStatus("fallback");
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [endpoint, fallback]);

  async function runPrimaryAction() {
    if (primaryAction === "Create client") {
      window.location.href = "/clients/create";
      return;
    }

    if (primaryAction?.toLowerCase().includes("approve") && selectedItem?.case_id) {
      setNotice("Approving...");
      try {
        await postJson(`/kyc/cases/${selectedItem.case_id}/actions`, { action: "approve" });
        const response = await getJson<ModulePayload>(endpoint);
        setPayload({ ...response, data: response.data ?? [] });
        setNotice("Case approved.");
      } catch {
        setNotice("Approval failed. Sign in with a Passport token and try again.");
      }
      return;
    }

    setNotice(`${primaryAction} queued for ${title}.`);
  }

  const filteredData = useMemo(() => {
    const keys = searchKeys ?? [];
    return payload.data.filter((item) => {
      if (!query) return true;
      const haystack = keys.length > 0 ? keys.map((key) => item[key]).join(" ") : Object.values(item).join(" ");
      return haystack.toLowerCase().includes(query.toLowerCase());
    });
  }, [payload.data, query, searchKeys]);

  const selectedItem = filteredData[selectedIndex] ?? filteredData[0];

  return (
    <Shell title={title} description={description} status={status}>
      <div className="grid gap-[16px] lg:grid-cols-[300px_1fr]">
        <aside className="bg-white p-[16px]">
          <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">Search</label>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
            placeholder="Filter records"
          />
          <div className="mt-[16px] flex flex-col">
            {filteredData.map((item, index) => (
              <button
                key={`${title}-${index}`}
                onClick={() => setSelectedIndex(index)}
                className={`border-t-[0.697px] border-[#CBD1D6] px-[8.366px] py-[8.366px] text-left ${
                  selectedIndex === index ? "bg-[rgba(17,17,19,0.08)]" : "bg-white"
                }`}
              >
                <p className="truncate font-helvetica-medium text-[10.88px] leading-[1.35]">
                  {formatValue(item.name ?? item.id ?? item.case_id ?? item.role ?? item.type ?? `Record ${index + 1}`)}
                </p>
                <p className="mt-[2px] truncate font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">
                  {formatValue(item.status ?? item.category ?? item.severity ?? item.format ?? "Open")}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white p-[16px]">
          <div className="flex flex-wrap items-start justify-between gap-[16px]">
            <div>
              <h2 className="font-charter-bold text-[40px] leading-[1.1] tracking-[-0.8px]">
                {selectedItem ? formatValue(selectedItem.name ?? selectedItem.id ?? selectedItem.case_id ?? title) : "No records"}
              </h2>
              <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4] text-[#626771]">
                {filteredData.length} matching records
              </p>
            </div>
            {primaryAction && (
              <button
                onClick={runPrimaryAction}
                className="h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]"
              >
                {primaryAction}
              </button>
            )}
          </div>

          {selectedItem && (
            <div className="mt-[16px] grid gap-[10.387px] md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(selectedItem).map(([key, value]) => (
                <div key={key} className="border-[0.697px] border-[#CBD1D6] p-[10.387px]">
                  <p className="font-helvetica-medium text-[8.366px] leading-[1.4] text-[#626771]">
                    {key.replaceAll("_", " ")}
                  </p>
                  <p className="mt-[4px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                    {formatValue(value)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {(payload.rules || payload.stages || payload.events || payload.export_formats) && (
            <div className="mt-[16px] bg-[#F5F7F8] p-[10.387px]">
              <p className="font-helvetica-medium text-[12.24px] leading-[1.4]">Contract metadata</p>
              {payload.rules && (
                <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                  Rules: {payload.rules.map((rule) => `${rule.name} (${rule.weight})`).join(", ")}
                </p>
              )}
              {payload.stages && (
                <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                  Stages: {payload.stages.join(", ")}
                </p>
              )}
              {payload.events && (
                <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                  Events: {payload.events.join(", ")}
                </p>
              )}
              {payload.export_formats && (
                <p className="mt-[8px] font-helvetica-regular text-[12.24px] leading-[1.4]">
                  Export formats: {payload.export_formats.join(", ")}
                </p>
              )}
            </div>
          )}

          <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">
            {notice}
          </p>
        </section>
      </div>
    </Shell>
  );
}
