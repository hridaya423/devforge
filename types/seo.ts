export type SeoResult = {
    title: string;
    description: string;
    keywords: string[];
    headings: {
      h1: number;
      h2: number;
      h3: number;
    };
    images: {
      total: number;
      withAlt: number;
      withoutAlt: number;
    };
    links: {
      internal: number;
      external: number;
      broken: number;
    };
    issues: Array<{
      type: 'error' | 'warning' | 'success';
      message: string;
      details?: string;
    }>;
    performance: {
      score: number;
      loadTime: string;
      pageSize: string;
      firstContentfulPaint: string;
    };
    metaTags: {
      present: string[];
      missing: string[];
    };
    mobileOptimization: {
      score: number;
      issues: string[];
    };
    textToHtmlRatio: number;
    canonicalUrl?: string;
    robotsMeta?: string;
  };