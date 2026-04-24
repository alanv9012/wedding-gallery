"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { texts } from "@/lib/config/texts";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError(texts.admin.passwordRequired);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;

      if (!response.ok || !result?.success) {
        setError(result?.error ?? texts.admin.loginFailed);
        setIsSubmitting(false);
        return;
      }

      setPassword("");
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setError(texts.admin.loginFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--border-soft)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">{texts.admin.loginTitle}</h2>
      <p className="text-sm text-[var(--foreground)]">{texts.admin.loginDescription}</p>
      <label className="block text-sm font-medium text-[var(--foreground)]" htmlFor="admin-password">
        {texts.admin.password}
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-[var(--border-soft)] px-4 text-base text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        autoComplete="current-password"
        aria-describedby={error ? "admin-login-error" : undefined}
      />
      {error && (
        <p id="admin-login-error" className="text-sm text-[var(--foreground)]" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-12 w-full rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[#e8deeb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:bg-[#e2dde4]"
        aria-label={texts.admin.passwordAria}
      >
        {isSubmitting ? texts.admin.verifying : texts.admin.login}
      </button>
    </form>
  );
}
