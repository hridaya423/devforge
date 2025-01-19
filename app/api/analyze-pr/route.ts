/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const PATTERNS = {
  complexity: {
    nestedLoops: /for.*for|while.*while|do.*while.*for|for.*while/g,
    nestedConditions: /if.*if|if.*\?.*\?/g,
    longFunctions: /function.*\{[\s\S]{300,}\}/g,
  },
  security: {
    secrets: /(password|secret|key|token|auth).*['"]=.*['"][^\s]/gi,
    privateKeys: /-----BEGIN.*PRIVATE KEY-----/g,
    tokens: /[a-f0-9]{32,}/g,
  },
  quality: {
    console: /console\.(log|debug|info)/g,
    debugger: /debugger;/g,
    todoComments: /\/\/.*TODO|\/\*.*TODO/g,
  },
  testing: {
    testFiles: /\.(test|spec)\.(js|jsx|ts|tsx)$/,
    testFunctions: /(describe|it|test)\(/g,
    assertions: /(expect|assert)\(/g,
  },
  dependencies: {
    packageJson: /package\.json$/,
    lockFiles: /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$/,
    dependencyLines: /"dependencies":|"devDependencies":/g,
  },
};

function analyzeSize(files: any[]) {
  const totalChanges = files.reduce(
    (acc, file) => ({
      additions: acc.additions + file.additions,
      deletions: acc.deletions + file.deletions,
    }),
    { additions: 0, deletions: 0 }
  );
  let score = 100;
  const totalLines = totalChanges.additions + totalChanges.deletions;

  if (totalLines > 1000) score -= 40;
  else if (totalLines > 500) score -= 20;
  else if (totalLines > 200) score -= 10;

  if (files.length > 20) score -= 20;
  else if (files.length > 10) score -= 10;

  return {
    score: Math.max(0, score),
    filesChanged: files.length,
    additions: totalChanges.additions,
    deletions: totalChanges.deletions,
  };
}

function analyzeDocumentation(description: string) {
  let score = 0;
  const hasDescription = description.length > 0;
  const descriptionLength = description.length;
  const hasTechnicalDetails = /technical|implementation|approach/i.test(description);
  const hasTestingInstructions = /test|verify|check/i.test(description);

  if (hasDescription) score += 40;
  if (descriptionLength > 100) score += 20;
  if (hasTechnicalDetails) score += 20;
  if (hasTestingInstructions) score += 20;

  return {
    score,
    hasDescription,
    descriptionLength,
    hasTechnicalDetails,
    hasTestingInstructions,
  };
}

function analyzeCodeQuality(files: any[]) {
  let totalComplexity = 0;
  let hasLintErrors = false;
  let hasTypeErrors = false;

  files.forEach(file => {
    if (!file.patch) return;
    const nestedLoops = (file.patch.match(PATTERNS.complexity.nestedLoops) || []).length;
    const nestedConditions = (file.patch.match(PATTERNS.complexity.nestedConditions) || []).length;
    const longFunctions = (file.patch.match(PATTERNS.complexity.longFunctions) || []).length;

    totalComplexity += nestedLoops * 2 + nestedConditions + longFunctions * 3;
    const consoleStatements = (file.patch.match(PATTERNS.quality.console) || []).length;
    const debuggerStatements = (file.patch.match(PATTERNS.quality.debugger) || []).length;
    const todos = (file.patch.match(PATTERNS.quality.todoComments) || []).length;

    hasLintErrors = hasLintErrors || consoleStatements > 0 || debuggerStatements > 0;
    hasTypeErrors = hasTypeErrors || /type.*error|typescript/i.test(file.patch);
  });

  const complexityScore = Math.max(0, 10 - Math.min(totalComplexity, 10));
  const score = Math.max(0, 100 - (totalComplexity * 5) - (hasLintErrors ? 20 : 0) - (hasTypeErrors ? 20 : 0));

  return {
    score,
    hasLintErrors,
    hasTypeErrors,
    complexityScore,
  };
}

function analyzeTests(files: any[]) {
  const testFiles = files.filter(file => PATTERNS.testing.testFiles.test(file.filename));
  const hasTests = testFiles.length > 0;

  let testCoverage;
  let testScore = 0;

  if (hasTests) {
    testScore += 50;
    let totalTests = 0;
    let totalAssertions = 0;

    testFiles.forEach(file => {
      if (!file.patch) return;
      const tests = (file.patch.match(PATTERNS.testing.testFunctions) || []).length;
      const assertions = (file.patch.match(PATTERNS.testing.assertions) || []).length;
      totalTests += tests;
      totalAssertions += assertions;
    });

    if (totalTests > 0) testScore += 25;
    if (totalAssertions > totalTests) testScore += 25;
    testCoverage = Math.min(100, Math.round((totalTests * 10 + totalAssertions * 5) / files.length));
  }

  return {
    score: testScore,
    hasTests,
    testFilesChanged: testFiles.length,
    testCoverage,
  };
}

function analyzeSecurity(files: any[]) {
  let hasSensitiveData = false;
  let hasVulnerabilities = false;
  let securityScore = 100;

  files.forEach(file => {
    if (!file.patch) return;
    const hasSecrets = PATTERNS.security.secrets.test(file.patch);
    const hasPrivateKeys = PATTERNS.security.privateKeys.test(file.patch);
    const hasTokens = PATTERNS.security.tokens.test(file.patch);

    if (hasSecrets || hasPrivateKeys || hasTokens) {
      hasSensitiveData = true;
      securityScore -= 50;
    }
    if (/eval\(|exec\(|innerHTML|dangerouslySetInnerHTML/.test(file.patch)) {
      hasVulnerabilities = true;
      securityScore -= 30;
    }
  });

  return {
    score: Math.max(0, securityScore),
    hasSensitiveData,
    hasVulnerabilities,
  };
}

function analyzeCommits(commits: any[]) {
  const count = commits.length;
  let conventionalCommits = 0;
  const hasCleanHistory = count <= 3;
  commits.forEach(commit => {
    if (/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\(.+\))?: .+/.test(commit.commit.message)) {
      conventionalCommits++;
    }
  });

  let score = 100;
  if (count > 10) score -= 40;
  else if (count > 5) score -= 20;
  
  const conventionalRatio = conventionalCommits / count;
  if (conventionalRatio < 0.5) score -= 20;

  if (!hasCleanHistory) score -= 20;

  return {
    score: Math.max(0, score),
    count,
    conventionalCommits,
    hasCleanHistory,
  };
}

function analyzeDependencies(files: any[]) {
  const packageFiles = files.filter(f => PATTERNS.dependencies.packageJson.test(f.filename));
  const lockFiles = files.filter(f => PATTERNS.dependencies.lockFiles.test(f.filename));
  
  const added: string[] = [];
  const removed: string[] = [];
  const hasLockfileUpdate = lockFiles.length > 0;
  packageFiles.forEach(file => {
    if (!file.patch) return;
    
    const addedDeps = file.patch
      .split('\n')
      .filter((line: string) => line.startsWith('+') && /"[\w-]+": "/.test(line))
      .map((line: string) => line.match(/"([\w-]+)":/)?.[1])
      .filter(Boolean);

    const removedDeps = file.patch
      .split('\n')
      .filter((line: string) => line.startsWith('-') && /"[\w-]+": "/.test(line))
      .map((line: string) => line.match(/"([\w-]+)":/)?.[1])
      .filter(Boolean);

    added.push(...addedDeps);
    removed.push(...removedDeps);
  });

  let score = 100;
  if (added.length > 5) score -= 20;
  if (!hasLockfileUpdate && (added.length > 0 || removed.length > 0)) score -= 30;

  return {
    score: Math.max(0, score),
    added,
    removed,
    hasLockfileUpdate,
  };
}

function calculateOverallScore(metrics: any) {
  const weights = {
    size: 0.2,
    documentation: 0.15,
    testing: 0.15,
    commits: 0.1,
    codeQuality: 0.15,
    security: 0.15,
    dependencies: 0.1,
  };

  return Math.round(
    metrics.size.score * weights.size +
    metrics.documentation.score * weights.documentation +
    metrics.testing.score * weights.testing +
    metrics.commits.score * weights.commits +
    metrics.codeQuality.score * weights.codeQuality +
    metrics.security.score * weights.security +
    metrics.dependencies.score * weights.dependencies
  );
}

function generateRecommendations(metrics: any) {
  const recommendations: string[] = [];

  if (metrics.size.score < 60) {
    recommendations.push(
      'Consider breaking this PR into smaller, more focused changes'
    );
  }

  if (metrics.documentation.score < 80) {
    recommendations.push(
      'Add more detailed description and testing instructions'
    );
  }

  if (metrics.testing.score < 60) {
    recommendations.push(
      'Add or update tests to cover the changes'
    );
  }

  if (metrics.commits.score < 70) {
    recommendations.push(
      'Consider squashing commits and using conventional commit messages'
    );
  }

  if (metrics.codeQuality.score < 70) {
    recommendations.push(
      'Address code complexity and quality issues'
    );
  }

  if (metrics.security.score < 100) {
    recommendations.push(
      'Review and address potential security concerns'
    );
  }

  if (!metrics.dependencies.hasLockfileUpdate && metrics.dependencies.added.length > 0) {
    recommendations.push(
      'Update lockfile for dependency changes'
    );
  }

  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, pull_number } = await request.json();
    const [prData, filesData, commitsData] = await Promise.all([
      octokit.pulls.get({
        owner,
        repo,
        pull_number: Number(pull_number),
      }),
      octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: Number(pull_number),
      }),
      octokit.pulls.listCommits({
        owner,
        repo,
        pull_number: Number(pull_number),
      }),
    ]);
    const metrics = {
      size: analyzeSize(filesData.data),
      documentation: analyzeDocumentation(prData.data.body || ''),
      testing: analyzeTests(filesData.data),
      commits: analyzeCommits(commitsData.data),
      codeQuality: analyzeCodeQuality(filesData.data),
      security: analyzeSecurity(filesData.data),
      dependencies: analyzeDependencies(filesData.data),
    };

    const overallScore = calculateOverallScore(metrics);
    const recommendations = generateRecommendations(metrics);

    return NextResponse.json({
      metrics,
      overallScore,
      recommendations,
      title: prData.data.title,
      author: prData.data.user.login,
      url: prData.data.html_url,
    });
  } catch (error) {
    console.error('PR analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze PR' },
      { status: 500 }
    );
  }
}