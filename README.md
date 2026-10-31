# EDGELINK TECHNOLOGY — SEO Automation Dashboard

A production-grade, full-stack SEO Automation Dashboard built for the **AI Developer & Automation Engineer** technical assessment at **EDGELINK TECHNOLOGY**.

---

## 🌟 Key Features

1. **Admin Operations Portal**:
   - Executive dashboard overview with live KPI metric cards (Clients, Total Audits, Completed, Pipeline Queue, Average Score).
   - Client portfolio management: Add, edit, and delete client accounts with cascading relation cleanup.
   - On-demand audit triggering with real-time BullMQ background progress tracking.
   - Comprehensive audit table with live stage progress, 5-pillar score breakdowns, and printable PDF report downloads.
2. **Client Intelligence Portal**:
   - Client-specific branded view (clients only access their own data).
   - High-contrast overall SEO score dial (0–100) and 5-pillar performance breakdown (Technical, On-Page, Content, Core Web Vitals, Schema).
   - High-impact **Quick Wins** (&le; 2 hours execution effort).
   - Critical & Important issue analysis with quantified business impact.
   - Actionable, falsifiable AI recommendations.
   - Historical audit archive with direct PDF downloads.
3. **18-Step SEO Audit Pipeline**:
   - **Step 1**: Admin triggers audit.
   - **Step 2**: Create audit record in database.
   - **Step 3**: Add job to BullMQ queue.
   - **Step 4**: Worker process claims job.
   - **Step 5**: Cheerio crawling with SSRF protection (titles, meta, canonicals, H1/H2, image alt, word count, schema, links).
   - **Step 6**: Ingest PageSpeed Insights & Core Web Vitals mock.
   - **Step 7**: Ingest Google Search Console clicks, queries & indexation mock.
   - **Step 8**: Validate Schema.org JSON-LD hierarchy.
   - **Step 9**: Execute on-page SEO analysis heuristics.
   - **Step 10**: Verify `robots.txt` and `sitemap.xml`.
   - **Step 11**: Ingest DataForSEO keyword rankings & competitor data.
   - **Step 12**: Synthesize structured prompt for Claude AI.
   - **Step 13**: Execute Anthropic Claude model (`claude-sonnet-4-6`).
   - **Step 14**: Validate response against strict JSON schema.
   - **Step 15**: Persist audit results, scores, and recommendations.
   - **Step 16**: Generate professional PDF audit report.
   - **Step 17**: Dispatch WhatsApp alert via Twilio mock.
   - **Step 18**: Mark audit as COMPLETED.
4. **Mock Integrations Controlled by `USE_MOCKS=true`**:
   - `src/mocks/pagespeed.mock.ts` (Core Web Vitals LCP, INP, CLS, TTFB)
   - `src/mocks/gsc.mock.ts` (Top queries, clicks, impressions, CTR, crawl issues)
   - `src/mocks/dataforseo.mock.ts` (Keyword rankings, competitor gaps, search intent)
   - `src/mocks/twilio.mock.ts` (WhatsApp message formatting and console logger)
5. **SSRF Security Defense**:
   - Rejects loopback addresses (`127.0.0.0/8`), private network spaces (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS/GCP metadata endpoints (`169.254.169.254`).
   - Enforces HTTP/HTTPS protocol restrictions, 10s fetch timeout, and 2.5MB payload cap.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide React, Recharts, Plus Jakarta Sans, DM Sans, JetBrains Mono
- **Backend**: Node.js, Express, Cheerio, Fetch API, TypeScript
- **AI Engine**: Anthropic Claude API (`claude-sonnet-4-6`) with structured JSON schema validator and deterministic senior analyst fallback
- **Database**: PostgreSQL with Prisma ORM (`prisma/schema.prisma`)
- **Queue**: BullMQ with Redis TCP support & standalone async queue runner
- **Reporting**: Puppeteer & high-fidelity printable HTML vector reports
- **Notifications**: Twilio WhatsApp mock integration

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `USE_MOCKS=true` is set for zero-config demonstration.

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⏱️ 3–5 Minute Assessment Demonstration Flow

1. **Overview & Stat Cards**:
   - Observe live counts for clients, total audits, completed runs, and average SEO score across managed accounts.
2. **Client Management**:
   - Switch to **Client Management** tab.
   - Click **Add New Client** and submit a local business (e.g. `Apex Oral Surgery`, `https://apexoral.in`).
3. **Trigger Manual Audit**:
   - Click **Audit Now** next to any client or **Launch Audit Job** in the top bar.
   - The non-blocking API endpoint creates the database record and queues the job immediately.
4. **Real-Time 18-Step Progress Tracking**:
   - Watch the live progress modal advance through Steps 1 to 18 with active stage descriptions.
5. **Inspect Audit & AI Recommendations**:
   - Click **Inspect** to review the score dial, 5 pillars, critical issues, and quick wins (&le; 2 hours).
   - Switch to **AI Recommendations** to verify falsifiability checks.
   - Switch to **WhatsApp Notification Dispatch** to inspect the Twilio delivery payload.
6. **Download PDF Report**:
   - Click **Download PDF** to preview and download the report.
7. **Client Portal Demonstration**:
   - In the top navigation bar, toggle the switch from **Admin View** to **Client View**.
   - Notice the client-specific view displaying only the assigned client's metrics, quick wins, and history.

---

## 🛡️ Production Deployment Architecture (Section 16)

- **Frontend & Web API**: Deployable to Vercel or Cloud Run on port 3000.
- **Database**: Hosted on Supabase or Neon PostgreSQL using `DATABASE_URL`.
- **Background Worker**: BullMQ requires long-running worker processes to maintain Redis TCP connections (`BRPOP`/`BLMOVE`). Deploy the worker script on Railway, Render, or a Cloud Run worker container connected to Upstash Redis TCP.
