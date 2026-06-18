import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/context/query";
import { AuthProvider } from "@/context/auth";

export const metadata: Metadata = {
  title: "Jari — Jira made fast",
  description: "Sprint health, fast story/subtask creation, one-click done, and easy worklogs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
