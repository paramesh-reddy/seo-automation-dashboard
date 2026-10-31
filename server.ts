import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/backend/db/db.ts';
import { auditQueue } from './src/backend/queues/audit.queue.ts';
import { getNotificationsByAuditId } from './src/backend/services/notify.service.ts';
import { validateSafeUrl } from './src/backend/crawlers/ssrf.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Routes
// 1. Authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your email and password.' });
  }

  const client = user.clientId ? db.findClientById(user.clientId) : undefined;

  return res.json({
    token: `jwt_mock_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      clientCompanyName: client?.companyName
    }
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const token = authHeader.replace('Bearer ', '');
  const match = token.match(/jwt_mock_([a-zA-Z0-9_]+)_/);
  const userId = match ? match[1] : 'usr_admin_001';

  const user = db.findUserById(userId) || db.users[0];
  const client = user.clientId ? db.findClientById(user.clientId) : undefined;

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      clientCompanyName: client?.companyName
    }
  });
});

// 2. Clients
app.get('/api/clients', (req: Request, res: Response) => {
  const clients = db.getAllClients();
  return res.json({ clients });
});

app.get('/api/clients/:id', (req: Request, res: Response) => {
  const client = db.findClientById(req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }
  const websites = db.getWebsitesByClientId(client.id);
  const audits = db.getAuditsByClientId(client.id);
  return res.json({ client, websites, audits });
});

app.post('/api/clients', (req: Request, res: Response) => {
  const { companyName, contactName, email, phone, industry, websiteUrl } = req.body;
  if (!companyName || !email || !websiteUrl) {
    return res.status(400).json({ error: 'Company name, email, and website URL are required' });
  }

  // Validate URL with SSRF checker
  const urlCheck = validateSafeUrl(websiteUrl);
  if (!urlCheck.valid) {
    return res.status(400).json({ error: `Website URL validation failed: ${urlCheck.error}` });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'A client with this email already exists' });
  }

  const result = db.createClient({
    companyName,
    contactName: contactName || companyName,
    email,
    phone: phone || '+919845012345',
    industry: industry || 'Healthcare',
    websiteUrl: urlCheck.normalizedUrl!
  });

  return res.status(201).json(result);
});

app.put('/api/clients/:id', (req: Request, res: Response) => {
  const updated = db.updateClient(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Client not found' });
  }
  return res.json({ client: updated });
});

app.delete('/api/clients/:id', (req: Request, res: Response) => {
  const deleted = db.deleteClient(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Client not found' });
  }
  return res.json({ success: true, message: 'Client and associated records deleted' });
});

// 3. Websites
app.get('/api/websites', (req: Request, res: Response) => {
  return res.json({ websites: db.websites });
});

// 4. Audits & Pipeline
app.get('/api/audits', (req: Request, res: Response) => {
  const { clientId, status } = req.query;
  let audits = db.getAllAudits();

  if (clientId && typeof clientId === 'string') {
    audits = audits.filter(a => a.clientId === clientId);
  }
  if (status && typeof status === 'string') {
    audits = audits.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  return res.json({ audits });
});

app.get('/api/audits/:id', (req: Request, res: Response) => {
  const audit = db.findAuditById(req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }
  const notifications = getNotificationsByAuditId(audit.id);
  return res.json({ audit, notifications });
});

app.get('/api/audits/:id/progress', (req: Request, res: Response) => {
  const audit = db.findAuditById(req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }
  return res.json({
    id: audit.id,
    status: audit.status,
    currentStage: audit.currentStage,
    stageName: audit.stageName,
    progress: audit.progress,
    startedAt: audit.startedAt,
    completedAt: audit.completedAt,
    overallScore: audit.overallScore,
    errorMessage: audit.errorMessage
  });
});

// Step 1, 2, 3: Trigger an SEO audit
app.post('/api/audits', async (req: Request, res: Response) => {
  const { websiteId, websiteUrl, clientId } = req.body;

  let targetWebsite = websiteId ? db.findWebsiteById(websiteId) : undefined;
  let targetClient = clientId ? db.findClientById(clientId) : undefined;

  if (!targetWebsite && websiteUrl) {
    targetWebsite = db.findWebsiteByUrl(websiteUrl);
  }

  if (targetWebsite && !targetClient) {
    targetClient = db.findClientById(targetWebsite.clientId);
  }

  // If website does not exist yet, allow ad-hoc creation with active client
  if (!targetWebsite && websiteUrl && targetClient) {
    const urlCheck = validateSafeUrl(websiteUrl);
    if (!urlCheck.valid) {
      return res.status(400).json({ error: urlCheck.error });
    }
    const webId = `web_${Date.now()}`;
    targetWebsite = {
      id: webId,
      url: urlCheck.normalizedUrl!,
      clientId: targetClient.id,
      createdAt: new Date().toISOString()
    };
    db.websites.push(targetWebsite);
  }

  if (!targetWebsite || !targetClient) {
    return res.status(400).json({ error: 'Valid website and client must be specified' });
  }

  // Step 2: Create audit record in database
  const audit = db.createAuditRecord({
    websiteId: targetWebsite.id,
    websiteUrl: targetWebsite.url,
    clientId: targetClient.id,
    companyName: targetClient.companyName
  });

  // Step 3: Add the audit job to BullMQ queue
  const { jobId } = await auditQueue.addAuditJob({
    auditId: audit.id,
    websiteId: targetWebsite.id,
    websiteUrl: targetWebsite.url,
    clientId: targetClient.id,
    industry: targetClient.industry,
    companyName: targetClient.companyName,
    clientPhone: targetClient.phone
  });

  // Non-blocking response
  return res.status(202).json({
    message: 'SEO audit job queued successfully',
    auditId: audit.id,
    jobId,
    status: 'PENDING',
    progressUrl: `/api/audits/${audit.id}/progress`
  });
});

// Retry audit
app.post('/api/audits/:id/retry', async (req: Request, res: Response) => {
  const audit = db.findAuditById(req.params.id);
  if (!audit) {
    return res.status(404).json({ error: 'Audit not found' });
  }

  const client = db.findClientById(audit.clientId);
  if (!client) {
    return res.status(404).json({ error: 'Client record not found' });
  }

  db.updateAuditRecord(audit.id, {
    status: 'PENDING',
    currentStage: 1,
    stageName: 'Audit Retry Triggered & Queued',
    progress: 5,
    errorMessage: undefined
  });

  const { jobId } = await auditQueue.addAuditJob({
    auditId: audit.id,
    websiteId: audit.websiteId,
    websiteUrl: audit.websiteUrl,
    clientId: client.id,
    industry: client.industry,
    companyName: client.companyName,
    clientPhone: client.phone
  });

  return res.json({ message: 'Audit retry enqueued', auditId: audit.id, jobId });
});

// 5. Reports & PDF downloads
app.get('/api/reports/:id/download', (req: Request, res: Response) => {
  const audit = db.findAuditById(req.params.id);
  if (!audit) {
    return res.status(404).send('Audit not found');
  }

  const reportsDir = path.resolve(process.cwd(), 'reports');
  const reportPath = path.join(reportsDir, `rep_${audit.id}.html`);

  if (fs.existsSync(reportPath)) {
    const content = fs.readFileSync(reportPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  }

  // If file not written yet, generate on the fly
  return res.status(404).json({ error: 'Report is still compiling or unavailable' });
});

// 6. Queue Telemetry
app.get('/api/queue/status', (req: Request, res: Response) => {
  const status = auditQueue.getQueueStatus();
  return res.json(status);
});

// Start server with Vite middleware in development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 EdgeLink SEO Automation Dashboard running on port ${PORT}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
    console.log(`🔧 USE_MOCKS: ${process.env.USE_MOCKS !== 'false'}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
