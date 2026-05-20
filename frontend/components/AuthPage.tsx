"use client";

import { useState } from "react";
import { postJson } from "./api";

type AuthPageProps = {
  mode: "login" | "forgot" | "otp";
};

const copy = {
  login: {
    title: "Secure Sign In",
    description: "Passport token login for authorized compliance personnel.",
    action: "Sign in",
    endpoint: "/auth/login",
  },
  forgot: {
    title: "Password Recovery",
    description: "Password reset request workflow for internal compliance accounts.",
    action: "Send reset link",
    endpoint: "/auth/forgot-password",
  },
  otp: {
    title: "Verify OTP",
    description: "Multi-factor authentication verification before entering the compliance workspace.",
    action: "Verify code",
    endpoint: "/auth/verify-otp",
  },
};

export function AuthPage({ mode }: AuthPageProps) {
  const content = copy[mode];
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");
  const [otp, setOtp] = useState("123456");
  const [notice, setNotice] = useState("Ready");

  async function submit() {
    setNotice("Submitting...");
    try {
      const response = await postJson<{ data: { message: string; access_token?: string } }>(content.endpoint, {
        email,
        password,
        otp,
      });
      if (response.data.access_token) {
        localStorage.setItem("passport_token", response.data.access_token);
      }
      setNotice(response.data.message);
    } catch {
      setNotice("Backend unavailable. Form interaction is running in frontend preview mode.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7F8] px-[40px] py-[40px] text-[#111113]">
      <section className="w-full max-w-[520px] bg-white p-[24px]">
        <p className="font-helvetica-medium text-[10.88px] leading-[1.35] text-[#FD5109]">KYC Smart Verification</p>
        <h1 className="mt-[8px] font-charter-bold text-[48.96px] leading-[1.1] tracking-[-0.9792px]">{content.title}</h1>
        <p className="mt-[8px] font-helvetica-regular text-[16px] leading-[1.4] text-[#626771]">{content.description}</p>

        <div className="mt-[24px] flex flex-col gap-[12px]">
          <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
            />
          </label>
          {mode === "login" && (
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
              />
            </label>
          )}
          {mode === "otp" && (
            <label className="font-helvetica-medium text-[10.88px] leading-[1.35]">
              OTP code
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                className="mt-[5.44px] min-h-[32.64px] w-full border-[0.787px] border-[#A1A8B3] bg-white px-[6.702px] py-[5.026px] font-helvetica-regular text-[12.24px] leading-[1.4] outline-[#FD5109]"
              />
            </label>
          )}
        </div>

        <button
          onClick={submit}
          className="mt-[24px] h-[32.64px] bg-[#FFAA72] px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] text-[#1F0606]"
        >
          {content.action}
        </button>
        <p className="mt-[12px] font-helvetica-regular text-[9.761px] leading-[1.4] text-[#626771]">{notice}</p>
      </section>
    </main>
  );
}
