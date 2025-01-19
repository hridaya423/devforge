'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Chrome, Globe, Smartphone, Laptop, CheckCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import type { TestResponse } from '@/types/browser';

type TestResult = {
  browser: string;
  version: string;
  platform: string;
  status: 'success' | 'error' | 'warning';
  screenshot: string;
  issues?: string[];
};

type Browser = {
  name: string;
  versions: string[];
  icon: React.ElementType;
};

const BrowserTester = () => {
  const [url, setUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>(['Chrome']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Desktop']);

  const browsers: Browser[] = [
    { name: 'Chrome', versions: ['119', '118', '117'], icon: Chrome },
    { name: 'Firefox', versions: ['120', '119', '118'], icon: Globe },
    { name: 'Safari', versions: ['17', '16', '15'], icon: Globe },
    { name: 'Edge', versions: ['119', '118', '117'], icon: Globe }
  ];

  const platforms = [
    { name: 'Desktop', icon: Laptop },
    { name: 'Mobile', icon: Smartphone }
  ];

  const handleTest = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
  
    if (selectedBrowsers.length === 0 || selectedPlatforms.length === 0) {
      setError('Please select at least one browser and platform');
      return;
    }
  
    setIsTesting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-browsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          browsers: selectedBrowsers,
          platforms: selectedPlatforms
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to run browser tests');
      }
  
      const data: TestResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsTesting(false);
    }
  };

  const toggleBrowser = (browser: string) => {
    setSelectedBrowsers(prev => 
      prev.includes(browser)
        ? prev.filter(b => b !== browser)
        : [...prev, browser]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
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
            <CardTitle className="text-2xl text-white">Cross Browser Tester</CardTitle>
            <CardDescription className="text-gray-400">
              Test your website across different browsers and platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Select Browsers</h3>
                <div className="flex flex-wrap gap-4">
                  {browsers.map((browser) => {
                    const BrowserIcon = browser.icon;
                    return (
                      <button
                        key={browser.name}
                        onClick={() => toggleBrowser(browser.name)}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                          selectedBrowsers.includes(browser.name)
                            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent'
                            : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-orange-500/50'
                        }`}
                      >
                        <BrowserIcon className="w-4 h-4 mr-2" />
                        {browser.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Select Platforms</h3>
                <div className="flex flex-wrap gap-4">
                  {platforms.map((platform) => {
                    const PlatformIcon = platform.icon;
                    return (
                      <button
                        key={platform.name}
                        onClick={() => togglePlatform(platform.name)}
                        className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-300 ${
                          selectedPlatforms.includes(platform.name)
                            ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent'
                            : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:border-orange-500/50'
                        }`}
                      >
                        <PlatformIcon className="w-4 h-4 mr-2" />
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleTest}
                disabled={isTesting || selectedBrowsers.length === 0 || selectedPlatforms.length === 0}
                className="w-full px-6 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-pink-500 text-white 
                         hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300
                         disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </div>
                ) : (
                  'Start Testing'
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-red-400">Error</AlertTitle>
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result, index) => (
              <Card key={index} className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {browsers.find(b => b.name === result.browser)?.icon && 
                        React.createElement(browsers.find(b => b.name === result.browser)?.icon as React.ElementType, {
                          className: "w-5 h-5 text-orange-400"
                        })
                      }
                      <CardTitle className="text-white">{result.browser} {result.version}</CardTitle>
                    </div>
                    <span className="text-sm text-gray-400">{result.platform}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-gray-800/50 rounded-lg overflow-hidden">
                      <img 
                        src={result.screenshot}
                        alt={`${result.browser} screenshot`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center">
                      {result.status === 'success' ? (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span>Pass</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-yellow-400">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          <span>Issues Found</span>
                        </div>
                      )}
                    </div>
                    {result.issues && result.issues.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2 text-white">Issues Found:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-400">
                          {result.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowserTester;