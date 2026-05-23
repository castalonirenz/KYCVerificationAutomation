"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import useNotificationStore from "../store/notificationStore";

const navItems = [
  ["/dashboard", "Dashboard"],
  ["/clients", "Clients"],
  ["/kyc/review", "KYC Review"],
  ["/access-management", "Access"],
  ["/compliance/sanctions", "Compliance"],
  ["/reports", "Reports"],
  ["/analytics", "Analytics"],
];

export function Shell({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description: string;
  status?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const notifications = useNotificationStore((s) => s.notifications);
  const startStream = useNotificationStore((s) => s.startStream);
  const stopStream = useNotificationStore((s) => s.stopStream);

  useEffect(() => {
    startStream();
    return () => stopStream();
  }, [startStream, stopStream]);

  return (
    <main className="min-h-screen bg-[#F5F7F8] text-[#111113]">
      <header className="bg-[#111113] px-[40px] pb-[28px] pt-[20px] text-white">
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div>
            <p className="font-helvetica-medium text-[10.88px] leading-[1.35] text-[#FFAA72]">RM Compliance Team</p>
            <h1 className="mt-[8px] font-charter-bold text-[48.96px] leading-[1.1] tracking-[-0.9792px]">{title}</h1>
            <p className="mt-[8px] max-w-[780px] font-helvetica-regular text-[16px] leading-[1.4] text-[#EEEFF1]">{description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button aria-label="Notifications" className="rounded-full bg-white/10 p-2">🔔</button>
              {notifications?.filter((n) => !n.isRead).length ? (
                <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {notifications.filter((n) => !n.isRead).length}
                </span>
              ) : null}
            </div>
            <div className="bg-[linear-gradient(to_bottom,#FE8303_0%,#FD5108_75%,#EE3D08_100%)] px-[13.6px] py-[8.16px] text-right"></div>
          </div>
        </div>
        <nav className="mt-[24px] flex flex-wrap gap-[8px]">
          {navItems.map(([href, label]) => (
            <Link
              key={String(href)}
              href={String(href)}
              className={`px-[13.6px] py-[8.16px] font-helvetica-medium text-[12.24px] leading-[1.4] ${pathname.startsWith(String(href)) ? "bg-[#FFAA72] text-[#1F0606]" : "border-[0.697px] border-[#626771] text-white"}`}>
              {label}
            </Link>
          ))}
          {status && (
            <span className="ml-auto bg-[#F5F7F8] px-[5.577px] py-[2.789px] font-helvetica-medium text-[8.366px] leading-[1.4] text-[#111113]">API status: {status}</span>
          )}
        </nav>
      </header>
      <section className="px-[40px] py-[24px]">{children}</section>
    </main>
  );
}
