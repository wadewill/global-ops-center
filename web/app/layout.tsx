import type { Metadata } from "next";
import "./globals.css";
import DocumentLanguage from "../components/DocumentLanguage";

export const metadata: Metadata = {
  title: "ListingScore 商家服务",
  description: "检查商品数据问题，管理诊断报告、API 连接和修复任务。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><DocumentLanguage />{children}</body></html>;
}
