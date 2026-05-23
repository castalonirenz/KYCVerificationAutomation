"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson, setToken } from "./api";

type AuthPageProps = {
  mode: "login" | "forgot" | "otp";
  content: { title: string; description: string; action: string; endpoint: string };
};

export default function AuthPage({ mode, content }: AuthPageProps) {
  const router = useRouter();
  const [notice, setNotice] = useState("Ready");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  async function submit() {
    setNotice("Submitting...");
    try {
      const response = await postJson<any>(content.endpoint, {
        email,
        password,
        otp,
      });

      const token = response?.access_token ?? response?.data?.access_token ?? null;
      const message = response?.message ?? response?.data?.message ?? "Success";

      if (token) {
        setToken(token);
        router.push("/dashboard");
        return;
      }

      setNotice(message);
    } catch (err) {
      setNotice("Login failed or backend unavailable.");
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F7F8] text-[#111113] flex items-center justify-center">
      <section className="w-full max-w-[520px] bg-white p-[24px]">
        <p className="font-helvetica-medium text-[10.88px] leading-[1.35] text-[#FD5109]">KYC Smart Verification</p>
        <h1 className="mt-[8px] font-charter-bold text-[48.96px] leading-[1.1] tracking-[-0.9792px]">{content.title}</h1>
        <p className="mt-[8px] font-helvetica-regular text-[16px] leading-[1.4] text-[#626771]">{content.description}</p>
        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-[24px] flex flex-col gap-[12px]">
          <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109] bg-white" />
          </label>
          {mode === "login" && (
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
          )}
          {mode === "otp" && (
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              OTP code
              <input value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]" />
            </label>
          )}
          <button type="submit" className="mt-[24px] h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]">{content.action}</button>
        </form>
        <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{notice}</p>
      </section>
    </main>
  );
}
