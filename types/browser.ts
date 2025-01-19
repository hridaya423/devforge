export type BrowserInfo = {
    name: string;
    versions: string[];
    icon: React.ElementType;
  };
  
  export type TestResult = {
    browser: string;
    version: string;
    platform: string;
    status: 'success' | 'error' | 'warning';
    screenshot: string;
    issues?: string[];
    viewport: {
      width: number;
      height: number;
    };
    performance: {
      loadTime: number;
      score: number;
    };
  };
  
  export type TestSummary = {
    totalTests: number;
    passed: number;
    warnings: number;
    errors: number;
    responsiveScore: number;
  };
  
  export type TestResponse = {
    results: TestResult[];
    summary: TestSummary;
  };