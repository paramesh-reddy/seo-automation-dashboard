export interface Client {
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

export interface Website {
  id: string;
  url: string;
  clientId: string;
  createdAt: string;
}

export interface AuditRecommendation {
  priority: 'CRITICAL' | 'IMPORTANT' | 'QUICK_WIN' | 'RECOMMENDED';
  category: 'Technical' | 'On-page' | 'Content' | 'Core Web Vitals' | 'Schema';
  finding: string;
  fix: string;
  estimated_impact: 'High' | 'Medium' | 'Low';
  effort: 'Hours' | 'Days' | 'Weeks';
  falsifiability_check: string;
}

export interface ClaudeAuditResponse {
  audit_version: string;
  overall_score: number;
  score_breakdown: {
    technical: number;
    on_page: number;
    content: number;
    core_web_vitals: number;
    schema: number;
  };
  critical_issues: Array<{
    title: string;
    description: string;
    category: string;
    impact: string;
  }>;
  important_issues: Array<{
    title: string;
    description: string;
    category: string;
    impact: string;
  }>;
  quick_wins: Array<{
    title: string;
    action: string;
    estimated_time: string;
    impact: string;
  }>;
  recommendations: AuditRecommendation[];
  executive_summary: string;
}

export interface Audit {
  id: string;
  websiteId: string;
  websiteUrl: string;
  clientId: string;
  companyName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  currentStage: number; // 1 to 18
  stageName: string;
  progress: number;
  overallScore?: number;
  techScore?: number;
  onPageScore?: number;
  contentScore?: number;
  cwvScore?: number;
  schemaScore?: number;
  rawCrawlData?: any;
  aiResponse?: ClaudeAuditResponse;
  errorMessage?: string;
  jobId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  pdfPath?: string;
  reportUrl?: string;
}

export interface QueueStatus {
  isRedisConnected: boolean;
  activeCount: number;
  completedCount: number;
  failedCount: number;
  waitingCount: number;
  mode: 'BULLMQ_REDIS' | 'STANDALONE_ASYNC_RUNNER';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  clientId?: string;
  clientCompanyName?: string;
}
