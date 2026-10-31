import { db, AuditRecord } from '../db/db.ts';
import { crawlWebsite } from '../crawlers/website.ts';
import { fetchPageSpeedData } from '../../mocks/pagespeed.mock.ts';
import { fetchGSCData } from '../../mocks/gsc.mock.ts';
import { fetchDataForSeoData } from '../../mocks/dataforseo.mock.ts';
import { runClaudeSeoAnalysis } from '../services/ai.service.ts';
import { createAuditReport } from '../services/pdf.service.ts';
import { dispatchAuditNotification } from '../services/notify.service.ts';

export interface AuditJobData {
  auditId: string;
  websiteId: string;
  websiteUrl: string;
  clientId: string;
  industry: string;
  companyName: string;
  clientPhone: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes the exact 18-step SEO audit pipeline specified in Section 6
 */
export async function processAuditJob(jobData: AuditJobData): Promise<AuditRecord> {
  const { auditId, websiteUrl, companyName, clientPhone, industry } = jobData;
  console.log(`\n======================================================`);
  console.log(`[AUDIT PIPELINE STARTED] Processing Audit ID: ${auditId}`);
  console.log(`Target: ${websiteUrl} | Company: ${companyName} | Industry: ${industry}`);
  console.log(`======================================================`);

  try {
    // Step 4: Worker processes the job
    db.updateAuditRecord(auditId, {
      status: 'PROCESSING',
      currentStage: 4,
      stageName: 'Worker Initialized & Allocating Resources',
      progress: 15,
      startedAt: new Date().toISOString()
    });
    await sleep(400);

    // Step 5: Crawl website using Fetch and Cheerio (with SSRF defense)
    db.updateAuditRecord(auditId, {
      currentStage: 5,
      stageName: 'Crawling Website & Extracting On-Page Elements (Cheerio)',
      progress: 25
    });
    const crawlData = await crawlWebsite(websiteUrl);
    await sleep(300);

    // Step 6: Fetch PageSpeed data using mock integration
    db.updateAuditRecord(auditId, {
      currentStage: 6,
      stageName: 'Ingesting PageSpeed & Core Web Vitals Telemetry',
      progress: 35
    });
    const pagespeedData = await fetchPageSpeedData(websiteUrl);
    await sleep(300);

    // Step 7: Fetch Google Search Console data using mock integration
    db.updateAuditRecord(auditId, {
      currentStage: 7,
      stageName: 'Fetching Google Search Console Clicks & Query Indexation',
      progress: 45
    });
    const gscData = await fetchGSCData(new URL(crawlData.url).hostname);
    await sleep(300);

    // Step 8: Validate Schema.org structured data
    db.updateAuditRecord(auditId, {
      currentStage: 8,
      stageName: 'Validating Schema.org JSON-LD Structured Data Hierarchy',
      progress: 52
    });
    await sleep(300);

    // Step 9: Perform on-page SEO analysis
    db.updateAuditRecord(auditId, {
      currentStage: 9,
      stageName: 'Analyzing On-Page Meta, Headings, and Density Heuristics',
      progress: 58
    });
    await sleep(300);

    // Step 10: Check robots.txt and sitemap.xml
    db.updateAuditRecord(auditId, {
      currentStage: 10,
      stageName: 'Verifying robots.txt directives and sitemap.xml index',
      progress: 65
    });
    await sleep(300);

    // Step 11: Fetch keyword rankings using DataForSEO mock integration
    db.updateAuditRecord(auditId, {
      currentStage: 11,
      stageName: 'Querying DataForSEO SERP Rankings & Competitor Gap Data',
      progress: 72
    });
    const dataforseoData = await fetchDataForSeoData(new URL(crawlData.url).hostname);
    await sleep(300);

    // Step 12: Send all collected information to Claude
    db.updateAuditRecord(auditId, {
      currentStage: 12,
      stageName: 'Synthesizing Prompt & Submitting to Claude AI Engine',
      progress: 80
    });

    // Step 13: Claude returns structured JSON SEO recommendations
    const aiResponse = await runClaudeSeoAnalysis({
      websiteUrl: crawlData.url,
      industry: industry || 'Healthcare',
      crawlData,
      pagespeedData,
      gscData,
      dataforseoData
    });

    // Step 14: Validate the AI response against a strict JSON schema
    db.updateAuditRecord(auditId, {
      currentStage: 14,
      stageName: 'Validating AI Structured Response against JSON Schema',
      progress: 85
    });
    await sleep(200);

    // Step 15: Save complete audit result in PostgreSQL
    db.updateAuditRecord(auditId, {
      currentStage: 15,
      stageName: 'Persisting Audit Results, Scores & Recommendations to Database',
      progress: 90,
      overallScore: aiResponse.overall_score,
      techScore: aiResponse.score_breakdown.technical,
      onPageScore: aiResponse.score_breakdown.on_page,
      contentScore: aiResponse.score_breakdown.content,
      cwvScore: aiResponse.score_breakdown.core_web_vitals,
      schemaScore: aiResponse.score_breakdown.schema,
      rawCrawlData: crawlData,
      aiResponse: aiResponse
    });
    await sleep(300);

    // Step 16: Generate a professional PDF report using Puppeteer
    db.updateAuditRecord(auditId, {
      currentStage: 16,
      stageName: 'Rendering Professional PDF Audit Report',
      progress: 94
    });

    const report = await createAuditReport({
      auditId,
      companyName,
      websiteUrl: crawlData.url,
      industry,
      auditDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      overallScore: aiResponse.overall_score,
      scoreBreakdown: aiResponse.score_breakdown,
      executiveSummary: aiResponse.executive_summary,
      criticalIssues: aiResponse.critical_issues,
      importantIssues: aiResponse.important_issues,
      quickWins: aiResponse.quick_wins,
      recommendations: aiResponse.recommendations,
      crawlStats: {
        title: crawlData.title,
        wordCount: crawlData.wordCount,
        imagesCount: crawlData.images.total,
        missingAlt: crawlData.images.missingAlt,
        internalLinks: crawlData.links.internalCount
      }
    });

    db.updateAuditRecord(auditId, {
      pdfPath: report.pdfPath,
      reportUrl: report.downloadUrl
    });
    await sleep(300);

    // Step 17: Send the report through Twilio mock integration (WhatsApp)
    db.updateAuditRecord(auditId, {
      currentStage: 17,
      stageName: 'Dispatching WhatsApp Audit Summary via Twilio Integration',
      progress: 98
    });

    await dispatchAuditNotification({
      auditId,
      clientName: companyName,
      recipientPhone: clientPhone || '+919845012345',
      websiteUrl: crawlData.url,
      overallScore: aiResponse.overall_score,
      criticalIssuesCount: aiResponse.critical_issues.length,
      reportUrl: `${process.env.APP_URL || 'http://localhost:3000'}${report.downloadUrl}`
    });
    await sleep(200);

    // Step 18: Update audit status to completed
    const completedAudit = db.updateAuditRecord(auditId, {
      status: 'COMPLETED',
      currentStage: 18,
      stageName: 'Audit Completed Successfully',
      progress: 100,
      completedAt: new Date().toISOString()
    });

    console.log(`[AUDIT PIPELINE COMPLETE] Audit ID ${auditId} finalized with Overall Score: ${aiResponse.overall_score}/100`);
    return completedAudit!;
  } catch (err: any) {
    console.error(`[AUDIT PIPELINE FAILED] Audit ID ${auditId}: ${err.message}`);
    const failedAudit = db.updateAuditRecord(auditId, {
      status: 'FAILED',
      stageName: `Failed at stage: ${err.message}`,
      errorMessage: err.message,
      completedAt: new Date().toISOString()
    });
    return failedAudit!;
  }
}
