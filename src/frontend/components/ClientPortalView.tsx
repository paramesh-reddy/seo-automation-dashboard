import React from 'react';
import { Globe, Download, Zap, AlertTriangle, AlertCircle, CheckCircle, Clock, ExternalLink, Calendar, ArrowUpRight } from 'lucide-react';
import { Client, Audit } from '../types.ts';

interface ClientPortalViewProps {
  client: Client;
  audits: Audit[];
  onSelectAudit: (audit: Audit) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({ client, audits, onSelectAudit }) => {
  const latestAudit = audits.find(a => a.status === 'COMPLETED') || audits[0];

  const overallScore = latestAudit?.overallScore ?? 78;
  const scoreBreakdown = latestAudit?.aiResponse?.score_breakdown || {
    technical: 82,
    on_page: 80,
    content: 75,
    core_web_vitals: 68,
    schema: 85
  };

  const criticalIssues = latestAudit?.aiResponse?.critical_issues || [];
  const importantIssues = latestAudit?.aiResponse?.important_issues || [];
  const quickWins = latestAudit?.aiResponse?.quick_wins || [];
  const recommendations = latestAudit?.aiResponse?.recommendations || [];
  const executiveSummary = latestAudit?.aiResponse?.executive_summary ||
    `SEO audit evaluation for ${client.companyName}. Found ${criticalIssues.length} critical issues and ${quickWins.length} quick wins that can be deployed in under 2 hours.`;

  const scoreColor = overallScore >= 80 ? 'text-emerald-600' : overallScore >= 60 ? 'text-amber-600' : 'text-rose-600';
  const scoreBorder = overallScore >= 80 ? 'border-emerald-500' : overallScore >= 60 ? 'border-amber-500' : 'border-rose-500';

  return (
    <div className="space-y-8">
      {/* Client Welcome Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Client SEO Intelligence Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {client.companyName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="font-medium text-slate-700">{client.industry} Sector</span>
              <span aria-hidden="true">·</span>
              <span>Contact: {client.contactName}</span>
              <span aria-hidden="true">·</span>
              <a
                href={latestAudit?.websiteUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-mono"
              >
                <span>{latestAudit?.websiteUrl || 'Domain under audit'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-600 mt-4 leading-relaxed">
              {executiveSummary}
            </p>
          </div>

          {/* Overall SEO Score Circular Dial */}
          <div className="flex items-center gap-6 shrink-0 bg-slate-50 p-5 rounded-xl border border-slate-100 self-start lg:self-auto">
            <div className={`w-24 h-24 rounded-full border-4 ${scoreBorder} bg-white flex flex-col items-center justify-center shadow-xs`}>
              <span className={`text-3xl font-extrabold tabular-nums ${scoreColor}`}>{overallScore}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Score</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 mb-1">Overall Health Rating</div>
              <div className="text-[11px] text-slate-500 mb-3 max-w-[140px]">
                Calculated across 5 core technical & on-page pillars
              </div>
              {latestAudit && latestAudit.status === 'COMPLETED' && (
                <a
                  href={`/api/reports/${latestAudit.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 5 Pillar Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">Technical SEO</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{scoreBreakdown.technical}/100</div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${scoreBreakdown.technical}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">On-Page SEO</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{scoreBreakdown.on_page}/100</div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${scoreBreakdown.on_page}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">Content & Depth</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{scoreBreakdown.content}/100</div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${scoreBreakdown.content}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">Core Web Vitals</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{scoreBreakdown.core_web_vitals}/100</div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${scoreBreakdown.core_web_vitals}%` }} />
            </div>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div className="text-[11px] font-medium text-slate-500">Structured Schema</div>
            <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">{scoreBreakdown.schema}/100</div>
            <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${scoreBreakdown.schema}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Wins Section (Section 8: Max 5, <= 2 hours) */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm font-display mb-1">
          <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>High-Impact Quick Wins (&le; 2 Hours Implementation)</span>
        </div>
        <p className="text-xs text-emerald-700/90 mb-4">
          Prescribed changes requiring under 2 hours of developer time with disproportionate ranking recovery.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickWins.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-3 bg-white rounded-lg">No quick wins found.</div>
          ) : (
            quickWins.map((qw, idx) => (
              <div key={idx} className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-xs">{qw.title}</h4>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium shrink-0">
                    {qw.estimated_time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{qw.action}</p>
                <div className="mt-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Impact: <strong className="text-emerald-600">{qw.impact}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Critical & Important Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Issues (Max 5) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm font-display mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Critical SEO Issues ({criticalIssues.length}/5)</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Defects causing severe Google penalty risk, de-indexing, or high mobile bounce rates.
          </p>

          <div className="space-y-3">
            {criticalIssues.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">No critical defects detected.</div>
            ) : (
              criticalIssues.map((ci, idx) => (
                <div key={idx} className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-rose-900">{ci.title}</span>
                    <span className="text-[10px] font-medium text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded">
                      {ci.category}
                    </span>
                  </div>
                  <p className="text-xs text-rose-950/80 leading-relaxed">{ci.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Important Issues (Max 8) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm font-display mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>Important SEO Issues ({importantIssues.length}/8)</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Sub-optimal parameters depressing CTR, crawl budget, and keyword position rankings.
          </p>

          <div className="space-y-3">
            {importantIssues.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">No secondary issues found.</div>
            ) : (
              importantIssues.map((ii, idx) => (
                <div key={idx} className="p-3.5 bg-amber-50/40 border border-amber-100 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-amber-950">{ii.title}</span>
                    <span className="text-[10px] font-medium text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      {ii.category}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">{ii.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Prioritized AI Recommendations with Falsifiability Checks */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 font-display mb-1">
          Detailed Action Plan & Falsifiability Checks
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Every recommendation is falsifiable: verifiable with specific commands, tools, or tests.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Pillar</th>
                <th className="px-4 py-3">Finding</th>
                <th className="px-4 py-3">Actionable Fix</th>
                <th className="px-4 py-3">Effort</th>
                <th className="px-4 py-3">Falsifiability Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recommendations.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{rec.category}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{rec.finding}</td>
                  <td className="px-4 py-3 text-slate-600">{rec.fix}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{rec.effort}</td>
                  <td className="px-4 py-3 text-slate-500 italic text-[11px] bg-slate-50/50">
                    {rec.falsifiability_check}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Audits for this client */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 font-display mb-1">
          Audit History & Downloadable Reports
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Access historical snapshot reports and verify progress over time
        </p>

        <div className="space-y-2">
          {audits.map(audit => (
            <div
              key={audit.id}
              className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-semibold text-slate-900 text-xs">
                    Audit Run: {new Date(audit.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {audit.id} · Score: {audit.overallScore ?? '—'}/100
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectAudit(audit)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  View Details
                </button>
                {audit.status === 'COMPLETED' && (
                  <a
                    href={`/api/reports/${audit.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Report PDF</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
