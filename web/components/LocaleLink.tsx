"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { localeHref, type Locale } from "../lib/locale-routes";

function ResolvedLocaleLink({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const search = useSearchParams();
  return <Link href={localeHref(pathname, search.toString(), locale)} lang={locale} hrefLang={locale}>{locale === "en" ? "English" : "中文"}</Link>;
}

export default function LocaleLink({ locale }: { locale: Locale }) {
  return <Suspense fallback={<Link href={locale === "en" ? "/en" : "/zh"} lang={locale}>{locale === "en" ? "English" : "中文"}</Link>}><ResolvedLocaleLink locale={locale} /></Suspense>;
}
