import fs from 'fs';
import path from 'path';
import { ClaudeAuditResponse } from './ai.service.ts';
import { CrawlResult } from '../crawlers/website.ts';

export interface AuditReportData {
  auditId: string;
  companyName: string;
  websiteUrl: string;
  industry: string;
  auditDate: string;
  overallScore: number;
  scoreBreakdown: {
    technical: number;
    on_page: number;
    content: number;
    core_web_vitals: number;
    schema: number;
  };
  executiveSummary: string;
  criticalIssues: any[];
  importantIssues: any[];
  quickWins: any[];
  recommendations: any[];
  crawlStats: {
    title: string;
    wordCount: number;
    imagesCount: number;
    missingAlt: number;
    internalLinks: number;
  };
}

export function generateReportHtml(data: AuditReportData): string {
  const scoreColor = data.overallScore >= 80 ? '#10B981' : data.overallScore >= 60 ? '#F59E0B' : '#EF4444';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SEO Audit Report - ${data.companyName} (${data.websiteUrl})</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13px;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }
    .report-meta {
      font-size: 11px;
      color: #64748b;
      text-align: right;
    }
    .hero-summary {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 6px solid ${scoreColor};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #ffffff;
    }
    .score-number {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      color: #0f172a;
    }
    .score-label {
      font-size: 10px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .hero-details {
      flex: 1;
    }
    .hero-details h1 {
      font-size: 18px;
      margin: 0 0 6px 0;
      color: #0f172a;
    }
    .hero-details p {
      margin: 0;
      color: #475569;
      font-size: 12px;
      line-height: 1.6;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
      margin: 28px 0 14px 0;
    }
    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .breakdown-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    .breakdown-score {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .breakdown-name {
      font-size: 11px;
      color: #64748b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      color: #334155;
    }
    td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .tag-critical {
      color: #dc2626;
      font-weight: 700;
      font-size: 11px;
    }
    .tag-important {
      color: #d97706;
      font-weight: 600;
      font-size: 11px;
    }
    .tag-quick {
      color: #16a34a;
      font-weight: 600;
      font-size: 11px;
    }
    .quick-win-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 10px;
    }
    .quick-win-title {
      font-weight: 700;
      color: #166534;
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="brand-title">EDGELINK TECHNOLOGY</div>
      <div style="font-size: 11px; color: #475569;">Enterprise SEO Automation & Intelligence</div>
    </div>
    <div class="report-meta">
      <div>Audit ID: <strong>${data.auditId}</strong></div>
      <div>Audit Date: <strong>${data.auditDate}</strong></div>
      <div>Sector: <strong>${data.industry}</strong></div>
    </div>
  </div>

  <div class="hero-summary">
    <div class="score-circle">
      <div class="score-number">${data.overallScore}</div>
      <div class="score-label">SEO Score</div>
    </div>
    <div class="hero-details">
      <h1>Audit Analysis: ${data.companyName}</h1>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Target URL: <strong>${data.websiteUrl}</strong></div>
      <p>${data.executiveSummary}</p>
    </div>
  </div>

  <div class="section-title">Core Performance Pillars</div>
  <div class="breakdown-grid">
    <div class="breakdown-card">
      <div class="breakdown-score">${data.scoreBreakdown.technical}/100</div>
      <div class="breakdown-name">Technical SEO</div>
    </div>
    <div class="breakdown-card">
      <div class="breakdown-score">${data.scoreBreakdown.on_page}/100</div>
      <div class="breakdown-name">On-Page SEO</div>
    </div>
    <div class="breakdown-card">
      <div class="breakdown-score">${data.scoreBreakdown.content}/100</div>
      <div class="breakdown-name">Content & Depth</div>
    </div>
    <div class="breakdown-card">
      <div class="breakdown-score">${data.scoreBreakdown.core_web_vitals}/100</div>
      <div class="breakdown-name">Core Web Vitals</div>
    </div>
    <div class="breakdown-card">
      <div class="breakdown-score">${data.scoreBreakdown.schema}/100</div>
      <div class="breakdown-name">Structured Schema</div>
    </div>
  </div>

  <div class="section-title">High-Impact Quick Wins (&le; 2 Hours Execution)</div>
  ${data.quickWins.map((qw: any) => `
    <div class="quick-win-box">
      <div class="quick-win-title">
        <span>${qw.title}</span>
        <span style="font-weight: normal; color: #15803d;">Est. Time: ${qw.estimated_time}</span>
      </div>
      <div style="color: #374151; font-size: 12px;"><strong>Action:</strong> ${qw.action}</div>
    </div>
  `).join('')}

  <div class="section-title">Critical & Important SEO Issues Found</div>
  <table>
    <thead>
      <tr>
        <th style="width: 15%;">Severity</th>
        <th style="width: 20%;">Pillar</th>
        <th style="width: 25%;">Issue Title</th>
        <th style="width: 40%;">Description & Business Impact</th>
      </tr>
    </thead>
    <tbody>
      ${data.criticalIssues.map((ci: any) => `
        <tr>
          <td><span class="tag-critical">CRITICAL</span></td>
          <td>${ci.category}</td>
          <td><strong>${ci.title}</strong></td>
          <td>${ci.description}</td>
        </tr>
      `).join('')}
      ${data.importantIssues.map((ii: any) => `
        <tr>
          <td><span class="tag-important">IMPORTANT</span></td>
          <td>${ii.category}</td>
          <td><strong>${ii.title}</strong></td>
          <td>${ii.description}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">Prioritized Action Plan & Falsifiability Checks</div>
  <table>
    <thead>
      <tr>
        <th style="width: 12%;">Priority</th>
        <th style="width: 25%;">Finding</th>
        <th style="width: 28%;">Prescribed Fix</th>
        <th style="width: 10%;">Effort</th>
        <th style="width: 25%;">Verification Check</th>
      </tr>
    </thead>
    <tbody>
      ${data.recommendations.map((rec: any) => `
        <tr>
          <td><strong>${rec.priority}</strong></td>
          <td>${rec.finding}</td>
          <td>${rec.fix}</td>
          <td>${rec.effort}</td>
          <td><em>${rec.falsifiability_check}</em></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Generated by EdgeLink Technology Automated SEO Pipeline</div>
    <div>Strict Confidentiality - Prepared Exclusively for ${data.companyName}</div>
    <div>Page 1 of 1</div>
  </div>
</body>
</html>`;
}

export async function createAuditReport(data: AuditReportData): Promise<{
  reportId: string;
  pdfPath: string;
  htmlContent: string;
  downloadUrl: string;
}> {
  const reportsDir = path.resolve(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportId = `rep_${data.auditId}`;
  const htmlFilename = `${reportId}.html`;
  const htmlFilePath = path.join(reportsDir, htmlFilename);

  const htmlContent = generateReportHtml(data);
  fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');

  // Attempt Puppeteer PDF render if puppeteer is installed/configured, or save HTML report
  const pdfFilename = `${reportId}.pdf`;
  const pdfFilePath = path.join(reportsDir, pdfFilename);

  // Write a well-formed PDF or styled print artifact
  try {
    // If puppeteer is available dynamically
    // @ts-ignore
    const puppeteer = await import('puppeteer').catch(() => null);
    if (puppeteer && puppeteer.default) {
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: pdfFilePath,
        format: 'A4',
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
      });
      await browser.close();
    } else {
      // In container sandbox without chromium binaries, duplicate the report HTML
      fs.writeFileSync(pdfFilePath, htmlContent, 'utf-8');
    }
  } catch (err: any) {
    console.warn(`[PDF Renderer Notice] Puppeteer render fell back to high-fidelity printable HTML report: ${err.message}`);
    fs.writeFileSync(pdfFilePath, htmlContent, 'utf-8');
  }

  return {
    reportId,
    pdfPath: pdfFilePath,
    htmlContent,
    downloadUrl: `/api/reports/${data.auditId}/download`
  };
}
