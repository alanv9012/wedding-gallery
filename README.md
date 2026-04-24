# Wedding Gallery App

A short-lived wedding photo sharing app built with Next.js, Supabase (metadata), and Cloudflare R2 (image storage).

## 1) Install

```bash
npm install
```

## 2) Environment setup

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`
- `ADMIN_SECRET`

## 3) Local development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4) Supabase setup (database only)

Create a `photos` table with:

- `id` (uuid, primary key)
- `event_slug` (text, indexed)
- `file_key` (text)
- `url` (text)
- `approved` (boolean, default true or false)
- `created_at` (timestamp with time zone, default now())

Project assumptions:

- Supabase is used for metadata only
- RLS is disabled for this short-lived app
- App uses anon key (no auth flows implemented)

## 5) Cloudflare R2 setup

Create an R2 bucket and an API token/key pair with object read/write permissions.

Set:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL` (public base URL for image access)

The app uses S3-compatible endpoint:

- `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

## 6) Vercel deployment

1. Import this repository in Vercel.
2. Add all environment variables from `.env.example` in Vercel Project Settings.
3. Deploy.
4. Verify:
   - Upload works (`/upload`)
   - Gallery displays approved photos (`/gallery`)
   - Admin login and moderation routes work (`/admin`)

## Notes

- Keep `ADMIN_SECRET` strong and private.
- For post-event shutdown/archival steps, see `CLEANUP.md`.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
