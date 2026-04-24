# Post-Event Cleanup

Use this checklist after the wedding event is over.

## 1) Download images from Cloudflare R2

- Open Cloudflare Dashboard -> R2 -> your bucket (`R2_BUCKET_NAME`).
- Select the event folder (for example `emma-and-noah-2026/`).
- Download files from the UI, or use your preferred S3-compatible CLI workflow.
- Keep a local backup before deleting anything.

## 2) Export Supabase photo metadata

- Open Supabase Dashboard -> Table Editor -> `photos`.
- Filter by `event_slug` for your event.
- Export rows as CSV/JSON from the dashboard.
- Store export with your image backup.

## 3) Delete bucket contents (manual)

- In Cloudflare R2, open the event folder and delete files after confirming backups.
- If you want to keep the bucket for future events, only remove that event prefix.
- If this project is fully retired, you can remove the full bucket manually from Cloudflare.

## 4) Disable or remove the app

- Disable deployment in your hosting provider (for example pause/remove Vercel project).
- Remove or rotate credentials:
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `ADMIN_SECRET`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (rotate if app is retired)
- Optionally archive this repository as read-only.

## Quick Safety Notes

- Do not run destructive bulk scripts unless you have verified backups.
- Verify at least one successful restore test from your exported files.
