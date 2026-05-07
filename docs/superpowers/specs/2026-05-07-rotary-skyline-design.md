# Rotary Club of Ahmedabad Skyline — Application Design

## Overview

A club management platform for Rotary Club of Ahmedabad Skyline (~400 members + families). Three frontends (admin web, member web, mobile app) backed by Firebase.

## Platforms

| Platform | Tech | Users |
|----------|------|-------|
| Admin Panel (Web) | Next.js + TypeScript + Tailwind + shadcn/ui | President, Sub Admins |
| Member Frontend (Web, mobile-friendly) | Next.js (same app, role-based routing) | Members |
| Mobile App (iOS + Android) | React Native + Expo | Members |
| Backend | Firebase (Firestore, Auth, Storage, Cloud Functions) | — |

## Modules

### 1. Membership
- Member registration form (created by admin)
- Collects: personal info, family details (spouse, kids, other family), photos (member, couple, family), contact, profession, birthday, anniversary
- Admin: add, update, delete, approve/reject members
- Member directory with search and filters
- ~50 new members/year, ~40 exit on July 1st (Rotary year)

### 2. Events & Forms
- Admin creates custom forms with drag-and-drop field types: text, number, email, phone, date, dropdown, checkbox, radio, file upload, image, textarea
- Form types: registration, event RSVP, survey, feedback, general
- Admin creates events with: title, description, date/time, venue, form attachment, image
- Members fill forms from web or app
- Admin views all form submissions with export option

### 3. Transactions/Finances
- Track membership dues, donations, event payments
- Admin records transactions per member
- Transaction history per member
- Summary reports: total collected, pending, by category
- Receipt generation

### 4. Announcements
- Admin creates announcements with title, body, image, priority
- Push notifications to app users
- Visible on member dashboard (web + app)
- Mark as read tracking

### 5. Birthday & Anniversary Wishes
- System reads member/family birthdays and anniversaries from registration data
- AI generates creative templates using member/family/couple photos
- Auto-sends via WhatsApp Business API on the date
- Covers: member, spouse, kids, other family members, wedding anniversary
- Admin can preview and customize templates before auto-send

### 6. About Club
- Club info: name, logo, description, history
- Current president details and message
- Vision, mission, values
- Board of directors / committee members
- Contact information
- Editable from admin panel

### 7. Suggestions & Complaints
- Members submit feedback via web or app
- Form: subject, category (suggestion/complaint), description, optional attachment
- Admin views, responds, marks status (open/in-progress/resolved)
- Member can track their submission status

### 8. Wall / Social Posts
- Members create posts with text and/or images
- Admin approval required before visible to all
- Like and comment functionality
- Admin can delete inappropriate posts

### 9. Polls
- Admin creates polls: question + multiple options
- Single vote or multi-select option
- Members vote from web or app
- Real-time results visible after voting
- Poll expiry date support

## Roles & Access Control

| Role | Access |
|------|--------|
| President / Super Admin | Full access to all modules |
| Sub Admin (Membership) | Only membership module |
| Sub Admin (Events) | Only events & forms module |
| Sub Admin (Finance) | Only transactions module |
| Sub Admin (Custom) | Any combination of modules assigned by president |
| Member | Fill forms, view events, post on wall, vote in polls, submit feedback |

## Data Model (Firestore Collections)

### Core Collections
- `users` — auth data, role, module permissions
- `members` — profile, family details, photos, status (active/inactive)
- `familyMembers` — subcollection under members (spouse, kids, etc.)

### Module Collections
- `forms` — form definitions (fields, types, validation rules)
- `formSubmissions` — member responses to forms
- `events` — event details, linked form
- `transactions` — financial records per member
- `announcements` — news/updates from admin
- `wishes` — birthday/anniversary templates, delivery log
- `clubInfo` — about club, president, vision/mission (single doc)
- `suggestions` — feedback/complaints from members
- `wallPosts` — social posts + approval status
- `polls` — poll questions, options
- `pollVotes` — member votes

## Authentication
- Email + Password (primary)
- Phone number OTP (for Indian users)
- Google Sign-in (optional)
- Role assigned after admin approval

## Project Structure (Monorepo)

```
rotary-club-skyline/
├── apps/
│   ├── web/                  # Next.js app (Admin + Member)
│   │   ├── app/
│   │   │   ├── (admin)/      # Admin panel pages
│   │   │   ├── (member)/     # Member pages
│   │   │   └── (auth)/       # Login/signup
│   │   ├── components/
│   │   ├── lib/              # Firebase config, utils
│   │   └── ...
│   └── mobile/               # React Native (Expo) app
│       ├── src/
│       │   ├── screens/
│       │   ├── components/
│       │   └── ...
│       └── ...
├── packages/
│   └── shared/               # Shared types, utils, Firebase helpers
├── firebase/
│   └── functions/            # Cloud Functions (wishes, notifications)
├── docs/
└── package.json              # Monorepo root (Turborepo)
```

## Tech Stack Summary

- **Monorepo:** Turborepo
- **Web:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile:** React Native with Expo
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Firebase Storage
- **Server Functions:** Firebase Cloud Functions (Node.js)
- **AI:** Google Gemini API (birthday/anniversary creatives)
- **WhatsApp:** WhatsApp Business Cloud API
- **Form Builder:** Custom drag-and-drop (dnd-kit + React)
- **State Management:** Zustand (web), React Context (mobile)
- **Notifications:** Firebase Cloud Messaging (FCM)

## MVP Scope (Phase 1)

Build in this order:
1. Project setup (monorepo, Firebase, auth)
2. Admin panel: login, dashboard, role management
3. Membership module (admin CRUD + member registration)
4. About Club module
5. Events & Forms module (form builder + form filling)
6. Announcements module
7. Wall/Social Posts module
8. Polls module
9. Suggestions & Complaints module
10. Transactions/Finances module
11. Birthday & Anniversary Wishes (AI + WhatsApp)
12. React Native mobile app
