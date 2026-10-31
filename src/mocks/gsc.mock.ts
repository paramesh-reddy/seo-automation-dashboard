/**
 * Google Search Console (GSC) Mock Data
 * Section 7.2: Exact mock values for search performance, queries, and indexation
 */
export const gscMockData = {
  domain: "example-client-website.com",
  dateRange: "Last 28 Days",
  summary: {
    totalClicks: 1840,
    totalImpressions: 56200,
    averageCtr: "3.27%",
    averagePosition: 19.4
  },
  topQueries: [
    { query: "best dentist near me", clicks: 340, impressions: 4200, ctr: "8.1%", position: 4.2 },
    { query: "emergency root canal cost", clicks: 210, impressions: 3800, ctr: "5.5%", position: 7.1 },
    { query: "teeth whitening clinic in indiranagar", clicks: 185, impressions: 2900, ctr: "6.4%", position: 3.8 },
    { query: "invisible braces price list", clicks: 140, impressions: 5100, ctr: "2.7%", position: 14.2 },
    { query: "dental implant surgery specialist", clicks: 115, impressions: 6400, ctr: "1.8%", position: 18.9 },
    { query: "pediatric dental checkup clinic", clicks: 95, impressions: 3100, ctr: "3.1%", position: 12.5 }
  ],
  topPages: [
    { page: "/", clicks: 820, impressions: 22100, ctr: "3.71%", position: 11.2 },
    { page: "/services/dental-implants", clicks: 390, impressions: 14200, ctr: "2.75%", position: 16.4 },
    { page: "/cosmetic-dentistry", clicks: 270, impressions: 8900, ctr: "3.03%", position: 14.8 },
    { page: "/contact", clicks: 190, impressions: 4100, ctr: "4.63%", position: 8.5 }
  ],
  crawlIssues: [
    { type: "Indexed, though blocked by robots.txt", count: 3, severity: "warning" },
    { type: "Page with redirect (301)", count: 14, severity: "info" },
    { type: "Not found (404)", count: 5, severity: "error" },
    { type: "Duplicate without user-selected canonical", count: 8, severity: "warning" }
  ],
  sitemapsSubmitted: [
    { url: "https://example-client-website.com/sitemap.xml", status: "Success", lastRead: "2026-10-28", discoveredUrls: 48 }
  ]
};

export async function fetchGSCData(domain: string, useMocks = true) {
  if (useMocks || process.env.USE_MOCKS === 'true') {
    return {
      ...gscMockData,
      domain
    };
  }

  // Real GSC OAuth implementation if configured
  const accessToken = process.env.GOOGLE_SEARCH_CONSOLE_TOKEN;
  if (!accessToken) {
    throw new Error("GOOGLE_SEARCH_CONSOLE_TOKEN is missing for real GSC integration");
  }

  const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(domain)}/searchAnalytics/query`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error(`Google Search Console API failed: ${res.statusText}`);
  }
  return await res.json();
}
