export interface Project {
  id: string; userId: string; name: string; websiteUrl: string;
  description: string | null; status: string; engine: string;
  schedule: string | null; createdAt: Date; updatedAt: Date;
  _count?: { scrapeJobs: number; generatedApis: number };
}

export interface ScrapeJob {
  id: string; projectId: string; engine: string; pagesScraped: number;
  status: string; errorMessage: string | null;
  startedAt: Date | null; finishedAt: Date | null; createdAt: Date;
}

export interface Dataset {
  id: string; projectId: string; jsonData: unknown; markdownData: string | null;
  schemaData: unknown; pageCount: number; sizeBytes: number;
  createdAt: Date; updatedAt: Date;
}

export interface GeneratedAPI {
  id: string; projectId: string; endpoint: string; method: string;
  description: string | null; hitCount: number; createdAt: Date;
}

export interface APIKey {
  id: string; userId: string; name: string; key: string;
  usageCount: number; usageLimit: number; lastUsedAt: Date | null;
  isActive: boolean; createdAt: Date;
}
