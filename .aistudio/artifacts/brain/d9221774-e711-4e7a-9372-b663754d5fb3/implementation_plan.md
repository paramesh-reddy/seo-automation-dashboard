# EDGELINK TECHNOLOGY — SEO Automation Dashboard

A production-grade, full-stack SEO Automation Dashboard featuring an Admin Portal, Client Portal, 18-step Automated SEO Audit Pipeline, Anthropic Claude AI analysis, BullMQ background job processing with Redis/in-memory fallback, Prisma ORM database models, PDF report generation, real-time audit progress tracking, and mock integrations (PageSpeed, GSC, DataForSEO, Twilio WhatsApp).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarifying questions were skipped and the recommended architectural decisions have been adopted:
> 1. **Full-Stack Architecture**: Unified high-performance Node/Express + Vite React application with clearly separated `/frontend` (`src/components`, `src/views`) and `/backend` (`src/server`, `src/services`, `src/queues`, `src/workers`) modules, guaranteeing sub-second response times and immediate zero-config execution on port 3000.
> 2. **Queue & Worker Processing**: Full BullMQ pipeline with ioredis TCP support when Redis credentials are provided, paired with an integrated asynchronous queue processor fallback so tests and demonstrations succeed even in environments without an active Redis server.
> 3. **AI SEO Engine**: Anthropic Claude API (`claude-sonnet-4-6`) with strict JSON schema validation, backed by an intelligent local SEO analyzer fallback adhering strictly to the system prompt specification if `ANTHROPIC_API_KEY` is not injected.
> 4. **Database & Storage**: Prisma ORM schema designed for PostgreSQL (Neon/Supabase) with seamless local SQLite compatibility for testing.

---

## 1. Overview & Core Concept

- **What It Does**: Automates the end-to-end SEO auditing lifecycle for Indian local businesses, healthcare, dental, and real estate clients. It extracts on-page metadata, runs technical tests, ingests PageSpeed, Search Console, and DataForSEO metrics, queries Claude for falsifiable recommendations, renders downloadable PDF audit reports, and logs WhatsApp alerts.
- **Target Audience**: 
  - **Agency Admins**: Oversee client accounts, trigger on-demand audits, track real-time queue workers, inspect aggregated health scores, and manage report downloads.
  - **Clients**: Access a dedicated branded portal to review categorized SEO scores, critical issues, quick wins (<2 hours), and previous audit histories.
- **Key Value**: Replaces manual multi-tool SEO reviews with an automated, queue-backed analysis pipeline yielding actionable, falsifiable recommendations in under 60 seconds.

---

## 2. User Experience & Visual Design

Following the **Universal Frontend Design Constitution** and **SaaS & Dashboard Design Guidelines**:
- **Aesthetic Direction**: High-density, utilitarian SaaS dashboard with crisp display typography and tabular numerals (`font-mono tabular-nums`).
- **Color Palette & Discipline**:
  - Neutral canvas: Pure white (`#FFFFFF`) / Dark slate (`#0B0F19`)
  - Structural surfaces: `#F8FAFC` / `#111827`, border hairline `#E2E8F0` / `#1F2937`
  - 10% Accent budget: Deep indigo (`#4F46E5` / `#6366F1`) for primary actions; Emerald (`#10B981`) for nominal scores; Amber (`#F59E0B`) for warnings; Crimson (`#EF4444`) for critical issues.
  - Zero-pill metadata: Unboxed text with subtle typographic separators (`·` and `/`).
- **Typography Pairing**: `Plus Jakarta Sans` for headers and navigation, `DM Sans` for body copy, and `JetBrains Mono` / tabular numerals for metrics and timestamps.
- **Top Bar Contract**: Clean 3-zone header: `[Brand: EDGELINK SEO]` — `[Overview · Clients · Audits · Pipeline · Settings]` — `[Trigger New Audit button]`.
- **Key User Flows**:
  1. *Admin Login & Overview*: Live KPI stat cards, recent audit table, search & filter controls, and interactive queue status widget.
  2. *Client Management*: Modal for onboarding new client domains and viewing their historical audit scores.
  3. *Audit Pipeline Execution*: Triggering an audit creates a job, transitions status through `Pending` -> `Processing` (with stage progress 1-18) -> `Completed`, and streams real-time updates.
  4. *Client Portal View*: Overall score gauge (0-100), 5-pillar score breakdown (Technical, On-page, Content, Core Web Vitals, Schema), Executive Summary, Critical Issues (max 5), Important Issues (max 8), Quick Wins (max 5), and PDF download.

---

## 3. Key Product Decisions & Trade-Offs

- **Queue Execution (BullMQ vs. In-Process Queue)**:
  - *Chosen*: BullMQ with Redis connection if available (`UPSTASH_REDIS_URL` or standard Redis URL), coupled with an in-process async queue processor when Redis is unreachable.
  - *Why*: Prevents pipeline crashes in serverless or local test environments without Redis while preserving full BullMQ architecture.
- **PDF Generation (Puppeteer vs. HTML/Canvas Vector Print)**:
  - *Chosen*: Puppeteer backend renderer when Chromium is available, paired with high-fidelity client-side styled printable report view and direct PDF export.
  - *Why*: Guarantees instant PDF download even in containerized environments where headless Chrome sandbox permissions may be restricted.
- **SSRF Prevention & Web Scraping**:
  - *Chosen*: Cheerio + Fetch with private IP/localhost filtering (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`), 10-second timeout, and 2MB response size cap.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vite + React)                           │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │     Admin Portal     │  │    Client Portal     │  │ Real-Time Tracker │  │
│  │ (Clients, Audits,    │  │ (Scores, Quick Wins, │  │ (Stage 1-18,      │  │
│  │  Queue Monitor)      │  │  PDF Report View)    │  │  Polling/Events)  │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
└─────────────┼─────────────────────────┼────────────────────────┼────────────┘
              │                         │                        │
              ▼                         ▼                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API (Node.js / Express)                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ REST Endpoints: /api/auth, /api/clients, /api/audits, /api/reports    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌──────────────────┐  ┌─────────────▼──────────────┐  ┌─────────────────┐  │
│  │  Prisma Client   │  │   BullMQ Queue Controller  │  │ SSRF Validator  │  │
│  │  (PostgreSQL/    │  │  (Redis TCP / In-Memory    │  │ & Cheerio Crawl │  │
│  │   SQLite local)  │  │   Asynchronous Dispatch)   │  │                 │  │
│  └──────────┬───────┘  └─────────────┬──────────────┘  └────────┬────────┘  │
└─────────────┼────────────────────────┼──────────────────────────┼───────────┘
              │                        │                          │
              ▼                        ▼                          ▼
┌───────────────────────┐┌───────────────────────────┐┌───────────────────────┐
│  DATABASE (Postgres)  ││       AUDIT WORKER        ││   MOCK / REAL APIS    │
│  - Users & Roles      ││  Step 1: Init Record      ││  - PageSpeed Mock    │
│  - Clients & Websites ││  Step 2: SSRF & Crawl     ││  - GSC Mock          │
│  - Audits & Results   ││  Step 3: Mock Integrations││  - DataForSEO Mock   │
│  - Recommendations    ││  Step 4: Claude AI Engine ││  - Twilio WhatsApp   │
│  - Reports & Logs     ││  Step 5: PDF & Twilio Log ││  - Anthropic Claude  │
└───────────────────────┘└───────────────────────────┘└───────────────────────┘
```

### Database Schema Design (Prisma)

```prisma
datasource db {
  provider = "postgresql" // or "sqlite" for zero-config local run
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  CLIENT
}

enum AuditStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String   // Hashed with bcrypt
  role      Role     @default(CLIENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  client    Client?
}

model Client {
  id          String    @id @default(uuid())
  companyName String
  contactName String
  email       String    @unique
  phone       String
  industry    String    // Healthcare, Dental, Real Estate, Local
  userId      String?   @unique
  user        User?     @relation(fields: [userId], references: [id])
  websites    Website[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Website {
  id        String   @id @default(uuid())
  url       String
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  audits    Audit[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Audit {
  id             String          @id @default(uuid())
  websiteId      String
  website        Website         @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  status         AuditStatus     @default(PENDING)
  currentStage   Int             @default(0)
  stageName      String          @default("Queued")
  progress       Int             @default(0) // 0 to 100
  overallScore   Int?
  techScore      Int?
  onPageScore    Int?
  contentScore   Int?
  cwvScore       Int?
  schemaScore    Int?
  rawCrawlData   String?         // JSON stringified crawl extraction
  aiResponse     String?         // JSON stringified Claude audit response
  errorMessage   String?
  jobId          String?
  startedAt      DateTime?
  completedAt    DateTime?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  recommendations Recommendation[]
  report         Report?
  notifications  Notification[]
}

model Recommendation {
  id                  String   @id @default(uuid())
  auditId             String
  audit               Audit    @relation(fields: [auditId], references: [id], onDelete: Cascade)
  type                String   // CRITICAL, IMPORTANT, QUICK_WIN, GENERAL
  category            String   // Technical, On-page, Content, Core Web Vitals, Schema
  finding             String
  fix                 String
  estimatedImpact     String   // High, Medium, Low
  effort              String   // Hours, Days, Weeks
  falsifiabilityCheck String
  createdAt           DateTime @default(now())
}

model Report {
  id        String   @id @default(uuid())
  auditId   String   @unique
  audit     Audit    @relation(fields: [auditId], references: [id], onDelete: Cascade)
  pdfPath   String?
  fileSize  Int?
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  auditId   String
  audit     Audit    @relation(fields: [auditId], references: [id], onDelete: Cascade)
  channel   String   // WHATSAPP, EMAIL
  recipient String
  status    String   // SENT, FAILED
  payload   String   // JSON string
  sentAt    DateTime @default(now())
}
```

### Folder Structure (Frontend & Backend Separation)

```
/
├── prisma/
│   └── schema.prisma           # Prisma schema definition
├── src/
│   ├── backend/                # Backend Architecture
│   │   ├── config/             # Config & env loader
│   │   ├── db/                 # Prisma instance & DB service
│   │   ├── queues/             # BullMQ queue definition & fallback
│   │   ├── workers/            # Audit job processor (18-step pipeline)
│   │   ├── crawlers/           # SSRF checker, Cheerio crawler, Schema validator
│   │   ├── mocks/              # PageSpeed, GSC, DataForSEO, Twilio mocks
│   │   ├── services/
│   │   │   ├── ai.service.ts   # Claude claude-sonnet-4-6 API integration
│   │   │   ├── pdf.service.ts  # Puppeteer / HTML PDF report generator
│   │   │   └── notify.service.ts # Mock Twilio WhatsApp & email notifier
│   │   ├── routes/             # Express API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── client.routes.ts
│   │   │   ├── audit.routes.ts
│   │   │   └── report.routes.ts
│   │   └── server.ts           # Backend server entry & API router
│   ├── frontend/               # Frontend Architecture
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI controls (tabs, modals, alerts)
│   │   │   ├── layout/         # Header, Sidebar, Top bar contract
│   │   │   ├── charts/         # SEO score gauges, CWV charts, Pillar radars
│   │   │   ├── admin/          # Client management, Queue monitor, Audit table
│   │   │   ├── client/         # Client dashboard, Quick wins, Recommendations
│   │   │   └── report/         # Printable PDF template & preview
│   │   ├── context/            # AuthContext, AuditContext
│   │   ├── hooks/              # useAuditProgress, useClients
│   │   ├── types/              # TypeScript interfaces for audits, scores, recommendations
│   │   └── App.tsx             # Main router & layout provider
│   ├── index.css               # Tailwind CSS v4 styling & dark mode setup
│   └── main.tsx                # React client entry
├── .env.example                # Documented configuration variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Complete API Endpoint List

- `POST /api/auth/login`: Authenticate admin or client user, return JWT/session.
- `GET  /api/auth/me`: Get current authenticated user details and role.
- `GET  /api/clients`: List all clients with associated websites and audit summary (Admin).
- `POST /api/clients`: Create a new client and register website URL (Admin).
- `PUT  /api/clients/:id`: Update client details (Admin).
- `DELETE /api/clients/:id`: Delete a client and cascade associated audits (Admin).
- `GET  /api/audits`: List all audits with filtering by status and client ID.
- `POST /api/audits`: Trigger an SEO audit pipeline job for a website.
- `GET  /api/audits/:id`: Fetch audit status, stage progress, scores, and recommendations.
- `GET  /api/audits/:id/progress`: Real-time stage progress polling endpoint.
- `GET  /api/audits/:id/report`: View or download generated PDF audit report.
- `GET  /api/queue/status`: BullMQ worker status, active jobs, and failure rates.

### Required Environment Variables (.env.example)

```env
# Application Port & URL
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/edgelink_seo?schema=public"

# Redis Configuration (BullMQ)
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_URL=""
UPSTASH_REDIS_TOKEN=""

# Mock Switch (Mandatory)
USE_MOCKS=true

# Anthropic Claude AI
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-sonnet-4-6"

# Twilio Mock / Real Credentials
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Security Secrets
AUTH_SECRET="super-secret-jwt-key-edgelink-2026"
CRON_SECRET="edgelink-cron-automation-token"
```

### Technical Risks & Mitigations

1. **BullMQ / Redis Connection Incompatibility**:
   - *Risk*: Upstash HTTP REST does not support BullMQ blocking commands; local developer machines might lack a running Redis daemon.
   - *Mitigation*: The queue manager transparently tests Redis TCP connectivity; if unavailable, it seamlessly engages an in-process BullMQ-compliant task runner that processes the 18 steps with exact stage timing.
2. **Server-Side Request Forgery (SSRF) during Crawling**:
   - *Risk*: Target URLs could attempt to probe internal cloud metadata (`169.254.169.254`) or localhost services.
   - *Mitigation*: The crawler validates protocols (`http`/`https` only), resolves DNS before fetching, and rejects loopback (`127.0.0.0/8`), link-local, and RFC 1918 private ranges.
3. **Headless Chrome in Container Environments**:
   - *Risk*: Puppeteer requires system libraries and `--no-sandbox` flags which can fail in minimal Linux containers.
   - *Mitigation*: Provide Puppeteer launch with standard cloud container flags (`--no-sandbox`, `--disable-setuid-sandbox`, `--disable-dev-shm-usage`) plus an instant browser-printable PDF layout fallback.

---

## 5. Development Roadmap

1. **Step 1: Configuration & Database Setup**: Initialize dependencies, configure Prisma schema, setup database client with seamless local fallback, create seed data for demo clients.
2. **Step 2: Mock Integrations & SSRF Crawler**: Implement `pagespeed.mock.js`, `gsc.mock.js`, `dataforseo.mock.js`, and `twilio.mock.js` strictly respecting `USE_MOCKS=true`. Implement Cheerio metadata crawler with SSRF protection.
3. **Step 3: Claude AI Engine & Prompt System**: Implement Section 7.2 prompts, structured JSON schema parser, and fallback analyzer.
4. **Step 4: Queue Pipeline & Background Worker**: Build the 18-step audit processor tracking stages from `Queued` to `Completed`, saving recommendations and triggering mock notifications.
5. **Step 5: Express Backend API**: Connect auth, client CRUD, audit triggers, and real-time progress endpoints.
6. **Step 6: UI & Admin/Client Portals**: Build responsive, professional UI with Tailwind CSS v4, Lucide icons, score gauges, quick wins, and real-time pipeline monitoring.
7. **Step 7: PDF Generator & Verification**: Implement PDF audit report template, test complete end-to-end audit execution, compile and verify applet.
