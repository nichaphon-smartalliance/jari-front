"use client";

import { LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth";

export default function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="dropdown dropdown-end">
      <button tabIndex={0} className="btn btn-ghost btn-sm gap-1">
        <UserCircle2 size={18} />
        <span className="hidden max-w-28 truncate sm:inline">{user.displayName}</span>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 border-base-300 rounded-box z-50 mt-2 w-56 border p-2 shadow-lg"
      >
        <li className="menu-title text-xs">
          {user.displayName}
          <span className="text-base-content/50 font-normal">@{user.username}</span>
        </li>
        <li>
          <button onClick={logout} className="text-error">
            <LogOut size={15} /> ออกจากระบบ
          </button>
        </li>
      </ul>
    </div>
  );
}
