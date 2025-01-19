/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle, Check, X, Star, Globe, Github } from 'lucide-react';
import Link from 'next/link';

type PendingResource = {
  id: string;
  name: string;
  description: string;
  category: string;
  website_url: string;
  github_url: string;
  tags: string[];
  created_at: string;
};

const ResourceAdmin = () => {
  const [pendingResources, setPendingResources] = useState<PendingResource[]>([]);
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    try {
      const response = await fetch('/api/admin/resources/pending');
      if (!response.ok) throw new Error('Failed to fetch pending resources');
      const data = await response.json();
      setPendingResources(data);
    } catch (err) {
      setError('Failed to fetch pending resources');
    }
  };

  const handleAction = async (resourceId: string, action: 'approved' | 'rejected') => {
    if (!adminCode) {
      setError('Please enter the admin code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/resources/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          action,
          adminCode
        }),
      });

      if (!response.ok) throw new Error('Invalid admin code');

      setSuccess(`Resource ${action} successfully`);
      fetchPendingResources();
    } catch (err) {
      setError('Failed to update resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <Link href="/tools/resource-rater" className="flex items-center text-gray-400 hover:text-orange-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resource Rater
          </Link>
        </div>

        <div className="mb-4">
          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-900/40 border border-gray-800/50 text-gray-300
                     focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            placeholder="Enter admin code"
          />
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

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Review Developer Resources</CardTitle>
            <CardDescription className="text-gray-400">
              Review and approve user-submitted developer resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pendingResources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending resources to review
                </div>
              ) : (
                pendingResources.map(resource => (
                  <div key={resource.id} className="p-4 rounded-lg border border-gray-800/50 
                                                  bg-gray-900/40 backdrop-blur-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg text-white">{resource.name}</h3>
                        <p className="text-gray-400">{resource.description}</p>
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
                            >
                              <Github className="w-4 h-4 mr-1" />
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleAction(resource.id, 'approved')}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white 
                                   rounded-lg hover:from-green-500 hover:to-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction(resource.id, 'rejected')}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white 
                                   rounded-lg hover:from-red-500 hover:to-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResourceAdmin;