'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle,
  Github,
  Loader2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface PRMetrics {
  size: {
    score: number;
    filesChanged: number;
    additions: number;
    deletions: number;
  };
  documentation: {
    score: number;
    hasDescription: boolean;
    descriptionLength: number;
    hasTechnicalDetails: boolean;
    hasTestingInstructions: boolean;
  };
  testing: {
    score: number;
    hasTests: boolean;
    testFilesChanged: number;
    testCoverage?: number;
  };
  commits: {
    score: number;
    count: number;
    conventionalCommits: number;
    hasCleanHistory: boolean;
  };
  codeQuality: {
    score: number;
    hasLintErrors: boolean;
    hasTypeErrors: boolean;
    complexityScore: number;
  };
  security: {
    score: number;
    hasSensitiveData: boolean;
    hasVulnerabilities: boolean;
  };
  dependencies: {
    score: number;
    added: string[];
    removed: string[];
    hasLockfileUpdate: boolean;
  };
}

interface PRData {
  metrics: PRMetrics;
  recommendations: string[];
  overallScore: number;
  title: string;
  author: string;
  url: string;
}

const PRAnalyzer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prData, setPrData] = useState<PRData | null>(null);
  const { toast } = useToast();

  const extractPRDetails = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) {
      throw new Error('Invalid GitHub PR URL');
    }
    return {
      owner: match[1],
      repo: match[2],
      pull_number: match[3],
    };
  };

  const analyzePR = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { owner, repo, pull_number } = extractPRDetails(url);

      const response = await fetch('/api/analyze-pr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, repo, pull_number }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze PR');
      }

      const data = await response.json();
      setPrData(data);
      toast({
        title: 'Analysis Complete',
        description: 'PR analysis completed successfully.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze PR';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderScoreChart = () => {
    if (!prData) return null;

    const data = [
      { name: 'Size', score: prData.metrics.size.score },
      { name: 'Docs', score: prData.metrics.documentation.score },
      { name: 'Tests', score: prData.metrics.testing.score },
      { name: 'Commits', score: prData.metrics.commits.score },
      { name: 'Quality', score: prData.metrics.codeQuality.score },
      { name: 'Security', score: prData.metrics.security.score },
      { name: 'Dependencies', score: prData.metrics.dependencies.score },
    ];

    return (
      <div className="h-64 mt-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis domain={[0, 100]} stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#E5E7EB'
              }}
            />
            <Bar dataKey="score" fill="url(#colorGradient)" />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderMetrics = () => {
    if (!prData) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Size Metrics</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Files Changed:</span>
                <span>{prData.metrics.size.filesChanged}</span>
              </div>
              <div className="flex justify-between">
                <span>Additions:</span>
                <span className="text-green-400">+{prData.metrics.size.additions}</span>
              </div>
              <div className="flex justify-between">
                <span>Deletions:</span>
                <span className="text-red-400">-{prData.metrics.size.deletions}</span>
              </div>
              <Progress 
                value={prData.metrics.size.score} 
                className="mt-4 bg-gray-800 bg-gradient-to-r from-orange-400 to-pink-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Code Quality</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Lint Status:</span>
                <span>{prData.metrics.codeQuality.hasLintErrors ? '⚠️' : '✅'}</span>
              </div>
              <div className="flex justify-between">
                <span>Type Safety:</span>
                <span>{prData.metrics.codeQuality.hasTypeErrors ? '⚠️' : '✅'}</span>
              </div>
              <div className="flex justify-between">
                <span>Complexity Score:</span>
                <span>{prData.metrics.codeQuality.complexityScore}/10</span>
              </div>
              <Progress 
                value={prData.metrics.codeQuality.score} 
                className=" mt-4 bg-gray-800bg-gradient-to-r from-orange-400 to-pink-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Testing</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Has Tests:</span>
                <span>{prData.metrics.testing.hasTests ? '✅' : '⚠️'}</span>
              </div>
              <div className="flex justify-between">
                <span>Test Files:</span>
                <span>{prData.metrics.testing.testFilesChanged}</span>
              </div>
              {prData.metrics.testing.testCoverage && (
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span>{prData.metrics.testing.testCoverage}%</span>
                </div>
              )}
              <Progress 
                value={prData.metrics.testing.score}
                className="mt-4 bg-gray-800 bg-gradient-to-r from-orange-400 to-pink-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
      <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">PR Quality Scorer</CardTitle>
            <CardDescription className="text-gray-400">
              Analyze GitHub pull requests and get quality metrics and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="bg-gray-900/40 border-gray-800/50 text-gray-300 
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
              <Button
                onClick={analyzePR}
                disabled={isLoading || !url}
                className="bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                         hover:from-orange-500 hover:to-pink-600 transition-all duration-300 
                         shadow-lg shadow-orange-500/20 gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4" />
                    Analyze PR
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-500/10 border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {prData && (
              <>
                <div className="mt-8 flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-2xl font-bold text-white">Overall Score:</h2>
                      <span className={`text-3xl font-bold ${getScoreColor(prData.overallScore)}`}>
                        {prData.overallScore}%
                      </span>
                    </div>
                    <p className="text-gray-400 mt-1">
                      {prData.title} by {prData.author}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    asChild
                    className="border-gray-800 text-gray-300 hover:bg-gray-800"
                  >
                    <a
                      href={prData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      View PR
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {renderScoreChart()}
                {renderMetrics()}

                {prData.recommendations.length > 0 && (
                  <Alert className="mt-8 bg-orange-400/10 border-orange-500/20">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-300">
                      <strong className="font-medium">Recommendations:</strong>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {prData.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PRAnalyzer;