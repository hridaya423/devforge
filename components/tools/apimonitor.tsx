/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, CheckCircle, AlertTriangle, XCircle, Plus, ArrowLeft } from 'lucide-react';
import type { Endpoint, PerformanceData } from '@/types/api';
import Link from 'next/link';

const APIMonitor: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [newEndpointUrl, setNewEndpointUrl] = useState('');
  const [newEndpointName, setNewEndpointName] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpointHealth = async () => {
    try {
      const encodedEndpoints = encodeURIComponent(JSON.stringify(endpoints));
      const response = await fetch(`/api/monitor?endpoints=${encodedEndpoints}`);
      const data = await response.json();
      
      if (data.success) {
        setEndpoints(data.results);
        
        const newDataPoint = {
          time: new Date().toLocaleTimeString(),
          responseTime: data.results.reduce((acc: number, curr: Endpoint) => 
            acc + (curr.responseTime || 0), 0) / data.results.length,
          status: data.results.every((endpoint: Endpoint) => endpoint.status === 'up') ? 'up' as const : 'down' as const
        };
        
        setPerformanceData(prev => [...prev.slice(-23), newDataPoint]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch endpoint health');
    }
  };

  useEffect(() => {
    if (endpoints.length > 0) {
      fetchEndpointHealth();
      const interval = setInterval(fetchEndpointHealth, 60000);
      return () => clearInterval(interval);
    }
  }, [endpoints]);

  const handleAddEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: newEndpointUrl,
          name: newEndpointName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEndpoints(prev => [...prev, data.endpoint]);
        setNewEndpointUrl('');
        setNewEndpointName('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to add endpoint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'down':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const calculateUptime = () => {
    if (performanceData.length === 0) return '0.00';
    const upCount = performanceData.filter(data => data.status === 'up').length;
    return ((upCount / performanceData.length) * 100).toFixed(2);
  };

  const getAverageResponseTime = () => {
    if (performanceData.length === 0) return '0.00';
    const sum = performanceData.reduce((acc, curr) => acc + curr.responseTime, 0);
    return (sum / performanceData.length).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
      
          
        <div className="mb-8">
        <Link 
            href="/" 
            className="flex items-center text-gray-400 hover:text-orange-400 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">API Performance Monitor</h1>
          <p className="text-gray-400">Monitor your API endpoint&apos;s health, response times, and uptime</p>
        </div>

        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Add New Endpoint</CardTitle>
            <CardDescription className="text-gray-400">
              Enter the details of the API endpoint you want to monitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEndpoint} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="API Endpoint URL"
                  value={newEndpointUrl}
                  onChange={(e) => setNewEndpointUrl(e.target.value)}
                  required
                  type="url"
                  className="bg-gray-900/40 border-gray-800/50 text-gray-300 
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                />
                <Input
                  placeholder="Endpoint Name"
                  value={newEndpointName}
                  onChange={(e) => setNewEndpointName(e.target.value)}
                  required
                  className="bg-gray-900/40 border-gray-800/50 text-gray-300 
                           focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-orange-400 to-pink-500
                         hover:from-orange-500 hover:to-pink-600 transition-all duration-300"
              >
                {loading ? 'Adding...' : 'Add Endpoint'}
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </form>
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-500/10 border-red-500/20 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {endpoints.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Uptime</p>
                      <p className="text-2xl font-bold text-white">{calculateUptime()}%</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Avg Response Time</p>
                      <p className="text-2xl font-bold text-white">{getAverageResponseTime()}ms</p>
                    </div>
                    <Activity className="w-8 h-8 text-pink-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">Current Status</p>
                      <p className="text-2xl font-bold text-white">
                        {performanceData[performanceData.length - 1]?.status === 'up' ? 'Healthy' : 'Issues Detected'}
                      </p>
                    </div>
                    {getStatusIcon(performanceData[performanceData.length - 1]?.status)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Response Time Trends</CardTitle>
                <CardDescription className="text-gray-400">24-hour performance monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '0.5rem',
                          color: '#E5E7EB'
                        }}
                      />
                      <Legend />
                      <defs>
                        <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#fb923c" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="url(#responseTimeGradient)"
                        strokeWidth={2}
                        name="Response Time (ms)"
                        dot={{ fill: '#fb923c' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endpoints.map((endpoint) => (
                <Card key={endpoint.id} className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 
                                                hover:border-orange-500/50 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-white">{endpoint.name}</h3>
                        <p className="text-sm text-gray-400">{endpoint.url}</p>
                      </div>
                      {getStatusIcon(endpoint.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Last Check</span>
                        <span className="text-sm text-gray-300">
                          {endpoint.lastChecked ? new Date(endpoint.lastChecked).toLocaleTimeString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Response Time</span>
                        <span className="text-sm text-gray-300">
                          {endpoint.responseTime ? `${endpoint.responseTime}ms` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-400">Status Code</span>
                        <span className="text-sm text-gray-300">{endpoint.statusCode || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default APIMonitor;