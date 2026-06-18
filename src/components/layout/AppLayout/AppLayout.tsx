import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-base-200/40 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6">{children}</main>
    </div>
  );
}
