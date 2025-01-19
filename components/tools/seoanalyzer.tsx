'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader, AlertCircle, Search, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

type SeoResult = {
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
  };
  metaTags: {
    present: string[];
    missing: string[];
  };
  mobileOptimization: {
    score: number;
    issues: string[];
  };
};

const SeoAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
  
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to analyze website');
      }
  
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIssueIcon = (type: 'error' | 'warning' | 'success') => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              SEO Analyzer
            </CardTitle>
            <CardDescription className="text-gray-400">
              Analyze your website&apos;s SEO performance and get recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg 
                         text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 
                         focus:ring-orange-500/50 focus:border-orange-500/50"
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg 
                         hover:opacity-90 disabled:opacity-50 transition-all duration-200"
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    Analyze
                  </div>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isAnalyzing && (
          <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-orange-400 mb-4" />
                <p className="text-gray-300">Analyzing website SEO factors...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {results && !isAnalyzing && (
          <div className="grid gap-6">
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Overall Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(results.performance.score)}`}>
                      {results.performance.score}/100
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Load Time</div>
                    <div className="text-3xl font-bold text-white">{results.performance.loadTime}</div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400 mb-1">Page Size</div>
                    <div className="text-3xl font-bold text-white">{results.performance.pageSize}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Meta Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-semibold text-gray-300 mb-1">Title</div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white">
                      {results.title}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-300 mb-1">Description</div>
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-white">
                      {results.description}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-300 mb-1">Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gradient-to-r from-orange-400/10 to-pink-500/10 
                                   border border-orange-500/20 text-orange-400 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Content Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-4">Heading Structure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>H1 Tags</span>
                        <span>{results.headings.h1}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>H2 Tags</span>
                        <span>{results.headings.h2}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>H3 Tags</span>
                        <span>{results.headings.h3}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-4">Links Analysis</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>Internal Links</span>
                        <span>{results.links.internal}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>External Links</span>
                        <span>{results.links.external}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded border border-gray-700 text-white">
                        <span>Broken Links</span>
                        <span className="text-red-400">{results.links.broken}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Issues & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      {getIssueIcon(issue.type)}
                      <div>
                        <div className="font-semibold text-white">{issue.message}</div>
                        {issue.details && (
                          <div className="text-sm text-gray-400 mt-1">{issue.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Mobile Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${getScoreColor(results.mobileOptimization.score)}`}>
                      {results.mobileOptimization.score}
                    </div>
                    <div className="text-gray-400">Mobile Score</div>
                  </div>
                  {results.mobileOptimization.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-300 mb-2">Issues to Address:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-400">
                        {results.mobileOptimization.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeoAnalyzer;