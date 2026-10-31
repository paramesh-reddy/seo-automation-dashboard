import React from 'react';
import { Users, FileCheck, Clock, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Client, Audit } from '../types.ts';

interface StatsCardsProps {
  clients: Client[];
  audits: Audit[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ clients, audits }) => {
  const totalClients = clients.length;
  const totalAudits = audits.length;
  const completedAudits = audits.filter(a => a.status === 'COMPLETED').length;
  const pendingAudits = audits.filter(a => a.status === 'PENDING' || a.status === 'PROCESSING').length;
  const failedAudits = audits.filter(a => a.status === 'FAILED').length;

  const completedWithScore = audits.filter(a => a.status === 'COMPLETED' && typeof a.overallScore === 'number');
  const avgScore = completedWithScore.length > 0
    ? Math.round(completedWithScore.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / completedWithScore.length)
    : 78;

  const scoreBadgeColor = avgScore >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    avgScore >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. Total Clients */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Clients</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">
          {totalClients}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Active managed accounts
        </div>
      </div>

      {/* 2. Total Audits */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Audits</span>
          <FileCheck className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">
          {totalAudits}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Lifetime pipeline runs
        </div>
      </div>

      {/* 3. Completed Audits */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-600 tabular-nums">
          {completedAudits}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Reports generated & logged
        </div>
      </div>

      {/* 4. Pending / Processing */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">In Pipeline</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-amber-600 tabular-nums">
          {pendingAudits}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Active queue jobs
        </div>
      </div>

      {/* 5. Failed Audits */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Failed</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-rose-600 tabular-nums">
          {failedAudits}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Recoverable retry errors
        </div>
      </div>

      {/* 6. Average SEO Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Avg SEO Score</span>
          <TrendingUp className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{avgScore}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Across completed sites
        </div>
      </div>
    </div>
  );
};
