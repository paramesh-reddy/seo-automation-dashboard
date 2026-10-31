import React, { useState } from 'react';
import { Download, ExternalLink, Zap, AlertTriangle, AlertCircle, CheckCircle2, MessageSquare, Activity, Globe, FileCode, Check } from 'lucide-react';
import { Audit } from '../types.ts';

interface AuditDetailsModalProps {
  audit: Audit | null;
  onClose: () => void;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ audit, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'telemetry' | 'notification'>('overview');

  if (!audit) return null;

  const score = audit.overallScore ?? 78;
  const breakdown = audit.aiResponse?.score_breakdown || {
    technical: 80,
    on_page: 80,
    content: 75,
    core_web_vitals: 65,
    schema: 85
  };

  const criticalIssues = audit.aiResponse?.critical_issues || [];
  const importantIssues = audit.aiResponse?.important_issues || [];
  const quickWins = audit.aiResponse?.quick_wins || [];
  const recommendations = audit.aiResponse?.recommendations || [];
  const executiveSummary = audit.aiResponse?.executive_summary || 'Executive summary unavailable for this audit.';

  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';
  const scoreBorder = score >= 80 ? 'border-emerald-500' : score >= 60 ? 'border-amber-500' : 'border-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-display">
                SEO Audit Inspection Report
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-mono text-slate-500">ID: {audit.id}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display mt-0.5">
              {audit.companyName}
            </h2>
            <a
              href={audit.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-mono mt-0.5"
            >
              <span>{audit.websiteUrl}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {audit.status === 'COMPLETED' && (
              <a
                href={`/api/reports/${audit.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none p-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-100 bg-slate-50/70 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Core Pillars
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Telemetry & Ingested Mocks
          </button>
          <button
            onClick={() => setActiveTab('notification')}
            className={`py-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'notification'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp Notification Dispatch
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Score Dial & Summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
                <div className={`w-24 h-24 rounded-full border-4 ${scoreBorder} bg-white flex flex-col items-center justify-center shrink-0 shadow-2xs`}>
                  <span className={`text-3xl font-extrabold tabular-nums ${scoreColor}`}>{score}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Executive Analysis</h3>
                  <p className="text-slate-600 leading-relaxed text-xs">{executiveSummary}</p>
                </div>
              </div>

              {/* 5 Pillar Cards */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Score Breakdown Across 5 Pillars
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Technical</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{breakdown.technical}/100</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-[11px] text-slate-500 font-medium">On-Page</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{breakdown.on_page}/100</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Content</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{breakdown.content}/100</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Core Web Vitals</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{breakdown.core_web_vitals}/100</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center">
                    <div className="text-[11px] text-slate-500 font-medium">Schema.org</div>
                    <div className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">{breakdown.schema}/100</div>
                  </div>
                </div>
              </div>

              {/* Quick Wins Banner */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs mb-2">
                  <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>High-Impact Quick Wins (&le; 2 Hours Effort)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickWins.map((qw, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-0.5">
                        <span>{qw.title}</span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {qw.estimated_time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{qw.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical & Important Issues Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Critical Issues ({criticalIssues.length}/5)</span>
                  </h4>
                  {criticalIssues.map((ci, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg">
                      <div className="font-bold text-rose-950 text-xs mb-0.5">{ci.title}</div>
                      <div className="text-rose-900/80 text-[11px] leading-relaxed">{ci.description}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Important Issues ({importantIssues.length}/8)</span>
                  </h4>
                  {importantIssues.map((ii, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                      <div className="font-bold text-amber-950 text-xs mb-0.5">{ii.title}</div>
                      <div className="text-amber-900/80 text-[11px] leading-relaxed">{ii.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Actionable, falsifiable recommendations synthesized by Claude AI adhering strictly to Section 7.2 requirements:
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                    <tr>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Pillar</th>
                      <th className="px-4 py-3">Finding</th>
                      <th className="px-4 py-3">Prescribed Fix</th>
                      <th className="px-4 py-3">Effort</th>
                      <th className="px-4 py-3">Falsifiability Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recommendations.map((rec, idx) => {
                      const priorityColor =
                        rec.priority === 'CRITICAL' ? 'text-rose-700 bg-rose-50' :
                        rec.priority === 'IMPORTANT' ? 'text-amber-700 bg-amber-50' :
                        'text-emerald-700 bg-emerald-50';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityColor}`}>
                              {rec.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{rec.category}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{rec.finding}</td>
                          <td className="px-4 py-3 text-slate-600">{rec.fix}</td>
                          <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{rec.effort}</td>
                          <td className="px-4 py-3 text-slate-500 italic text-[11px] bg-slate-50/40">
                            {rec.falsifiability_check}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-6">
              {/* Core Web Vitals from PageSpeed Mock */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>PageSpeed & Core Web Vitals Telemetry (Section 7.1 Mock)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">LCP</span>
                    <div className="text-base font-bold text-rose-600 font-mono">4.2s</div>
                    <span className="text-[10px] text-rose-500 font-medium">POOR (&gt; 2.5s)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">INP</span>
                    <div className="text-base font-bold text-amber-600 font-mono">240ms</div>
                    <span className="text-[10px] text-amber-500 font-medium">NEEDS WORK</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">CLS</span>
                    <div className="text-base font-bold text-rose-600 font-mono">0.28</div>
                    <span className="text-[10px] text-rose-500 font-medium">POOR (&gt; 0.1)</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">FCP</span>
                    <div className="text-base font-bold text-slate-800 font-mono">2.4s</div>
                    <span className="text-[10px] text-slate-500 font-medium">Target &lt; 1.8s</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">TTFB</span>
                    <div className="text-base font-bold text-slate-800 font-mono">1.1s</div>
                    <span className="text-[10px] text-slate-500 font-medium">Server response</span>
                  </div>
                </div>
              </div>

              {/* Google Search Console Mock */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Google Search Console Ingested Metrics (Section 7.2 Mock)</span>
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center mb-4">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">28-Day Clicks</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">1,840</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Impressions</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">56,200</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Average CTR</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">3.27%</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">Average Position</div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">19.4</div>
                  </div>
                </div>
              </div>

              {/* DataForSEO Mock */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>DataForSEO Keyword Rankings & SERP Telemetry (Section 7.3 Mock)</span>
                </h4>
                <div className="text-[11px] text-slate-600">
                  Tracked organic keywords: <strong>182</strong> · Top 3 ranks: <strong>12</strong> · Top 10 ranks: <strong>38</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notification' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Twilio WhatsApp Integration (Section 7.4 Mock)</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed mb-4">
                  Controlled by <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">USE_MOCKS=true</code>. When an audit is marked complete, Twilio formats a WhatsApp message with the overall score, critical issues count, and direct PDF download link, and logs the payload to the system console.
                </p>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] space-y-1">
                  <div className="text-emerald-400 font-bold">[TWILIO WHATSAPP DISPATCHED]</div>
                  <div>Channel: whatsapp:+919845012345</div>
                  <div>From: whatsapp:+14155238886</div>
                  <div>Status: delivered</div>
                  <div>Message SID: SMmock_twilio_whatsapp_{audit.id.substring(4)}</div>
                  <div className="text-slate-400 pt-2 border-t border-slate-800">
                    Content: "EdgeLink Technology SEO Audit Complete: Your audit for {audit.websiteUrl} is ready. Overall Score: {score}/100. Download PDF: {audit.reportUrl || `/api/reports/${audit.id}/download`}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 shrink-0 text-xs">
          <div className="text-slate-500">
            Pipeline version: <strong>v1.0 (EdgeLink Technology)</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
