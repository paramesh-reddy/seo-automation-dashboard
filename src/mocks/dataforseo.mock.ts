/**
 * DataForSEO Mock Data
 * Section 7.3: Organic rankings, keyword competitor positions, and SERP features
 */
export const dataforseoMockData = {
  domain: "example-client-website.com",
  location: "India",
  language: "en",
  metrics: {
    domainRank: 34,
    organicTrafficEstimate: 3420,
    organicKeywordsTotal: 182,
    top3Keywords: 12,
    top10Keywords: 38,
    top100Keywords: 182
  },
  keywordRankings: [
    {
      keyword: "best dental clinic indiranagar",
      currentRank: 3,
      previousRank: 5,
      searchVolume: 1900,
      cpc: 1.45,
      competition: "MEDIUM",
      serpFeatures: ["local_pack", "reviews", "people_also_ask"],
      url: "https://example-client-website.com/indiranagar-branch"
    },
    {
      keyword: "root canal treatment cost bangalore",
      currentRank: 7,
      previousRank: 6,
      searchVolume: 3600,
      cpc: 2.10,
      competition: "HIGH",
      serpFeatures: ["featured_snippet", "people_also_ask"],
      url: "https://example-client-website.com/treatments/root-canal"
    },
    {
      keyword: "invisible aligners dental hospital",
      currentRank: 12,
      previousRank: 18,
      searchVolume: 2400,
      cpc: 3.50,
      competition: "HIGH",
      serpFeatures: ["local_pack", "site_links"],
      url: "https://example-client-website.com/orthodontics"
    },
    {
      keyword: "laser teeth whitening dentist near me",
      currentRank: 4,
      previousRank: 4,
      searchVolume: 1200,
      cpc: 1.80,
      competition: "LOW",
      serpFeatures: ["local_pack", "image_pack"],
      url: "https://example-client-website.com/cosmetic"
    },
    {
      keyword: "pediatric dental doctor bangalore east",
      currentRank: 9,
      previousRank: 14,
      searchVolume: 880,
      cpc: 1.25,
      competition: "LOW",
      serpFeatures: ["local_pack"],
      url: "https://example-client-website.com/pediatric"
    }
  ],
  competitors: [
    { domain: "smiledentalclinics.in", commonKeywords: 84, searchTraffic: 8900, rank: 48 },
    { domain: "bangaloredentalcare.com", commonKeywords: 62, searchTraffic: 5200, rank: 39 },
    { domain: "apexoralhealth.org", commonKeywords: 51, searchTraffic: 4100, rank: 35 }
  ],
  searchIntent: {
    informational: "42%",
    commercial: "28%",
    transactional: "22%",
    navigational: "8%"
  }
};

export async function fetchDataForSeoData(domain: string, useMocks = true) {
  if (useMocks || process.env.USE_MOCKS === 'true') {
    return {
      ...dataforseoMockData,
      domain
    };
  }

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new Error("DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD missing for real DataForSEO integration");
  }

  const credentials = Buffer.from(`${login}:${password}`).toString("base64");
  const res = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/advanced", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([{ target: domain, location_name: "India", language_name: "English" }])
  });

  if (!res.ok) {
    throw new Error(`DataForSEO API failed: ${res.statusText}`);
  }
  return await res.json();
}
