import type { Metadata } from "next";
import { Lexend, Be_Vietnam_Pro } from "next/font/google"; // Neobrutalism fonts with Vietnamese support

import AuthProvider from "@/components/providers/AuthProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Interactive Learning - Học video thông minh hơn",
  description:
    "Platform học tập tương tác: Teacher tạo bài giảng video + quiz, Student học và kiểm tra kiến thức ngay trong lúc xem.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${lexend.variable} ${beVietnamPro.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
