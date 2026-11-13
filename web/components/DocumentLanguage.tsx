"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DocumentLanguage() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh-CN";
  }, [pathname]);
  return null;
}
