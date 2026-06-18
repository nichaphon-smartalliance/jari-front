"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./AppLayout.config";
import SyncButton from "./SyncButton";
import ThemeSwitcher from "./ThemeSwitcher";
import UserMenu from "./UserMenu";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="navbar bg-base-100 border-base-300 sticky top-0 z-40 border-b px-3 sm:px-6">
      <div className="navbar-start gap-2">
        {/* Mobile menu */}
        <div className="dropdown lg:hidden">
          <button tabIndex={0} className="btn btn-ghost btn-sm">
            <Menu size={18} />
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-200 rounded-box z-50 mt-2 w-60 p-2 shadow-lg"
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon, feature }) => (
              <li key={href}>
                <Link href={href} className={isActive(pathname, href) ? "active" : ""}>
                  <Icon size={16} />
                  <span>{label}</span>
                  <span className="text-base-content/40 ml-auto text-xs">{feature}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="flex items-center gap-2">
          <span className="bg-primary text-primary-content grid h-8 w-8 place-items-center rounded-xl font-black shadow-sm">
            J
          </span>
          <span className="text-lg font-bold tracking-tight">Jari</span>
        </Link>
      </div>

      {/* Desktop nav */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`gap-1.5 ${isActive(pathname, href) ? "active font-semibold" : ""}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-1">
        <SyncButton />
        <UserMenu />
        <ThemeSwitcher />
      </div>
    </div>
  );
}
