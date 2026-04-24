"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { texts } from "@/lib/config/texts";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await fetch("/api/admin/logout", { method: "POST" });
      setIsSubmitting(false);
      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="min-h-10 rounded-lg border border-[var(--border-soft)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
      aria-label={texts.admin.logoutAria}
    >
      {isSubmitting ? texts.admin.loggingOut : texts.admin.logout}
    </button>
  );
}
