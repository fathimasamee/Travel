# TravelSphere - Commercial Travel Booking & Management Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_3.4-38bdf8.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-lightgrey.svg?style=flat&logo=express)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-ORM-2D3748.svg?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)

**TravelSphere** is a production-grade, commercial travel agency web application and booking management system built for high-end bespoke journeys, multi-day expeditions, and luxury tours. It incorporates a guest-facing luxury website, multi-step booking engine, payment and PDF invoice generation, customer portal, staff operations desk, and a comprehensive executive admin dashboard.

---

## 🌟 Key Architecture & Highlights

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion styling, Axios with automatic JWT interceptors.
- **Backend**: Node.js & Express.js with clean modular REST architecture, Zod request validation, centralized error handling, and Helmet security headers.
- **Database & ORM**: PostgreSQL with Prisma ORM (with zero-config SQLite development fallback for instant out-of-the-box local testing).
- **Authentication**: JWT Access Token (15m) + Refresh Token (7d) with Role-Based Access Control (RBAC) across `CUSTOMER`, `STAFF`, and `ADMIN`.
- **Payment & Invoicing**: Card payment flow, SWIFT bank wire instructions, and cash on arrival settlement; official PDF invoice and receipt generation with PDFKit.
- **SEO & Performance**: Dynamic XML sitemap (`/sitemap.xml`), robots crawler configuration (`/robots.txt`), OpenGraph social tags, and responsive image loading.

---

## 👥 User Roles & Features

### 1. Customer Portal
- **Discovery**: Explore destinations (Bali, Swiss Alps, Santorini, Tokyo, Amalfi Coast, Serengeti Safari, Dubai, Iceland).
- **Advanced Filtering**: Live keyword search, price slider, duration, categories (*Beach*, *Mountain*, *Cultural*, *Adventure*, *Luxury*, *City*), and sorting.
- **Package Details**: High-resolution gallery, interactive day-by-day itinerary timeline, included/excluded checklist, partner hotel, and vehicle specifications.
- **Booking Engine**: 5-step workflow (Package Selection $\to$ Departure Date & Guests $\to$ Traveller Details & Passports $\to$ Payment & Coupons $\to$ Instant Confirmation).
- **Financial Receipts**: In-app itemized invoice viewing and one-click PDF tax invoice download.
- **Account & History**: Customer dashboard (`/dashboard`) managing booking history, cancellation requests, wishlisted packages, profile details, and in-app notifications.

### 2. Staff Operations Portal (`/staff`)
- **Assigned Operations**: View reservations assigned to staff or pending concierge dispatch.
- **Customer Care**: Quick access to passenger emails, phone contacts, and special dietary/anniversary requests.
- **Trip Operations Dispatch**: Update internal operational notes (chauffeur assignments, guide names, room upgrade codes).
- **Operational Status**: Transition bookings between `PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED`.

### 3. Executive Admin Dashboard (`/admin`)
- **Key Metrics Cards**: Total Customers, Total Bookings, Total Revenue, Active Packages, and Global Destinations.
- **Interactive Analytics**: Monthly gross revenue bar chart, seasonal booking trends, and destination popularity rankings.
- **Tour Packages Management (`/admin/packages`)**: Full CRUD modal to create packages, adjust pricing, discount percentages, and seat capacity.
- **Destination Management (`/admin/destinations`)**: Add and manage territories, ratings, and hero imagery.
- **Booking Manifest (`/admin/bookings`)**: Real-time table with status updates, staff assignment, and CSV export.
- **User Administration (`/admin/users`)**: Search users, toggle roles between `CUSTOMER`, `STAFF`, and `ADMIN`, or delete accounts.
- **Hotels & Fleet (`/admin/hotels`, `/admin/vehicles`)**: Manage 5-star partner properties and private chauffeur fleets.
- **Ledger & Transactions (`/admin/payments`)**: Financial audit trail with transaction IDs and payment methods.
- **Review Moderation (`/admin/reviews`)**: Star ratings review moderation with approve/hide toggles.
- **Coupons Engine (`/admin/coupons`)**: Issue percentage or fixed discount vouchers with minimum spend and redemption caps.
- **Manifest & Reports Exporter (`/admin/reports`)**: One-click production CSV data exports for Bookings, Revenue, and Customers.

---

## 🔑 Pre-Seeded Demo Credentials

You can log in manually or use the **1-Click Demo Sign-in buttons** on the [`/login`](http://localhost:3000/login) page:

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@travelsphere.com` | `Travel@123456` | Full Control Center (`/admin`) |
| **Staff** | `staff@travelsphere.com` | `Travel@123456` | Operations Desk (`/staff`) |
| **Customer** | `customer@travelsphere.com` | `Travel@123456` | Client Site & Dashboard (`/dashboard`) |

---

## 🗄️ Database Entity Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ Booking : places
    User ||--o{ Review : writes
    User ||--o{ Favourite : saves
    User ||--o{ Notification : receives
    User ||--o{ Booking : "assigned to (Staff)"

    Destination ||--o{ Package : features
    Destination ||--o{ Hotel : hosts

    Package ||--o{ Booking : booked_in
    Package ||--o{ Review : reviewed_by
    Package ||--o{ Favourite : favorited_in
    Package }o--|| Hotel : includes
    Package }o--|| Vehicle : assigns

    Booking ||--o{ Traveller : includes
    Booking ||--o{ Payment : settles
    Coupon ||--o{ Booking : discounts
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or later, tested with v24)
- npm (v9.0.0 or later)

### Step 1: Clone & Setup Dependencies
From the repository root:
```bash
# Install root, backend, and frontend packages
npm run install:all
```
*(Alternatively: `cd backend && npm install && cd ../frontend && npm install`)*

### Step 2: Database Setup & Seeding
From the `backend/` directory:
```bash
cd backend
npm run db:setup
```
This automatically verifies the database connection, synchronizes the Prisma schema, and populates comprehensive luxury travel packages, destinations, vehicles, hotels, coupons, and test accounts.

### Step 3: Run the Application
You can run both backend and frontend concurrently:
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Next.js Frontend (runs on http://localhost:3000)
cd frontend
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🧪 Automated Testing & Verification

A comprehensive end-to-end integration test is included at the repository root (`test-e2e.js`) verifying:
- Health check endpoints
- Admin, Staff, and Customer authentication flows
- Destination and Package queries
- Coupon validation logic
- Multi-step booking creation and seat inventory decrement
- Payment confirmation and ledger recording
- PDF invoice generation and download header validation
- Staff operations status updates
- Admin analytics calculation and CSV report exports

To execute the test suite:
```bash
node test-e2e.js
```

---

## 🚢 Deployment Guide

### 1. Database: Managed PostgreSQL Cloud
Choose any managed PostgreSQL provider (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/), [Render](https://render.com/), or AWS RDS):
1. Create a PostgreSQL database and copy the connection URI:
   ```
   postgresql://user:password@ep-host.region.neon.tech/travelsphere?sslmode=require
   ```
2. In `backend/`:
   - Set `DATABASE_URL` in your environment.
   - Run `node scripts/switch-to-postgres.js` to ensure the Prisma datasource provider is set to `postgresql`.
   - Run `npx prisma db push` and `npx ts-node prisma/seed.ts`.

### 2. Backend: Deploy to Render or Railway
This repository contains a ready-to-deploy [`render.yaml`](file:///c:/Users/ASUS/Desktop/Travel/render.yaml) blueprint:
1. Connect your repository to [Render](https://render.com/).
2. Set Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/server.js`
5. Configure environment variables from `backend/.env.example`:
   - `DATABASE_URL` (your Cloud PostgreSQL URI)
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL` (your Vercel frontend domain)

### 3. Frontend: Deploy to Vercel
1. Import the repository into [Vercel](https://vercel.com/).
2. Set Root Directory to `frontend`.
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://travelsphere-api.onrender.com/api`)
4. Click **Deploy**. Vercel will automatically run `npm run build` and launch Next.js 15.

### 4. Docker & Containerized Orchestration
You can also launch PostgreSQL, the backend API, and the Next.js frontend with Docker Compose:
```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

---

## 📄 License & Commercial Rights
Crafted for **TravelSphere Luxury Expeditions Ltd.** All commercial rights reserved.
