/**
 * PageSpeed Insights Mock Data
 * Section 7.1: Exact mock values for Core Web Vitals and Lighthouse audits
 */
export const pagespeedMockData = {
  url: "https://example-client-website.com",
  fetchTime: "2026-10-30T00:00:00Z",
  lighthouseResult: {
    categories: {
      performance: { id: "performance", title: "Performance", score: 0.62 },
      accessibility: { id: "accessibility", title: "Accessibility", score: 0.78 },
      bestPractices: { id: "best-practices", title: "Best Practices", score: 0.83 },
      seo: { id: "seo", title: "SEO", score: 0.71 }
    },
    audits: {
      "first-contentful-paint": {
        id: "first-contentful-paint",
        title: "First Contentful Paint",
        displayValue: "2.4 s",
        score: 0.68,
        numericValue: 2400
      },
      "largest-contentful-paint": {
        id: "largest-contentful-paint",
        title: "Largest Contentful Paint",
        displayValue: "4.2 s",
        score: 0.38,
        numericValue: 4200,
        explanation: "Poor LCP due to hero image uncompressed and render-blocking CSS"
      },
      "total-blocking-time": {
        id: "total-blocking-time",
        title: "Total Blocking Time",
        displayValue: "490 ms",
        score: 0.52,
        numericValue: 490
      },
      "cumulative-layout-shift": {
        id: "cumulative-layout-shift",
        title: "Cumulative Layout Shift",
        displayValue: "0.28",
        score: 0.44,
        numericValue: 0.28,
        explanation: "Images missing explicit width/height dimensions and late banner injection"
      },
      "speed-index": {
        id: "speed-index",
        title: "Speed Index",
        displayValue: "3.9 s",
        score: 0.58,
        numericValue: 3900
      },
      "server-response-time": {
        id: "server-response-time",
        title: "Initial Server Response Time (TTFB)",
        displayValue: "1.1 s",
        score: 0.42,
        numericValue: 1100
      },
      "render-blocking-resources": {
        id: "render-blocking-resources",
        title: "Eliminate render-blocking resources",
        score: 0.31,
        details: {
          items: [
            { url: "https://example-client-website.com/assets/vendor.css", wastedMs: 650 },
            { url: "https://example-client-website.com/assets/slider.js", wastedMs: 420 }
          ]
        }
      },
      "modern-image-formats": {
        id: "modern-image-formats",
        title: "Serve images in next-gen formats (WebP/AVIF)",
        score: 0.45,
        details: { wastedKb: 1420 }
      }
    }
  },
  coreWebVitalsSummary: {
    lcp: { value: "4.2s", rating: "POOR", target: "< 2.5s" },
    inp: { value: "240ms", rating: "NEEDS_IMPROVEMENT", target: "< 200ms" },
    cls: { value: "0.28", rating: "POOR", target: "< 0.1" },
    fcp: { value: "2.4s", rating: "NEEDS_IMPROVEMENT", target: "< 1.8s" },
    ttfb: { value: "1.1s", rating: "POOR", target: "< 0.8s" }
  }
};

export async function fetchPageSpeedData(url: string, useMocks = true) {
  if (useMocks || process.env.USE_MOCKS === 'true') {
    return {
      ...pagespeedMockData,
      url,
      fetchTime: new Date().toISOString()
    };
  }

  // Real PageSpeed API implementation if key provided
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("PAGESPEED_API_KEY environment variable is missing for real PageSpeed integration");
  }

  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}`);
  if (!res.ok) {
    throw new Error(`PageSpeed API failed: ${res.statusText}`);
  }
  return await res.json();
}
