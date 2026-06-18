"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/auth";

export default function LoginContent() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go home.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      router.replace("/");
    } catch {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card bg-base-100 border-base-300 w-full max-w-sm border shadow-xl">
        <div className="card-body gap-4">
          <div className="flex flex-col items-center gap-2">
            <span className="bg-primary text-primary-content grid h-12 w-12 place-items-center rounded-2xl text-2xl font-black shadow-sm">
              J
            </span>
            <h1 className="text-xl font-bold">เข้าสู่ระบบ Jari</h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="label-text mb-1 block font-medium">ชื่อผู้ใช้</label>
              <input
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label-text mb-1 block font-medium">รหัสผ่าน</label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {error && <div className="alert alert-error py-2 text-sm">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-full gap-1"
              disabled={submitting || !username || !password}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <LogIn size={16} />
              )}
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
