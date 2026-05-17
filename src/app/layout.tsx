import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하나루프 탄소 배출 대시보드",
  description: "과제용 탄소 배출 관리 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
