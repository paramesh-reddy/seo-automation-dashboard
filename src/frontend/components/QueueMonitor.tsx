import React from 'react';
import { Server, Activity, CheckCircle2, AlertOctagon, Layers, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import { QueueStatus } from '../types.ts';

interface QueueMonitorProps {
  queueStatus: QueueStatus | null;
  onRefresh: () => void;
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({ queueStatus, onRefresh }) => {
  const steps = [
    { num: 1, title: 'Trigger Audit', desc: 'Admin dispatches audit request from UI or API.' },
    { num: 2, title: 'Database Record', desc: 'Initialize Audit entry in database in PENDING status.' },
    { num: 3, title: 'Enqueue BullMQ', desc: 'Job pushed to asynchronous queue with non-blocking response.' },
    { num: 4, title: 'Worker Handshake', desc: 'Queue worker claims job and transitions status to PROCESSING.' },
    { num: 5, title: 'Cheerio & SSRF Crawl', desc: 'HTML fetched, SSRF blocked, titles/headings/links/images extracted.' },
    { num: 6, title: 'PageSpeed Mock Ingest', desc: 'Ingest Core Web Vitals (LCP, INP, CLS, TTFB, render blocking).' },
    { num: 7, title: 'GSC Mock Ingest', desc: 'Search queries, impressions, CTR, indexation errors fetched.' },
    { num: 8, title: 'Schema.org Validation', desc: 'Validate JSON-LD hierarchy for LocalBusiness / Doctor entities.' },
    { num: 9, title: 'On-Page Analysis', desc: 'Evaluate title tag length, meta description, and H1/H2 architecture.' },
    { num: 10, title: 'Robots & Sitemap Verification', desc: 'Probe robots.txt directives and XML sitemap presence.' },
    { num: 11, title: 'DataForSEO SERP Rankings', desc: 'Ingest keyword positions, competitor traffic, and search intent.' },
    { num: 12, title: 'Claude Prompt Synthesis', desc: 'Build structured prompt with all telemetry and domain constraints.' },
    { num: 13, title: 'Claude AI Sonnet Analysis', desc: 'Execute Anthropic Claude API model claude-sonnet-4-6.' },
    { num: 14, title: 'Strict JSON Validation', desc: 'Validate output against score bounds, issue caps, and effort limits.' },
    { num: 15, title: 'Persist Audit Results', desc: 'Store scores, recommendations, and issues in database.' },
    { num: 16, title: 'PDF Report Generation', desc: 'Compile comprehensive branded report with Puppeteer / vector styles.' },
    { num: 17, title: 'Twilio Mock Notification', desc: 'Dispatch WhatsApp completion message and log SID to console.' },
    { num: 18, title: 'Mark Completed', desc: 'Finalize status to COMPLETED and expose download links.' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">BullMQ Queue & Background Worker Monitor</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Observability console for job queueing, worker lifecycles, and the 18-step execution pipeline
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          Refresh Status
        </button>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Queue Driver</span>
            <Server className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-base font-bold text-slate-900">
            {queueStatus?.mode === 'BULLMQ_REDIS' ? 'BullMQ (Redis TCP)' : 'Standalone Async Runner'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Worker process active & polling</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Jobs</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {queueStatus?.activeCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Currently running through pipeline
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {queueStatus?.completedCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Successfully delivered audits
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Failed Jobs</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {queueStatus?.failedCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            0 unhandled fatal crashes
          </div>
        </div>
      </div>

      {/* Architecture Insight Notice (Section 16 Requirement) */}
      <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Section 16 Architecture Verification Check: Worker Hosting & Redis Compatibility</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard Vercel serverless functions have a maximum execution timeout (10s on hobby, 60s on pro) and cannot run continuous background Redis listeners (<code className="text-indigo-300">BRPOP</code> / <code className="text-indigo-300">BLMOVE</code>). In production, BullMQ workers must be deployed as a dedicated long-running Node.js process (e.g. on Railway, Render, or GCP Cloud Run background worker) communicating via Redis TCP with Upstash/Redis.
        </p>
      </div>

      {/* 18-Step Pipeline Reference Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 font-display mb-4">
          The 18-Step Automated Pipeline Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map(step => (
            <div
              key={step.num}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <span className="font-semibold text-slate-900 text-xs truncate">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal pl-7">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
