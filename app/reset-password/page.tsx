// app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  
  if (!token) {
    return (
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-red-500/30 p-8 rounded-2xl shadow-2xl text-center">
        <p className="text-red-400 mb-4 font-medium">Invalid or missing reset token. Please request a new password reset link.</p>
        <Link href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition">Go back</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
        <p className="text-sm text-gray-400">Enter your new password below.</p>
      </div>

      {message && <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-200 rounded-xl text-center text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-center text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-2"
        >
          {isLoading ? "Saving..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-zinc-900 p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}