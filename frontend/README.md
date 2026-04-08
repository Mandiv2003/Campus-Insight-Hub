# Smart Campus Operations Hub — Frontend

React 19 + TypeScript SPA for the Smart Campus Operations Hub (IT3030 PAF 2026, SLIIT).

## Tech stack

| Layer | Library |
|---|---|
| UI framework | React 19 + Vite 8 |
| Component library | MUI v7 (`@mui/material`) |
| Routing | React Router DOM v7 |
| Forms | React Hook Form v7 |
| HTTP | Axios v1 |
| Auth tokens | `jwt-decode` v4 |
| Dates | `date-fns` v4 |

## Setup

### 1. Prerequisites

- Node 20+
- The backend running on `http://localhost:8080` (see `backend/README.md`)

### 2. Install dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `@vitejs/plugin-react` 4.x has a peer-dep conflict with Vite 8.

### 3. Create your local env file

```bash
cp .env.example .env.local
```

Edit `.env.local` if your backend runs on a different host/port:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_BACKEND_URL=http://localhost:8080
```

### 4. Run the dev server

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

### 5. Production build

```bash
npm run build   # runs tsc then vite build
```

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `VITE_API_URL` | Base URL for all REST API calls | `http://localhost:8080/api/v1` |
| `VITE_BACKEND_URL` | Backend origin used for Google OAuth2 redirect | `http://localhost:8080` |

## Authentication

**Email/password:** Sign Up or Sign In via the login page. JWT is stored in `localStorage`.

**Google OAuth2:** Click "Continue with Google" — the browser navigates to `{VITE_BACKEND_URL}/oauth2/authorization/google`. After Google authenticates, the backend redirects to `/oauth-callback?token=<jwt>`, which the `OAuthCallbackPage` captures and stores.

The backend must have `http://localhost:5173/oauth-callback` configured in the Google Cloud Console as an authorised redirect origin (the actual redirect goes through the backend, not the frontend, but CORS must be configured).

## Role-based access

| Role | Accessible sections |
|---|---|
| `USER` | Resources, My Bookings, My Tickets, Notifications |
| `TECHNICIAN` | Everything USER has + Ticket Queue (`/admin/tickets`) |
| `ADMIN` | Everything USER has + Admin Dashboard, Booking Queue, Ticket Queue, User Management |

Routes are protected by `<ProtectedRoute requireAdmin>` and `<ProtectedRoute requireAdminOrTechnician>` wrappers.

## Project structure

```
src/
├── api/              # Axios instance + per-module API functions
├── components/
│   ├── common/       # ProtectedRoute, AvailabilityBadge
│   ├── layout/       # Navbar (sidebar + top bar layout)
│   └── notifications/# NotificationBell
├── context/          # AuthContext (JWT decode, login/logout)
├── pages/
│   ├── auth/         # LoginPage, OAuthCallbackPage
│   ├── admin/        # AdminDashboardPage, UserManagementPage
│   ├── resources/    # ResourceListPage, ResourceDetailPage, ResourceFormPage
│   ├── bookings/     # BookingListPage, BookingFormPage, BookingDetailPage, AdminBookingQueuePage
│   ├── incidents/    # IncidentListPage, IncidentFormPage, IncidentDetailPage, AdminIncidentQueuePage
│   └── notifications/# NotificationPage
├── types/            # TypeScript interfaces for all API DTOs
└── App.tsx           # Route tree
```
