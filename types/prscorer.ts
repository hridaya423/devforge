export interface PRMetrics {
    size: {
      filesChanged: number;
      additions: number;
      deletions: number;
      score: number;
    };
    documentation: {
      hasDescription: boolean;
      descriptionLength: number;
      hasTechnicalDetails: boolean;
      hasTestingInstructions: boolean;
      score: number;
    };
    testing: {
      hasTests: boolean;
      testFilesChanged: number;
      testCoverage?: number;
      score: number;
    };
    commits: {
      count: number;
      conventionalCommits: number;
      hasCleanHistory: boolean;
      score: number;
    };
    codeQuality: {
      hasLintErrors: boolean;
      hasTypeErrors: boolean;
      complexityScore: number;
      score: number;
    };
    security: {
      hasSensitiveData: boolean;
      hasVulnerabilities: boolean;
      score: number;
    };
    dependencies: {
      added: string[];
      removed: string[];
      hasLockfileUpdate: boolean;
      score: number;
    };
  }
  
  export interface PRAnalysis {
    url: string;
    title: string;
    author: string;
    createdAt: string;
    metrics: PRMetrics;
    overallScore: number;
    recommendations: string[];
  }
  
  export interface PRScorerSettings {
    weights: {
      size: number;
      documentation: number;
      testing: number;
      commits: number;
      codeQuality: number;
      security: number;
      dependencies: number;
    };
    thresholds: {
      size: {
        small: number;
        medium: number;
        large: number;
      };
      documentation: {
        minDescriptionLength: number;
      };
      testing: {
        minCoverage: number;
      };
    };
  }