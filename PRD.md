# Wedding Photo Sharing Website - PRD

## Overview
This project is a private wedding photo-sharing website. Guests scan a QR code, access the site, upload photos, and view photos uploaded by others.

The site is temporary (~1 week) and must be simple, fast, and mobile-friendly.

## Goals
- Frictionless experience for guests
- Fast uploads and gallery browsing
- Minimal setup and maintenance cost
- Elegant and modern UI

## Non-Goals
- No user accounts
- No social features (likes, comments, etc.)
- No complex CMS
- No long-term storage system

## Core Features

### 1. Landing Page
- Couple names
- Event title/date
- Welcome message
- CTA buttons:
  - Upload Photos
  - View Gallery

### 2. Upload Photos
- Select multiple images
- Show upload progress
- Validate file type and size
- Show success/error messages

### 3. Gallery
- Responsive grid
- Lazy loading
- Click to view larger image
- Sorted by newest first

### 4. Admin Panel (Hidden)
- View all uploads
- Approve/hide photos
- Delete photos

### 5. Event Config
- Event slug (URL)
- Names
- Date
- Cover image
- Welcome message

## User Flow

### Guest
1. Scan QR code
2. Open event page
3. Upload photos or browse gallery

### Admin
1. Access hidden admin route
2. Moderate uploads

## Constraints
- No authentication
- No upload PIN
- Must work well on mobile devices
- Must be deployable quickly

## Success Criteria
- Guests can upload photos easily
- Gallery loads fast
- Admin can moderate content
- System remains low-cost