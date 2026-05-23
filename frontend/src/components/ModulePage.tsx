"use client";

import React from "react";

export default function ModulePage({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-white p-[16px]">
      {title && <h2 className="font-charter-bold text-[28px] leading-[1.1]">{title}</h2>}
      {children}
    </section>
  );
}
