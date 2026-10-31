import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, FileText, Download, ArrowRight, ExternalLink } from 'lucide-react';
import { Audit } from '../types.ts';

interface RealTimeTrackerModalProps {
  auditId: string | null;
  onClose: () => void;
  onViewAuditDetails: (audit: Audit) => void;
}

export const RealTimeTrackerModal: React.FC<RealTimeTrackerModalProps> = ({
  auditId,
  onClose,
  onViewAuditDetails
}) => {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auditId) return;

    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        if (!res.ok) throw new Error('Failed to fetch audit data');
        const data = await res.json();
        if (isMounted) {
          setAudit(data.audit);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      }
    };

    fetchProgress();

    // Poll every 800ms while audit is processing
    const interval = setInterval(() => {
      if (audit && (audit.status === 'COMPLETED' || audit.status === 'FAILED')) {
        clearInterval(interval);
        return;
      }
      fetchProgress();
    }, 800);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [auditId, audit?.status]);

  if (!auditId) return null;

  const isCompleted = audit?.status === 'COMPLETED';
  const isFailed = audit?.status === 'FAILED';
  const isProcessing = audit?.status === 'PROCESSING' || audit?.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-display">
                Real-Time BullMQ Pipeline Tracker
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              {audit?.companyName || 'Auditing Target'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {audit?.websiteUrl}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold">
              {isProcessing && (
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Step {audit?.currentStage || 1} of 18</span>
                </span>
              )}
              {isCompleted && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>18/18 Pipeline Steps Complete</span>
                </span>
              )}
              {isFailed && (
                <span className="flex items-center gap-1.5 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Execution Halted</span>
                </span>
              )}
            </div>
            <span className="font-mono font-bold text-slate-700 text-sm tabular-nums">
              {audit?.progress || 0}%
            </span>
          </div>

          {/* Animated Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${audit?.progress || 5}%` }}
            />
          </div>

          {/* Current Stage Box */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Active Stage
            </div>
            <div className="text-xs font-semibold text-slate-800">
              {audit?.stageName || 'Initializing Queue Worker...'}
            </div>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-6 p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-slate-600">
          <div>
            <span className="text-slate-400 block text-[11px]">Audit ID:</span>
            <span className="font-mono text-[11px] text-slate-800">{audit?.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">BullMQ Job ID:</span>
            <span className="font-mono text-[11px] text-slate-800">{audit?.jobId || 'Allocating...'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Started At:</span>
            <span className="tabular-nums text-[11px]">
              {audit?.startedAt ? new Date(audit.startedAt).toLocaleTimeString() : 'Queued'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Completed At:</span>
            <span className="tabular-nums text-[11px]">
              {audit?.completedAt ? new Date(audit.completedAt).toLocaleTimeString() : 'In flight...'}
            </span>
          </div>
        </div>

        {/* Error message if failed */}
        {isFailed && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs mb-6">
            <strong>Error:</strong> {audit?.errorMessage || 'An error occurred during pipeline execution.'}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <div className="text-[11px] text-slate-400">
            {isProcessing ? 'Streaming background worker status...' : 'Audit finalized'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-medium"
            >
              Close
            </button>

            {isCompleted && audit && (
              <>
                <a
                  href={`/api/reports/${audit.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </a>
                <button
                  onClick={() => {
                    onClose();
                    onViewAuditDetails(audit);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                >
                  <span>Inspect Audit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
