/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, CheckCircle, Loader, Download, X, Globe } from 'lucide-react';
import Link from 'next/link';
import type { ScanResults } from '@/types/scan';
import { saveAs } from 'file-saver';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 10;

const DeadLinkDetector = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const abortController = useRef<AbortController | null>(null);

  const handleScan = async () => {
    if (!url) {
      setError('Please enter a valid URL');
      return;
    }
    setIsScanning(true);
    setError(null);
    setResults(null);
    setCurrentPage(1);
    
    abortController.current = new AbortController();
    
    try {
      const response = await fetch('/api/scan-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: abortController.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scan website');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Scan cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsScanning(false);
      abortController.current = null;
    }
  };

  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const exportResults = useCallback(() => {
    if (!results) return;
    
    const exportData = {
      scanDate: new Date().toISOString(),
      url,
      results
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    saveAs(blob, `scan-results-${new Date().toISOString()}.json`);
  }, [results, url]);

  const getPaginatedItems = (items: any[]) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-400/20 to-pink-500/20">
                  <Globe className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white">Dead Link Detector</CardTitle>
                  <CardDescription className="text-gray-400">
                    Scan your website for broken links and images
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-orange-500/50 focus:border-orange-500/50"
                  disabled={isScanning}
                />
                {isScanning ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 
                             hover:text-white rounded-lg transition-all duration-200 
                             flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleScan}
                    disabled={!url}
                    className="px-6 py-2 bg-gradient-to-r from-orange-400 to-pink-500 
                             text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                             disabled:from-gray-600 disabled:to-gray-600"
                  >
                    Start Scan
                  </motion.button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Error</AlertTitle>
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-orange-400 mb-4" />
                  <p className="text-gray-300">Scanning website for broken links...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take a few minutes depending on the size of your website
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {results && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Scan Results</CardTitle>
                <CardDescription className="text-gray-400">
                  Found {results.brokenLinks.length} broken links and {results.brokenImages.length} broken images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.brokenLinks.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Broken Links</h3>
                    <div className="space-y-4">
                      {getPaginatedItems(results.brokenLinks).map((link, index) => (
                        <div key={index} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-red-400">{link.url}</p>
                              <p className="text-sm text-red-300">Found on: {link.foundOn}</p>
                            </div>
                            <span className="px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded-full">
                              {link.statusCode}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.brokenImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Broken Images</h3>
                    <div className="space-y-4">
                      {getPaginatedItems(results.brokenImages).map((image, index) => (
                        <div key={index} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-red-400">{image.src}</p>
                              <p className="text-sm text-red-300">Found on: {image.foundOn}</p>
                            </div>
                            <span className="px-2 py-1 text-sm bg-red-500/20 text-red-400 rounded-full">
                              {image.statusCode}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.brokenLinks.length === 0 && results.brokenImages.length === 0 && (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-green-400">All Links are Valid!</h3>
                      <p className="text-green-300 mt-2">
                        No broken links or images were found on your website.
                      </p>
                    </div>
                  </div>
                )}

                {(results.brokenLinks.length > 0 || results.brokenImages.length > 0) && (
                  <div className="flex justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={exportResults}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r 
                               from-orange-400/10 to-pink-500/10 hover:from-orange-400 
                               hover:to-pink-500 rounded-lg text-white text-sm font-medium 
                               transition-all duration-300"
                    >
                      <Download className="w-4 h-4" />
                      Export Results
                    </motion.button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
              <CardHeader>
                <CardTitle className="text-white">Scan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Total Pages Scanned</p>
                    <p className="text-2xl font-semibold text-white">{results.totalPages}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Total Links Checked</p>
                    <p className="text-2xl font-semibold text-white">{results.totalLinks}</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">Scan Duration</p>
                    <p className="text-2xl font-semibold text-white">{results.scanDuration}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DeadLinkDetector;