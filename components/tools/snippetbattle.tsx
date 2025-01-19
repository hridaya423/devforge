/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, AlertCircle, Plus, Code, ThumbsUp, ThumbsDown, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import Link from 'next/link';

type CodeSnippet = {
  id: string;
  title: string;
  description: string;
  code_content: string;
  language: string;
  category: string;
  tags: string[];
  vote_count: number;
  created_at: string;
};

const categories = [
  'array-methods',
  'string-manipulation',
  'date-handling',
  'object-manipulation',
  'async-patterns',
  'data-structures',
  'algorithms',
  'utility-functions',
  'regex-patterns',
  'performance-tips'
];

const languages = ['javascript', 'python', 'typescript', 'java', 'cpp', 'go', 'rust'];

const CodeSnippetBattle = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    description: '',
    code_content: '',
    language: 'javascript',
    category: 'utility-functions',
    tags: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSnippets();
  }, [selectedCategory, selectedLanguage, sortBy]);

  const fetchSnippets = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        language: selectedLanguage !== 'all' ? selectedLanguage : '',
        sort: sortBy
      });
      
      const response = await fetch(`/api/snippets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch snippets');
      const data = await response.json();
      setSnippets(data);
    } catch (err) {
      setError('Failed to fetch snippets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSnippet,
          tags: newSnippet.tags.split(',').map(tag => tag.trim())
        }),
      });

      if (!response.ok) throw new Error('Failed to submit snippet');

      const data = await response.json();
      setSuccess('Snippet submitted successfully! It will be visible after approval.');
      setShowSubmitDialog(false);
      setNewSnippet({
        title: '',
        description: '',
        code_content: '',
        language: 'javascript',
        category: 'utility-functions',
        tags: ''
      });
    } catch (err) {
      setError('Failed to submit snippet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (snippetId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const response = await fetch(`/api/snippets/${snippetId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (!response.ok) throw new Error('Failed to vote');
      fetchSnippets();
    } catch (err) {
      setError('Failed to register vote');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowSubmitDialog(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg 
                     hover:from-orange-500 hover:to-pink-600 transition-all duration-300 shadow-lg shadow-orange-500/20"
          >
            Submit Snippet
          </button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-8 bg-green-500/10 border-green-500/20 text-green-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                       focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                       focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="all">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent')}
              className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                       focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="votes">Most Votes</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
            </div>
          ) : snippets.length === 0 ? (
            <Card className="bg-gray-900/40 border-gray-800/50">
              <CardContent className="p-12 text-center">
                <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300">No snippets found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or submit a new snippet!</p>
              </CardContent>
            </Card>
          ) : (
            snippets.map(snippet => (
              <Card key={snippet.id} className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 
                                              hover:border-orange-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{snippet.title}</CardTitle>
                      <CardDescription className="text-gray-400">{snippet.description}</CardDescription>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-orange-400/10 text-orange-400 rounded-full">
                          {snippet.language}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                          {snippet.category}
                        </span>
                        {snippet.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-gray-400">
                      <button
                        onClick={() => handleVote(snippet.id, 'upvote')}
                        className="p-1 hover:text-orange-400 rounded transition-colors"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                      <span className="font-bold text-white">{snippet.vote_count}</span>
                      <button
                        onClick={() => handleVote(snippet.id, 'downvote')}
                        className="p-1 hover:text-pink-400 rounded transition-colors"
                      >
                        <ChevronDown className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                    <code>{snippet.code_content}</code>
                  </pre>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Submit a Code Snippet</DialogTitle>
              <DialogDescription className="text-gray-400">
                Share a useful code snippet with the community. It will be reviewed before being published.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Title</label>
                <input
                  type="text"
                  value={newSnippet.title}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                  placeholder="E.g., Array chunking in JavaScript"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newSnippet.description}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Briefly describe what this snippet does and when to use it"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <textarea
                  value={newSnippet.code_content}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, code_content: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-48 font-mono"
                  placeholder="Paste your code here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={newSnippet.language}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newSnippet.category}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={newSnippet.tags}
                  onChange={(e) => setNewSnippet(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Comma-separated tags (e.g., arrays, optimization, helper)"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitDialog(false)}
                  className="px-4 py-2 border border-gray-800 rounded-lg text-gray-300 
                           hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg 
                           hover:from-orange-500 hover:to-pink-600 transition-all duration-300 
                           disabled:from-gray-600 disabled:to-gray-600"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Snippet'
                  )}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CodeSnippetBattle;