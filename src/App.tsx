import React, { useState, useEffect } from 'react';
import { Navbar } from './frontend/components/Navbar.tsx';
import { StatsCards } from './frontend/components/StatsCards.tsx';
import { ClientManagement } from './frontend/components/ClientManagement.tsx';
import { AuditTable } from './frontend/components/AuditTable.tsx';
import { QueueMonitor } from './frontend/components/QueueMonitor.tsx';
import { ClientPortalView } from './frontend/components/ClientPortalView.tsx';
import { TriggerAuditModal } from './frontend/components/TriggerAuditModal.tsx';
import { RealTimeTrackerModal } from './frontend/components/RealTimeTrackerModal.tsx';
import { AuditDetailsModal } from './frontend/components/AuditDetailsModal.tsx';
import { Client, Audit, QueueStatus, User } from './frontend/types.ts';
import { Play, Sparkles, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr_admin_001',
    email: 'admin@edgelink.tech',
    name: 'Senior EdgeLink Auditor',
    role: 'ADMIN'
  });

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [targetClientForAudit, setTargetClientForAudit] = useState<Client | null>(null);
  const [activeTrackingAuditId, setActiveTrackingAuditId] = useState<string | null>(null);
  const [inspectedAudit, setInspectedAudit] = useState<Audit | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch initial data
  const fetchData = async () => {
    try {
      const [clientsRes, auditsRes, queueRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/audits'),
        fetch('/api/queue/status')
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
      if (auditsRes.ok) {
        const data = await auditsRes.json();
        setAudits(data.audits || []);
      }
      if (queueRes.ok) {
        const data = await queueRes.json();
        setQueueStatus(data);
      }
    } catch (err: any) {
      console.error('Data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Auto-polling for active audits in pipeline
  useEffect(() => {
    const hasActiveAudits = audits.some(a => a.status === 'PROCESSING' || a.status === 'PENDING');
    if (!hasActiveAudits) return;

    const pollInterval = setInterval(async () => {
      try {
        const [auditsRes, queueRes] = await Promise.all([
          fetch('/api/audits'),
          fetch('/api/queue/status')
        ]);
        if (auditsRes.ok) {
          const data = await auditsRes.json();
          setAudits(data.audits || []);
        }
        if (queueRes.ok) {
          const data = await queueRes.json();
          setQueueStatus(data);
        }
      } catch {
        // silent fail during poll
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [audits]);

  // Role Switcher
  const handleSwitchRole = (newRole: 'ADMIN' | 'CLIENT') => {
    if (newRole === 'ADMIN') {
      setCurrentUser({
        id: 'usr_admin_001',
        email: 'admin@edgelink.tech',
        name: 'Senior EdgeLink Auditor',
        role: 'ADMIN'
      });
      setCurrentTab('overview');
      showToast('Switched to Admin Portal view');
    } else {
      const demoClient = clients[0] || {
        id: 'cli_001',
        companyName: 'Indiranagar Dental Specialties',
        contactName: 'Dr. Ananya Sharma',
        email: 'dr.ananya@indiranagardental.in',
        phone: '+919845012345',
        industry: 'Dental'
      };

      setCurrentUser({
        id: 'usr_client_001',
        email: demoClient.email,
        name: demoClient.contactName,
        role: 'CLIENT',
        clientId: demoClient.id,
        clientCompanyName: demoClient.companyName
      });
      setCurrentTab('client-dashboard');
      showToast(`Viewing as Client: ${demoClient.companyName}`);
    }
  };

  // Handlers
  const handleTriggerAudit = async (clientId: string, websiteUrl: string): Promise<string> => {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, websiteUrl })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to trigger audit');
    }

    const data = await res.json();
    showToast(`Audit job queued (${data.jobId}). Pipeline processing started!`);
    await fetchData();
    setActiveTrackingAuditId(data.auditId);
    return data.auditId;
  };

  const handleAddClient = async (newClientData: any) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newClientData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create client');
    }

    await fetchData();
    showToast(`Client "${newClientData.companyName}" successfully registered.`);
  };

  const handleEditClient = async (clientId: string, updates: any) => {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update client');
    }

    await fetchData();
    showToast('Client details updated.');
  };

  const handleDeleteClient = async (clientId: string) => {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete client');
    }

    await fetchData();
    showToast('Client deleted successfully.');
  };

  const handleRetryAudit = async (auditId: string) => {
    try {
      const res = await fetch(`/api/audits/${auditId}/retry`, { method: 'POST' });
      if (!res.ok) throw new Error('Retry request failed');
      showToast('Audit retry initiated.');
      await fetchData();
      setActiveTrackingAuditId(auditId);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const isAuditingActive = audits.some(a => a.status === 'PROCESSING' || a.status === 'PENDING');

  // Client Portal specific client and audits
  const activeClient = clients.find(c => c.id === currentUser.clientId) || clients[0];
  const clientAudits = audits.filter(a => a.clientId === activeClient?.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Contract (1-line brand, clean text links, single CTA) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenTriggerModal={() => {
          setTargetClientForAudit(null);
          setIsTriggerModalOpen(true);
        }}
        isAuditingActive={isAuditingActive}
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentUser.role === 'ADMIN' ? (
          <>
            {/* View Tab 1: Overview */}
            {currentTab === 'overview' && (
              <div className="space-y-8">
                {/* Hero Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-display">
                      Autonomous SEO Pipeline
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 font-display mt-0.5">
                      EdgeLink Agency Operations Console
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                      Automated 18-step SEO auditing pipeline for Indian local businesses, healthcare, dental, and real estate clients powered by Claude AI.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setTargetClientForAudit(null);
                      setIsTriggerModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Run Automated Audit</span>
                  </button>
                </div>

                {/* Section 4: Statistics Cards */}
                <StatsCards clients={clients} audits={audits} />

                {/* Recent Audits Table */}
                <AuditTable
                  audits={audits}
                  onViewAuditDetails={setInspectedAudit}
                  onRetryAudit={handleRetryAudit}
                  onTriggerNewAudit={() => {
                    setTargetClientForAudit(null);
                    setIsTriggerModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* View Tab 2: Clients */}
            {currentTab === 'clients' && (
              <ClientManagement
                clients={clients}
                onTriggerAuditForClient={client => {
                  setTargetClientForAudit(client);
                  setIsTriggerModalOpen(true);
                }}
                onAddClient={handleAddClient}
                onEditClient={handleEditClient}
                onDeleteClient={handleDeleteClient}
              />
            )}

            {/* View Tab 3: Audits */}
            {currentTab === 'audits' && (
              <AuditTable
                audits={audits}
                onViewAuditDetails={setInspectedAudit}
                onRetryAudit={handleRetryAudit}
                onTriggerNewAudit={() => {
                  setTargetClientForAudit(null);
                  setIsTriggerModalOpen(true);
                }}
              />
            )}

            {/* View Tab 4: Queue Monitor */}
            {currentTab === 'queue' && (
              <QueueMonitor
                queueStatus={queueStatus}
                onRefresh={fetchData}
              />
            )}
          </>
        ) : (
          /* Client Portal View */
          activeClient ? (
            <ClientPortalView
              client={activeClient}
              audits={clientAudits}
              onSelectAudit={setInspectedAudit}
            />
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <p className="text-slate-500 text-xs">No client record assigned.</p>
            </div>
          )
        )}
      </main>

      {/* Modals */}
      <TriggerAuditModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        clients={clients}
        initialClient={targetClientForAudit}
        onTriggerAudit={handleTriggerAudit}
      />

      <RealTimeTrackerModal
        auditId={activeTrackingAuditId}
        onClose={() => setActiveTrackingAuditId(null)}
        onViewAuditDetails={setInspectedAudit}
      />

      <AuditDetailsModal
        audit={inspectedAudit}
        onClose={() => setInspectedAudit(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <strong>EDGELINK TECHNOLOGY</strong> · Automated SEO Intelligence & Pipeline Infrastructure
          </div>
          <div className="flex items-center gap-4">
            <span>Model: Anthropic Claude Sonnet 4.6</span>
            <span aria-hidden="true">·</span>
            <span>USE_MOCKS: Enabled</span>
            <span aria-hidden="true">·</span>
            <span>Version: v1.0 Production Candidate</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
