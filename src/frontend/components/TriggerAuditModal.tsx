import React, { useState } from 'react';
import { Play, Globe, Building2, Sparkles, AlertCircle } from 'lucide-react';
import { Client } from '../types.ts';

interface TriggerAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClient?: Client | null;
  onTriggerAudit: (clientId: string, websiteUrl: string) => Promise<string>; // returns auditId
}

export const TriggerAuditModal: React.FC<TriggerAuditModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClient,
  onTriggerAudit
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || clients[0]?.id || '');
  const [websiteUrl, setWebsiteUrl] = useState<string>(
    initialClient?.id === 'cli_001' ? 'https://indiranagardental.in' :
    initialClient?.id === 'cli_002' ? 'https://prestigehorizons.in' :
    initialClient?.id === 'cli_003' ? 'https://apexdiagnostics.in' :
    'https://indiranagardental.in'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    if (clientId === 'cli_001') setWebsiteUrl('https://indiranagardental.in');
    else if (clientId === 'cli_002') setWebsiteUrl('https://prestigehorizons.in');
    else if (clientId === 'cli_003') setWebsiteUrl('https://apexdiagnostics.in');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedClientId) {
      setError('Please select a client account.');
      return;
    }
    if (!websiteUrl) {
      setError('Please provide a website URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onTriggerAudit(selectedClientId, websiteUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch audit pipeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Launch Automated SEO Audit</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dispatches BullMQ background worker pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Client Account *</label>
            <select
              value={selectedClientId}
              onChange={e => handleClientChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white font-medium"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.industry})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Website URL *</label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={e => setWebsiteUrl(e.target.value)}
                placeholder="https://example-client.com"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Protected by SSRF security validation. Only HTTP and HTTPS domains permitted.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800">Pipeline Execution Sequence:</div>
            <div className="text-slate-500">
              1. Cheerio Crawl & On-Page Extraction &rarr; 2. Mock Ingest (PageSpeed, GSC, DataForSEO) &rarr; 3. Anthropic Claude AI Analysis &rarr; 4. PDF Generation &rarr; 5. Twilio WhatsApp Dispatch.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSubmitting ? 'Enqueuing...' : 'Start Audit Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
