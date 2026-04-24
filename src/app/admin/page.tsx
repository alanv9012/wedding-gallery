import { cookies } from "next/headers";
import { AdminPhotoList } from "@/components/admin/admin-photo-list";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { texts } from "@/lib/config/texts";
import { createAdminPhotoService } from "@/lib/services";
import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSession } from "@/lib/services/admin-auth-service";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const isAuthorized = isValidAdminSession(sessionCookie);

  if (!isAuthorized) {
    return (
      <section className="mx-auto w-full max-w-md">
        <AdminLoginForm />
      </section>
    );
  }

  const adminPhotoService = createAdminPhotoService();
  const photos = await adminPhotoService.getAdminPhotoList();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{texts.admin.panelTitle}</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]">{texts.admin.panelDescription}</p>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-[var(--foreground)]">{texts.admin.totalUploads(photos.length)}</p>
        <p className="mt-1 text-sm text-[var(--foreground)]">
          {texts.admin.totals(
            photos.filter((photo) => photo.approved).length,
            photos.filter((photo) => !photo.approved).length,
          )}
        </p>
      </div>

      <AdminPhotoList photos={photos} />
    </section>
  );
}
