# 🎓 AlumLink — Collegiate Alumni Interaction & Mentorship Platform

> **A full-stack, enterprise-grade alumni engagement portal connecting students, alumni, and college administration for mentorship, career opportunities, live messaging, and event management.**

[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle%20ORM-PostgreSQL-c5f74f?logo=drizzle)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Realtime-3ecf8e?logo=supabase)](https://supabase.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-ff4154?logo=react-query)](https://tanstack.com/query)
[![Vitest](https://img.shields.io/badge/Testing-Vitest%20%26%20Playwright-6e9f18?logo=vitest)](https://vitest.dev/)

---

## 🚀 Key Technical Highlights & Architecture

- **Next.js 16 App Router & Turbopack:** Full-stack React Server Components (RSC) architecture, server actions, and Turbopack bundling for sub-200ms initial page load performance.
- **Strict End-to-End Type Safety:** Written 100% in **TypeScript** with strict mode enabled, fully inferred database schemas via **Drizzle ORM**, and validated client/server contracts using **Zod**.
- **Hybrid SSR & Client State Management:** Combines server-side rendering for initial dynamic data with **TanStack Query (React Query v5)** for smart caching, background revalidation, and **Zustand** for lightweight client-side state persistence.
- **Supabase Realtime & WebSockets:** Sub-second bi-directional messaging and live user notifications using Supabase Realtime WebSocket channels.
- **Role-Based Access Control (RBAC):** Next.js 16 Edge Proxy Middleware enforcing server-side route security for **Student**, **Alumni**, and **Admin** portals.
- **Form Handling & Validation:** Built using **React Hook Form** integrated with **Zod** resolvers for validation, connected directly to Next.js **Server Actions**.
- **Automated Testing & Quality Suite:** Configured with **Vitest** for unit component testing, **Playwright** for E2E browser regression flows, and **Oxlint** + **Prettier** for zero-warning code standard enforcement.

---

## 🛠️ Technology Stack

| Technical Layer | Technology / Tool | Purpose & Usage |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Server-side rendering, dynamic routes, Server Actions |
| **Language** | TypeScript 5.x | End-to-end type safety, structural typing |
| **Styling & Motion** | Tailwind CSS v4 + Motion | Modern responsive UI design system with smooth micro-interactions |
| **Database & ORM** | PostgreSQL + Drizzle ORM | Relational data persistence, schema migrations, strict type inference |
| **Authentication** | `@supabase/ssr` + Middleware | Cookie-based JWT auth, role validation, session persistence |
| **Realtime Engine** | Supabase WebSockets | Live instant messaging, real-time unread count, notifications |
| **Server State** | TanStack Query v5 | Data fetching, background refetching, query invalidation |
| **Client State** | Zustand | Persistent local user state & UI component states |
| **Form Validation** | React Hook Form + Zod v4 | Declarative client-side validation & server-side schema guards |
| **Icons & UI** | Lucide React | Clean, scalable icon system |
| **Testing** | Vitest + Playwright | Unit testing for helpers/utils, end-to-end user flow testing |
| **Tooling** | Oxlint + Prettier + pnpm | Fast linting, formatting, and reproducible package management |

---

## 🌟 Core System Features

### 👨‍🎓 1. Student Portal (`/student/*`)
- **Interactive Dashboard:** Live stats on network connections, pending mentorship requests, upcoming events, and job openings.
- **Alumni Directory:** Filterable search by department, graduation year, target company, skills, and industry role.
- **Mentorship Request Engine:** Submit structured mentorship requests specifying topic, custom message, and preferred domain area.
- **Opportunity Hub:** Browse and filter full-time jobs, internships, and freelance roles posted by verified alumni; save and track application status.
- **Live Direct Messaging:** Real-time bi-directional messaging with connected alumni.
- **Events & Registration:** One-click registration for college webinars, workshops, and networking sessions.

### 👔 2. Alumni Portal (`/alumni/*`)
- **Mentorship Management Center:** Review incoming student mentorship requests, view student profiles, and accept or decline with personalized feedback.
- **Opportunity Posting:** Post job vacancies and internship referrals for students with custom application deadlines and required skills.
- **Network & Connections:** Accept or decline connection requests from students and fellow alumni.
- **Profile & Experience Portfolio:** Maintain verified company role, LinkedIn link, location, skills, and graduation credentials.

### 🛡️ 3. Admin Control Center (`/admin/*`)
- **User & Account Provisioning:** View and manage student and alumni account lifecycles.
- **Alumni Verification Queue:** Approve or flag pending alumni accounts before platform verification.
- **Platform Analytics & Reporting:** Track active user ratios, total mentorship matches, job postings, and event attendance.
- **Broadcast Announcements:** Create and publish system-wide announcements targeted to specific user roles or department groups.

---

## 🗄️ Database Schema & Architecture

The application relies on 14 normalized PostgreSQL tables mapped via Drizzle ORM:

```
                      +-------------------+
                      |       users       |
                      +-------------------+
                        /       |       \
                       /        |        \
  +-----------------------+  +----------------------+  +---------------------+
  |    studentProfiles    |  |    alumniProfiles    |  |    notifications    |
  +-----------------------+  +----------------------+  +---------------------+
                                                        
  +-----------------------+  +----------------------+  +---------------------+
  |      connections      |  |  mentorshipRequests  |  |    opportunities    |
  +-----------------------+  +----------------------+  +---------------------+
                                                           /            \
                                    +------------------------+  +------------------------+
                                    |   savedOpportunities   |  |  appliedOpportunities  |
                                    +------------------------+  +------------------------+
```

- **`users`**: System-wide authentication profiles and role tags (`student`, `alumni`, `admin`).
- **`studentProfiles` & `alumniProfiles`**: One-to-one profile extensions containing detailed academic and professional background.
- **`connections`**: Unique bi-directional network links between platform users.
- **`mentorshipRequests`**: Structured requests linking students to target alumni mentors.
- **`opportunities`**: Jobs/internships created by alumni or admins with foreign key relations to `savedOpportunities` and `appliedOpportunities`.
- **`events` & `eventRegistrations`**: Event details linked with student/alumni registration tracking.
- **`conversations` & `messages`**: Messaging threads storing real-time communication history.

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js**: v20.x or higher
- **pnpm**: v9.x or higher
- **Supabase Account / PostgreSQL Database**

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/alumni-interact-v2.git
   cd alumni-interact-v2
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   DATABASE_URL=postgresql://postgres:password@db.your-supabase.supabase.co:5432/postgres
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run Database Migrations (Drizzle ORM):**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Commands

```bash
# Type-check TypeScript codebase
pnpm type-check

# Run unit tests with Vitest
pnpm test

# Run E2E integration tests with Playwright
pnpm test:e2e

# Run Oxlint static analyzer
pnpm lint

# Format code with Prettier
pnpm format

# Production build test
pnpm build
```

---

## 💼 Skills & Keywords for Recruiters / ATS

`Next.js 16` • `App Router` • `React Server Components (RSC)` • `TypeScript` • `PostgreSQL` • `Drizzle ORM` • `Supabase Auth` • `Supabase Realtime` • `TanStack Query (React Query)` • `Zustand` • `Tailwind CSS v4` • `Server Actions` • `Zod` • `React Hook Form` • `Vitest` • `Playwright` • `Oxlint` • `Prettier` • `Role-Based Access Control (RBAC)` • `WebSockets` • `Full-Stack Web Development`
