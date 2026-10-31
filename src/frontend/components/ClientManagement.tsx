import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Play, Trash2, Edit2, Building2, Phone, Mail, Globe, ShieldAlert } from 'lucide-react';
import { Client } from '../types.ts';

interface ClientManagementProps {
  clients: Client[];
  onTriggerAuditForClient: (client: Client) => void;
  onAddClient: (newClientData: any) => Promise<void>;
  onEditClient: (clientId: string, updates: any) => Promise<void>;
  onDeleteClient: (clientId: string) => Promise<void>;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
  clients,
  onTriggerAuditForClient,
  onAddClient,
  onEditClient,
  onDeleteClient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // New Client Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState<'Healthcare' | 'Dental' | 'Real Estate' | 'Local Business'>('Dental');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!companyName || !email || !websiteUrl) {
      setFormError('Please fill in Company Name, Email, and Website URL.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddClient({
        companyName,
        contactName: contactName || companyName,
        email,
        phone: phone || '+919845012345',
        industry,
        websiteUrl
      });
      setIsAddModalOpen(false);
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setWebsiteUrl('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to register client');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await onDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">Client Portfolio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client businesses, domains, and on-demand SEO auditing runs
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Client</span>
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
            placeholder="Search company, contact, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Industry Filter Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-0.5 bg-slate-100 rounded-lg border border-slate-200">
          {['ALL', 'Healthcare', 'Dental', 'Real Estate', 'Local Business'].map(ind => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedIndustry === ind
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ind === 'ALL' ? 'All Sectors' : ind}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Company & Contact</th>
                <th className="px-5 py-3.5">Industry Sector</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Latest Score</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No clients match your filter</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Try adjusting your search terms or add a new client.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => {
                  const score = client.latestScore ?? 0;
                  const scoreColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-slate-400';

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 text-sm font-display">{client.companyName}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">Contact: {client.contactName}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-700 font-medium">
                          {client.industry}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{client.phone}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {score > 0 ? (
                          <div className="flex items-baseline gap-1">
                            <span className={`text-base font-bold tabular-nums ${scoreColor}`}>{score}</span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending Audit</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onTriggerAuditForClient(client)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                            title="Trigger full automated SEO audit"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Audit Now</span>
                          </button>
                          <button
                            onClick={() => setClientToDelete(client)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                            title="Delete client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Register New Client Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enrolls client into database & preps audit pipeline</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Clinic Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Multispeciality Dental Clinic"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="Dental">Dental Care</option>
                    <option value="Healthcare">Healthcare & Hospitals</option>
                    <option value="Real Estate">Real Estate & Builders</option>
                    <option value="Local Business">Local Retail / Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@apexdental.in"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+919845012345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Website URL *</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={websiteUrl}
                    onChange={e => setWebsiteUrl(e.target.value)}
                    placeholder="https://apexdentalcare.in"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protected by SSRF guards. Only public HTTP/HTTPS URLs permitted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-sm font-display">Confirm Client Removal</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete <strong>{clientToDelete.companyName}</strong>? All associated websites, historical audits, and generated PDF reports will be permanently unlinked.
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setClientToDelete(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
