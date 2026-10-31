import React from 'react';
import { Sparkles, User, RefreshCw, PlusCircle, Shield, Globe } from 'lucide-react';
import { User as UserType } from '../types.ts';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserType;
  onSwitchRole: (role: 'ADMIN' | 'CLIENT') => void;
  onOpenTriggerModal: () => void;
  isAuditingActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchRole,
  onOpenTriggerModal,
  isAuditingActive
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            EL
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 font-display whitespace-nowrap">
              EDGELINK TECHNOLOGY
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-normal -mt-0.5 whitespace-nowrap">
              Automated SEO & Intelligence Platform
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {currentUser.role === 'ADMIN' ? (
            <>
              <button
                onClick={() => onSelectTab('overview')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'overview'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onSelectTab('clients')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'clients'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Client Management
              </button>
              <button
                onClick={() => onSelectTab('audits')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'audits'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audit Pipeline
              </button>
              <button
                onClick={() => onSelectTab('queue')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'queue'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                BullMQ Worker
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('client-dashboard')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'client-dashboard'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My SEO Performance
              </button>
              <button
                onClick={() => onSelectTab('client-history')}
                className={`py-1 text-sm transition-colors whitespace-nowrap ${
                  currentTab === 'client-history'
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Previous Audits & Reports
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser.role === 'ADMIN' ? (
            <button
              onClick={onOpenTriggerModal}
              disabled={isAuditingActive}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              {isAuditingActive ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Audit in Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trigger New Audit</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs text-slate-600 font-medium">
              Client Portal: <strong className="text-slate-900">{currentUser.clientCompanyName || 'Indiranagar Dental'}</strong>
            </div>
          )}

          {/* Quick Role Switcher for Assessment Evaluator */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onSwitchRole('ADMIN')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentUser.role === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Admin Portal"
            >
              Admin View
            </button>
            <button
              onClick={() => onSwitchRole('CLIENT')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentUser.role === 'CLIENT'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Client Portal"
            >
              Client View
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
