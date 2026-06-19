"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./AppLayout.config";
import SyncButton from "./SyncButton";
import UserMenu from "./UserMenu";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <div className="lg:hidden">
          <Dropdown
            align="start"
            width="w-64"
            trigger={() => (
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-xs">
                <Menu size={18} />
              </span>
            )}
          >
            {(close) =>
              NAV_ITEMS.map(({ href, label, icon: Icon, feature }) => (
                <Link key={href} href={href} onClick={close}>
                  <DropdownItem active={isActive(pathname, href)}>
                    <Icon size={16} />
                    <span>{label}</span>
                    <span className="ml-auto text-xs text-gray-400">{feature}</span>
                  </DropdownItem>
                </Link>
              ))
            }
          </Dropdown>
        </div>

        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-base font-bold text-white shadow-xs">
            J
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900">Jari</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors " +
                  (active
                    ? "bg-gray-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")
                }
              >
                <Icon size={16} className={active ? "text-brand-600" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SyncButton />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
