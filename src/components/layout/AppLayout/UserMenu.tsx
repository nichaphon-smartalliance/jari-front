"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { Avatar } from "@/components/ui/Avatar";

export default function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <Dropdown
      width="w-60"
      trigger={(open) => (
        <span className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-gray-100">
          <Avatar name={user.displayName} size={32} />
          <span className="hidden max-w-28 truncate text-sm font-semibold text-gray-700 sm:inline">
            {user.displayName}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      )}
    >
      {(close) => (
        <>
          <div className="flex items-center gap-2.5 border-b border-gray-100 px-2.5 py-2">
            <Avatar name={user.displayName} size={36} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">
                {user.displayName}
              </div>
              <div className="truncate text-xs text-gray-500">@{user.username}</div>
            </div>
          </div>
          <div className="pt-1">
            <DropdownItem
              danger
              onClick={() => {
                close();
                logout();
              }}
            >
              <LogOut size={15} /> ออกจากระบบ
            </DropdownItem>
          </div>
        </>
      )}
    </Dropdown>
  );
}
