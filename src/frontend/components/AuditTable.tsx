import React, { useState } from 'react';
import { Search, Play, FileText, CheckCircle2, Clock, AlertTriangle, RefreshCw, Eye, Download, MessageSquare } from 'lucide-react';
import { Audit } from '../types.ts';

interface AuditTableProps {
  audits: Audit[];
  onViewAuditDetails: (audit: Audit) => void;
  onRetryAudit: (auditId: string) => void;
  onTriggerNewAudit: () => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  audits,
  onViewAuditDetails,
  onRetryAudit,
  onTriggerNewAudit
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAudits = audits.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch =
      a.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Trigger CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">SEO Audit Pipeline & History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of 18-step audit jobs, AI evaluation summaries, and PDF generation
          </p>
        </div>

        <button
          onClick={onTriggerNewAudit}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Audit Job</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by client, domain, or audit ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Status Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          {['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Audits' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Client & Target Domain</th>
                <th className="px-5 py-3.5">Status & Pipeline Progress</th>
                <th className="px-5 py-3.5">Overall SEO Score</th>
                <th className="px-5 py-3.5">Key Pillars</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No audits found</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Click "Launch Audit Job" to run an automated audit.</p>
                  </td>
                </tr>
              ) : (
                filteredAudits.map(audit => {
                  const isProcessing = audit.status === 'PROCESSING' || audit.status === 'PENDING';
                  const isCompleted = audit.status === 'COMPLETED';
                  const isFailed = audit.status === 'FAILED';

                  const score = audit.overallScore ?? 0;
                  const scoreColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-rose-700';

                  return (
                    <tr key={audit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 text-sm font-display">{audit.companyName}</div>
                        <div className="text-indigo-600 font-mono text-[11px] hover:underline mt-0.5">
                          {audit.websiteUrl}
                        </div>
                        <div className="text-slate-400 text-[10px] font-mono mt-0.5">ID: {audit.id}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          {isProcessing && (
                            <span className="flex items-center gap-1.5 text-amber-700 font-semibold text-xs">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Step {audit.currentStage}/18 · {audit.progress}%</span>
                            </span>
                          )}
                          {isCompleted && (
                            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </span>
                          )}
                          {isFailed && (
                            <span className="flex items-center gap-1.5 text-rose-700 font-semibold text-xs">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Failed</span>
                            </span>
                          )}
                        </div>
                        <div className="w-36 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${audit.progress}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 truncate max-w-xs" title={audit.stageName}>
                          {audit.stageName}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isCompleted && score > 0 ? (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-extrabold tabular-nums ${scoreColor}`}>{score}</span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>
                        ) : isProcessing ? (
                          <span className="text-slate-400 italic text-[11px]">Evaluating...</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {isCompleted && audit.aiResponse?.score_breakdown ? (
                          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-mono tabular-nums">
                            <div>Tech: <strong>{audit.aiResponse.score_breakdown.technical}</strong></div>
                            <div>OnPage: <strong>{audit.aiResponse.score_breakdown.on_page}</strong></div>
                            <div>CWV: <strong>{audit.aiResponse.score_breakdown.core_web_vitals}</strong></div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500 text-[11px] tabular-nums whitespace-nowrap">
                        {new Date(audit.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onViewAuditDetails(audit)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
                            title="Inspect complete audit scores & AI findings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>

                          {isCompleted && (
                            <a
                              href={`/api/reports/${audit.id}/download`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="Download complete printable PDF report"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </a>
                          )}

                          {isFailed && (
                            <button
                              onClick={() => onRetryAudit(audit.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Retry failed pipeline job"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
