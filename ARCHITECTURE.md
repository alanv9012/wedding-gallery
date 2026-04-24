# Architecture

## Tech Stack

- Frontend: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Hosting: Vercel
- Storage: Cloudflare R2
- Database: Lightweight relational DB (Supabase / Neon / Turso)

---

## High-Level Architecture

### 1. Presentation Layer
- Pages and layouts
- UI components
- Forms
- Gallery display

### 2. Application Layer
- Upload handling
- Validation
- Business logic
- Moderation logic

### 3. Data Layer
- R2 storage integration
- Database queries
- Repositories/services

---

## Folder Structure

src/
  app/
    page.tsx
    gallery/
    upload/
    admin/
    api/
  components/
    ui/
    gallery/
    upload/
  lib/
    storage/
    db/
    services/
    utils/
    validators/
  types/

---

## Data Model

### events
- id
- slug
- title
- date
- welcome_message
- cover_image_url

### photos
- id
- event_id
- uploader_name (optional)
- file_key
- url
- approved (boolean)
- created_at

---

## Storage Strategy

- Store images in Cloudflare R2
- Store only metadata in DB
- Use unique file keys
- Organize by event:

/event-slug/photo-id.jpg

---

## Upload Flow

1. User selects images
2. Validate client-side
3. Send to API route
4. Upload to R2
5. Save metadata in DB
6. Return success response

---

## Gallery Flow

1. Fetch approved photos
2. Render grid
3. Lazy load images
4. Open modal for preview

---

## Admin Flow

- Hidden route `/admin`
- Basic protection (env-based secret)
- Actions:
  - approve
  - delete
  - hide

---

## Performance Strategy

- Resize/compress images before upload
- Lazy load gallery images
- Use thumbnails if needed
- Avoid loading full-size images in grid

---

## Security Strategy

- Validate file type (images only)
- Limit file size
- Sanitize inputs
- Do not expose secrets
- Protect admin route

---

## Deployment

- Frontend deployed on Vercel
- Environment variables:
  - R2 credentials
  - DB connection
  - admin secret