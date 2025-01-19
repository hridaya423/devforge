'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, AlertCircle, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import debounce from 'lodash/debounce';
interface Match {
  text: string;
  index: number;
  groups?: { [key: string]: string };
}

const COMMON_PATTERNS = {
  email: String.raw`\b[\w\.-]+@[\w\.-]+\.\w+\b`,
  phone: String.raw`\b\d{3}[-.]?\d{3}[-.]?\d{4}\b`,
  url: String.raw`https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)`,
  date: String.raw`\b\d{4}-\d{2}-\d{2}\b`,
};

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const debouncedTestRegex = useMemo(
    () =>
      debounce(() => {
        setError(null);
        setMatches([]);

        if (!pattern) return;

        try {
          const regex = new RegExp(pattern, flags);
          const results: Match[] = [];
          let match;

          if (flags.includes('g')) {
            while ((match = regex.exec(testString)) !== null) {
              results.push({
                text: match[0],
                index: match.index,
                groups: match.groups
              });
            }
          } else {
            match = regex.exec(testString);
            if (match) {
              results.push({
                text: match[0],
                index: match.index,
                groups: match.groups
              });
            }
          }

          setMatches(results);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Invalid regular expression');
        }
      }, 300),
    [pattern, flags, testString]
  );

  React.useEffect(() => {
    return () => {
      debouncedTestRegex.cancel();
    };
  }, [debouncedTestRegex]);

  React.useEffect(() => {
    debouncedTestRegex();
  }, [pattern, flags, testString, debouncedTestRegex]);
  const handleCopyPattern = async () => {
    try {
      await navigator.clipboard.writeText(pattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy pattern:', err);
    }
  };

  const handlePatternSelect = (patternKey: keyof typeof COMMON_PATTERNS) => {
    setPattern(COMMON_PATTERNS[patternKey]);
  };
  const highlightMatches = useCallback(() => {
    if (!pattern || !testString) return testString;
    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : 'g' + flags);
      return testString.replace(
        regex,
        (match) => `<mark class="bg-orange-400/20 text-orange-400 px-1 rounded">${match}</mark>`
      );
    } catch {
      return testString;
    }
  }, [pattern, flags, testString]);

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8">
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

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl text-white">Regex Tester</CardTitle>
                <CardDescription className="text-gray-400">
                  Test and debug regular expressions with real-time feedback
                </CardDescription>
              </div>
              <button
                onClick={handleCopyPattern}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-orange-400 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Pattern'}</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Common Patterns
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(COMMON_PATTERNS).map(([key]) => (
                    <Badge
                      key={key}
                      variant="secondary"
                      className="cursor-pointer bg-gray-800 text-gray-300 hover:bg-gray-700 border-none"
                      onClick={() => handlePatternSelect(key as keyof typeof COMMON_PATTERNS)}
                    >
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Regular Expression Pattern
                </label>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter regex pattern (e.g., \b\w+@\w+\.\w+\b)"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Flags
                </label>
                <div className="flex flex-wrap gap-2">
                  {['g', 'i', 'm', 's', 'u', 'y'].map((flag) => (
                    <Badge
                      key={flag}
                      variant={flags.includes(flag) ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        flags.includes(flag)
                          ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-none'
                          : 'bg-transparent border-gray-800 text-gray-400 hover:text-orange-400'
                      }`}
                      onClick={() => {
                        setFlags(flags.includes(flag)
                          ? flags.replace(flag, '')
                          : flags + flag
                        );
                      }}
                    >
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Test String
                </label>
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against the regular expression"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 focus:outline-none h-32"
                />
              </div>
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

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="matches" className="text-gray-300">
              <TabsList className="bg-gray-900/60">
                <TabsTrigger 
                  value="matches"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 
                           data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Matches ({matches.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="highlighted"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 
                           data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  Highlighted Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="matches">
                {matches.length > 0 ? (
                  <div className="space-y-2">
                    {matches.map((match, index) => (
                      <div key={index} className="p-3 bg-gray-900/60 border border-gray-800/50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <code className="text-orange-400">{match.text}</code>
                          <span className="text-sm text-gray-400">Index: {match.index}</span>
                        </div>
                        {match.groups && Object.keys(match.groups).length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-800">
                            <p className="text-sm text-gray-400 mb-1">Named Groups:</p>
                            {Object.entries(match.groups).map(([key, value]) => (
                              <div key={key} className="text-sm text-gray-300">
                                <span className="font-medium text-pink-400">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 py-4">No matches found</p>
                )}
              </TabsContent>
              
              <TabsContent value="highlighted">
                <div 
                  className="p-4 bg-gray-900/60 border border-gray-800/50 rounded-lg whitespace-pre-wrap text-gray-300"
                  dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegexTester;