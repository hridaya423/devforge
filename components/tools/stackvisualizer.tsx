'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import Link from 'next/link';

interface Technology {
  name: string;
  category: string;
  confidence: number;
  icon?: string;
}

interface ScanResults {
  technologies: Technology[];
  headers: Record<string, string>;
  meta: {
    totalTechnologies: number;
    scanDuration: string;
  };
}

const TechStackVisualizer = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }

    setIsScanning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scan-tech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan website');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const categoryColors: Record<string, string> = {
    'Frontend': 'bg-blue-400/10 text-blue-400',
    'Backend': 'bg-green-400/10 text-green-400',
    'Analytics': 'bg-purple-400/10 text-purple-400',
    'Hosting': 'bg-orange-400/10 text-orange-400',
    'CMS': 'bg-yellow-400/10 text-yellow-400',
    'Security': 'bg-red-400/10 text-red-400'
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Tech Stack Visualizer</CardTitle>
            <CardDescription className="text-gray-400">
              Discover the technologies powering any website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                         focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 focus:outline-none"
              />
              <button
                onClick={handleScan}
                disabled={isScanning}
                className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg 
                         hover:from-orange-500 hover:to-pink-600 transition-all duration-300 
                         shadow-lg shadow-orange-500/20 disabled:from-gray-600 disabled:to-gray-600"
              >
                {isScanning ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </div>
                ) : (
                  'Analyze Stack'
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isScanning && (
          <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-orange-400 mb-4" />
                <p className="text-gray-300">Analyzing website technologies...</p>
                <p className="text-sm text-gray-500 mt-2">This should only take a few seconds</p>
              </div>
            </CardContent>
          </Card>
        )}

        {results && !isScanning && (
          <div className="space-y-6">
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Technology Stack</CardTitle>
                <CardDescription className="text-gray-400">
                  Found {results.meta.totalTechnologies} technologies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-lg 
                               hover:border-orange-500/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-white">{tech.name}</h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${categoryColors[tech.category] || 'bg-gray-800 text-gray-300'}`}>
                            {tech.category}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {tech.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">HTTP Headers</CardTitle>
                <CardDescription className="text-gray-400">
                  Server response headers that may indicate technologies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(results.headers).map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-800/50 py-2">
                      <span className="font-medium text-orange-400 min-w-[200px]">{key}:</span>
                      <span className="text-gray-300">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Scan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/60 rounded-lg border border-gray-800/50 
                                hover:border-orange-500/50 transition-all duration-300">
                    <p className="text-sm text-gray-400">Total Technologies</p>
                    <p className="text-2xl font-semibold text-white">{results.meta.totalTechnologies}</p>
                  </div>
                  <div className="p-4 bg-gray-900/60 rounded-lg border border-gray-800/50 
                                hover:border-orange-500/50 transition-all duration-300">
                    <p className="text-sm text-gray-400">Scan Duration</p>
                    <p className="text-2xl font-semibold text-white">{results.meta.scanDuration}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechStackVisualizer;