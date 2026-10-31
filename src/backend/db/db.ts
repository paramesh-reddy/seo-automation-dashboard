/**
 * EdgeLink Database & State Store
 * Implements the Prisma schema models in memory with persistent seed data
 */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  password: string; // Plaintext/hashed for demo
  role: 'ADMIN' | 'CLIENT';
  createdAt: string;
  clientId?: string;
}

export interface ClientRecord {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: 'Healthcare' | 'Dental' | 'Real Estate' | 'Local Business';
  userId: string;
  websiteCount?: number;
  latestScore?: number;
  createdAt: string;
}

export interface WebsiteRecord {
  id: string;
  url: string;
  clientId: string;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  websiteId: string;
  websiteUrl: string;
  clientId: string;
  companyName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  currentStage: number; // 1 to 18
  stageName: string;
  progress: number; // 0 to 100
  overallScore?: number;
  techScore?: number;
  onPageScore?: number;
  contentScore?: number;
  cwvScore?: number;
  schemaScore?: number;
  rawCrawlData?: any;
  aiResponse?: any;
  errorMessage?: string;
  jobId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  pdfPath?: string;
  reportUrl?: string;
}

// In-Memory Database store populated with seed data
class DatabaseStore {
  users: UserRecord[] = [];
  clients: ClientRecord[] = [];
  websites: WebsiteRecord[] = [];
  audits: AuditRecord[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Admin User
    const adminUser: UserRecord = {
      id: 'usr_admin_001',
      email: 'admin@edgelink.tech',
      name: 'Senior EdgeLink Auditor',
      password: 'password123',
      role: 'ADMIN',
      createdAt: '2026-10-01T08:00:00Z'
    };

    // 2. Client 1: Indiranagar Dental Specialties
    const clientUser1: UserRecord = {
      id: 'usr_client_001',
      email: 'dr.ananya@indiranagardental.in',
      name: 'Dr. Ananya Sharma',
      password: 'password123',
      role: 'CLIENT',
      clientId: 'cli_001',
      createdAt: '2026-10-05T09:00:00Z'
    };

    const client1: ClientRecord = {
      id: 'cli_001',
      companyName: 'Indiranagar Dental Specialties',
      contactName: 'Dr. Ananya Sharma',
      email: 'dr.ananya@indiranagardental.in',
      phone: '+919845012345',
      industry: 'Dental',
      userId: clientUser1.id,
      latestScore: 78,
      createdAt: '2026-10-05T09:00:00Z'
    };

    const website1: WebsiteRecord = {
      id: 'web_001',
      url: 'https://indiranagardental.in',
      clientId: client1.id,
      createdAt: '2026-10-05T09:15:00Z'
    };

    // 3. Client 2: Prestige Horizons Real Estate
    const clientUser2: UserRecord = {
      id: 'usr_client_002',
      email: 'sales@prestigehorizons.in',
      name: 'Vikramaditya Roy',
      password: 'password123',
      role: 'CLIENT',
      clientId: 'cli_002',
      createdAt: '2026-10-10T11:00:00Z'
    };

    const client2: ClientRecord = {
      id: 'cli_002',
      companyName: 'Prestige Horizons Real Estate',
      contactName: 'Vikramaditya Roy',
      email: 'sales@prestigehorizons.in',
      phone: '+919876543210',
      industry: 'Real Estate',
      userId: clientUser2.id,
      latestScore: 68,
      createdAt: '2026-10-10T11:00:00Z'
    };

    const website2: WebsiteRecord = {
      id: 'web_002',
      url: 'https://prestigehorizons.in',
      clientId: client2.id,
      createdAt: '2026-10-10T11:10:00Z'
    };

    // 4. Client 3: Apex Diagnostics Labs
    const clientUser3: UserRecord = {
      id: 'usr_client_003',
      email: 'contact@apexdiagnostics.in',
      name: 'Rohan Mehra',
      password: 'password123',
      role: 'CLIENT',
      clientId: 'cli_003',
      createdAt: '2026-10-15T14:00:00Z'
    };

    const client3: ClientRecord = {
      id: 'cli_003',
      companyName: 'Apex Diagnostics Labs',
      contactName: 'Rohan Mehra',
      email: 'contact@apexdiagnostics.in',
      phone: '+919900112233',
      industry: 'Healthcare',
      userId: clientUser3.id,
      latestScore: 84,
      createdAt: '2026-10-15T14:00:00Z'
    };

    const website3: WebsiteRecord = {
      id: 'web_003',
      url: 'https://apexdiagnostics.in',
      clientId: client3.id,
      createdAt: '2026-10-15T14:15:00Z'
    };

    this.users = [adminUser, clientUser1, clientUser2, clientUser3];
    this.clients = [client1, client2, client3];
    this.websites = [website1, website2, website3];

    // Seed Completed Audit for Client 1
    const audit1: AuditRecord = {
      id: 'aud_seed_001',
      websiteId: website1.id,
      websiteUrl: website1.url,
      clientId: client1.id,
      companyName: client1.companyName,
      status: 'COMPLETED',
      currentStage: 18,
      stageName: 'Audit Completed & Dispatched',
      progress: 100,
      overallScore: 78,
      techScore: 82,
      onPageScore: 80,
      contentScore: 75,
      cwvScore: 68,
      schemaScore: 85,
      aiResponse: {
        audit_version: "v1.0",
        overall_score: 78,
        score_breakdown: { technical: 82, on_page: 80, content: 75, core_web_vitals: 68, schema: 85 },
        critical_issues: [
          {
            title: "LCP exceeds 3.8s on Mobile Viewports",
            description: "Largest Contentful Paint is measured at 3.8s, causing page abandonment on Indian 4G mobile connections.",
            category: "Core Web Vitals",
            impact: "High"
          },
          {
            title: "Duplicate Service URL Parameters Indexed",
            description: "Google Search Console flagged 8 duplicate variations without self-referencing canonical tags.",
            category: "Technical",
            impact: "High"
          }
        ],
        important_issues: [
          {
            title: "14 Clinic Procedure Images Missing Alt Attributes",
            description: "Missing alt tags prevent image search traffic for keywords like 'dental implant before after'.",
            category: "On-page",
            impact: "Medium"
          },
          {
            title: "Meta Description Too Short (84 Chars)",
            description: "Snippets in Google search do not highlight telephone consultation options or Indiranagar locality.",
            category: "On-page",
            impact: "Medium"
          }
        ],
        quick_wins: [
          {
            title: "Inject Doctor & Dentist Schema.org Markup",
            action: "Add validated Physician/Dentist JSON-LD with consultation hours and address.",
            estimated_time: "45 mins",
            impact: "High"
          },
          {
            title: "Preload Banner Font & Hero WebP Asset",
            action: "Add link rel=preload tag to reduce LCP by ~900ms instantly.",
            estimated_time: "30 mins",
            impact: "High"
          },
          {
            title: "Update Indiranagar Clinic Meta Title",
            action: "Add local neighborhood and top treatment keywords to homepage title tag.",
            estimated_time: "15 mins",
            impact: "Medium"
          }
        ],
        recommendations: [
          {
            priority: "CRITICAL",
            category: "Core Web Vitals",
            finding: "LCP is 3.8s on mobile, exceeding the 2.5s threshold.",
            fix: "Preload hero images, convert to modern WebP, and eliminate render-blocking CSS.",
            estimated_impact: "High",
            effort: "Hours",
            falsifiability_check: "PageSpeed Insights mobile LCP test <= 2.5s."
          },
          {
            priority: "IMPORTANT",
            category: "On-page",
            finding: "14 images missing alt attributes.",
            fix: "Inject descriptive keyword-rich alt tags on procedure and doctor images.",
            estimated_impact: "Medium",
            effort: "Hours",
            falsifiability_check: "Lighthouse accessibility image alt audit score reaches 100."
          }
        ],
        executive_summary: "Indiranagar Dental Specialties presents strong domain authority and healthy local query rankings. Fixing the 3.8s mobile LCP bottleneck and deploying Physician Schema will immediately boost Local Pack rankings in East Bangalore."
      },
      startedAt: '2026-10-28T10:00:00Z',
      completedAt: '2026-10-28T10:01:14Z',
      createdAt: '2026-10-28T10:00:00Z',
      reportUrl: '/api/reports/aud_seed_001/download'
    };

    this.audits = [audit1];
  }

  // User queries
  findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): UserRecord | undefined {
    return this.users.find(u => u.id === id);
  }

  // Client queries
  getAllClients(): ClientRecord[] {
    return this.clients.map(c => {
      const websites = this.websites.filter(w => w.clientId === c.id);
      const latestAudit = this.audits.filter(a => a.clientId === c.id && a.status === 'COMPLETED')[0];
      return {
        ...c,
        websiteCount: websites.length,
        latestScore: latestAudit?.overallScore ?? c.latestScore ?? 0
      };
    });
  }

  findClientById(id: string): ClientRecord | undefined {
    return this.clients.find(c => c.id === id);
  }

  findClientByUserId(userId: string): ClientRecord | undefined {
    return this.clients.find(c => c.userId === userId);
  }

  createClient(data: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    industry: 'Healthcare' | 'Dental' | 'Real Estate' | 'Local Business';
    websiteUrl: string;
  }): { client: ClientRecord; website: WebsiteRecord; user: UserRecord } {
    const userId = `usr_${Date.now()}`;
    const clientId = `cli_${Date.now()}`;
    const websiteId = `web_${Date.now()}`;

    const user: UserRecord = {
      id: userId,
      email: data.email,
      name: data.contactName,
      password: 'password123',
      role: 'CLIENT',
      clientId,
      createdAt: new Date().toISOString()
    };

    const client: ClientRecord = {
      id: clientId,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      industry: data.industry,
      userId,
      latestScore: 0,
      createdAt: new Date().toISOString()
    };

    const website: WebsiteRecord = {
      id: websiteId,
      url: data.websiteUrl,
      clientId,
      createdAt: new Date().toISOString()
    };

    this.users.push(user);
    this.clients.push(client);
    this.websites.push(website);

    return { client, website, user };
  }

  updateClient(id: string, updates: Partial<ClientRecord>): ClientRecord | undefined {
    const idx = this.clients.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.clients[idx] = { ...this.clients[idx], ...updates };
    return this.clients[idx];
  }

  deleteClient(id: string): boolean {
    const initialLen = this.clients.length;
    this.clients = this.clients.filter(c => c.id !== id);
    this.websites = this.websites.filter(w => w.clientId !== id);
    this.audits = this.audits.filter(a => a.clientId !== id);
    return this.clients.length < initialLen;
  }

  // Website queries
  getWebsitesByClientId(clientId: string): WebsiteRecord[] {
    return this.websites.filter(w => w.clientId === clientId);
  }

  findWebsiteById(id: string): WebsiteRecord | undefined {
    return this.websites.find(w => w.id === id);
  }

  findWebsiteByUrl(url: string): WebsiteRecord | undefined {
    return this.websites.find(w => w.url.toLowerCase() === url.toLowerCase());
  }

  // Audit queries
  getAllAudits(): AuditRecord[] {
    return [...this.audits].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAuditsByClientId(clientId: string): AuditRecord[] {
    return this.audits
      .filter(a => a.clientId === clientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findAuditById(id: string): AuditRecord | undefined {
    return this.audits.find(a => a.id === id);
  }

  createAuditRecord(data: {
    websiteId: string;
    websiteUrl: string;
    clientId: string;
    companyName: string;
  }): AuditRecord {
    const audit: AuditRecord = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      websiteId: data.websiteId,
      websiteUrl: data.websiteUrl,
      clientId: data.clientId,
      companyName: data.companyName,
      status: 'PENDING',
      currentStage: 1,
      stageName: 'Audit Triggered & Queued',
      progress: 5,
      createdAt: new Date().toISOString()
    };
    this.audits.unshift(audit);
    return audit;
  }

  updateAuditRecord(id: string, updates: Partial<AuditRecord>): AuditRecord | undefined {
    const idx = this.audits.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.audits[idx] = { ...this.audits[idx], ...updates };
    return this.audits[idx];
  }
}

export const db = new DatabaseStore();
