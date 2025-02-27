import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能文档审阅系统",
  description: "AI驱动的文档分析与审阅平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
