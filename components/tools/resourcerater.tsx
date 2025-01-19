/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, AlertCircle, Star, Globe, Github } from 'lucide-react';
import Link from 'next/link';

type DevResource = {
  id: string;
  name: string;
  description: string;
  category: string;
  website_url: string;
  github_url: string;
  tags: string[];
  average_rating: number;
  review_count: number;
  created_at: string;
  status: string;
};

type ResourceReview = {
  id: string;
  rating: number;
  review_text: string;
  code_example: string;
  language: string;
  created_at: string;
};

const categories = [
  'frontend-frameworks',
  'backend-frameworks',
  'databases',
  'devops-tools',
  'testing-frameworks',
  'state-management',
  'ui-libraries',
  'development-tools',
  'cloud-services',
  'authentication'
];
const languages = ['javascript', 'python', 'typescript', 'java', 'cpp', 'go', 'rust'];
const DevResourceRater = () => {
  const [resources, setResources] = useState<DevResource[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'recent'>('rating');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<DevResource | null>(null);
  const [reviews, setReviews] = useState<ResourceReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    category: 'frontend-frameworks',
    website_url: '',
    github_url: '',
    tags: ''
  });
  const [newReview, setNewReview] = useState({
    rating: 0,
    review_text: '',
    code_example: '',
    language: 'javascript'
  });

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, sortBy]);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        sort: sortBy
      });
      
      const response = await fetch(`/api/resources?${params}`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (err) {
      setError('Failed to fetch resources');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources/${resourceId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newResource,
          tags: newResource.tags.split(',').map(tag => tag.trim())
        }),
      });

      if (!response.ok) throw new Error('Failed to submit resource');

      setSuccess('Resource submitted successfully! It will be visible after approval.');
      setShowSubmitDialog(false);
      setNewResource({
        name: '',
        description: '',
        category: 'frontend-frameworks',
        website_url: '',
        github_url: '',
        tags: ''
      });
      fetchResources();
    } catch (err) {
      setError('Failed to submit resource');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/resources/${selectedResource.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setSuccess('Review submitted successfully!');
      setShowReviewDialog(false);
      setNewReview({
        rating: 0,
        review_text: '',
        code_example: '',
        language: 'javascript'
      });
      await fetchReviews(selectedResource.id);
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = (resource: DevResource) => {
    setSelectedResource(resource);
    fetchReviews(resource.id);
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
            Submit Resource
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <label className="block text-sm font-medium mb-2 text-gray-300">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'recent')}
              className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                       focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              <option value="rating">Highest Rated</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
            </div>
          ) : resources.length === 0 ? (
            <Card className="bg-gray-900/40 border-gray-800/50">
              <CardContent className="p-12 text-center">
                <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300">No resources found</h3>
                <p className="text-gray-500 mt-2">Be the first to submit a resource!</p>
              </CardContent>
            </Card>
          ) : (
            resources.map(resource => (
              <Card 
                key={resource.id} 
                className="cursor-pointer bg-gray-900/40 backdrop-blur-xl border-gray-800/50 
                         hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg 
                         hover:shadow-orange-500/10" 
                onClick={() => handleResourceClick(resource)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white">{resource.name}</CardTitle>
                      <CardDescription className="text-gray-400">{resource.description}</CardDescription>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 text-xs bg-orange-400/10 text-orange-400 rounded-full">
                          {resource.category}
                        </span>
                        {resource.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-4">
                        <a
                          href={resource.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-orange-400 hover:text-orange-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                        </a>
                        {resource.github_url && (
                          <a
                            href={resource.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-400 hover:text-gray-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Github className="w-4 h-4 mr-1" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-400 mr-1" />
                        <span className="font-bold text-white">{resource.average_rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({resource.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Submit a Developer Resource</DialogTitle>
              <DialogDescription className="text-gray-400">
                Share a helpful development tool or library with the community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitResource} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={newResource.name}
                  onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="E.g., React Query"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Describe what this resource does and why it's useful"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
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

              <div>
                <label className="block text-sm font-medium mb-1">Website URL</label>
                <input
                  type="url"
                  value={newResource.website_url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL (Optional)</label>
                <input
                  type="url"
                  value={newResource.github_url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, github_url: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="https://github.com/example/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Comma-separated tags (e.g., react, hooks, state-management)"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSubmitDialog(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? 'Submitting...' : 'Submit Resource'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedResource?.name}</DialogTitle>
              <DialogDescription>{selectedResource?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <a
                  href={selectedResource?.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Visit Website
                </a>
                {selectedResource?.github_url && (
                  <a
                    href={selectedResource.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    View on GitHub
                  </a>
                )}
                <button
                  onClick={() => setShowReviewDialog(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
                >
                  Write Review
                </button>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold">Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map(review => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{review.review_text}</p>
                        {review.code_example && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Code Example ({review.language})</h4>
                            <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                              <code>{review.code_example}</code>
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedResource?.name}</DialogTitle>
              <DialogDescription className="text-gray-400">{selectedResource?.description}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Star 
                        className={`w-6 h-6 ${rating <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Review</label>
                <textarea
                  value={newReview.review_text}
                  onChange={(e) => setNewReview(prev => ({ ...prev, review_text: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-24"
                  placeholder="Share your experience with this resource..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code Example (Optional)</label>
                <textarea
                  value={newReview.code_example}
                  onChange={(e) => setNewReview(prev => ({ ...prev, code_example: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-32 font-mono"
                  placeholder="Share a code example showing how to use this resource..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={newReview.language}
                  onChange={(e) => setNewReview(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewDialog(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newReview.rating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {isLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DevResourceRater;