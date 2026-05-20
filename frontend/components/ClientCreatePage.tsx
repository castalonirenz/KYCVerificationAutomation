"use client";

import { useState } from "react";
import { postJson } from "./api";
import { Shell } from "./Shell";

export function ClientCreatePage() {
  const [form, setForm] = useState({
    name: "",
    type: "Individual",
    email: "",
    phone: "",
    country: "",
    industry: "",
    relationship_manager: "",
  });
  const [notice, setNotice] = useState("Ready");

  async function submit() {
    setNotice("Saving...");
    try {
      await postJson("/clients", form);
      setForm({ name: "", type: "Individual", email: "", phone: "", country: "", industry: "", relationship_manager: "" });
      setNotice("Client created with a draft KYC case.");
    } catch {
      setNotice("Unable to create client. Sign in with the temporary admin first.");
    }
  }

  return (
    <Shell title="Create Client" description="Create a fresh client profile and draft KYC case.">
      <section className="bg-white p-[16px]">
        <div className="grid gap-[12px] md:grid-cols-2">
          {Object.entries(form).map(([key, value]) => (
            <label key={key} className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              {key.replaceAll("_", " ")}
              {key === "type" ? (
                <select
                  value={value}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
                >
                  <option>Individual</option>
                  <option>Corporate</option>
                </select>
              ) : (
                <input
                  value={value}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
                  required={key === "name"}
                />
              )}
            </label>
          ))}
        </div>
        <button onClick={submit} className="mt-[16px] h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">
          Create client
        </button>
        <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{notice}</p>
      </section>
    </Shell>
  );
}
