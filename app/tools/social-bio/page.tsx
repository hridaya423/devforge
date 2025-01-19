/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

export default function CreateProfile() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{code: string, username: string} | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!username.match(/^[a-zA-Z0-9_-]+$/)) {
      setError('Username can only contain letters, numbers, underscores, and hyphens');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .rpc('create_new_profile', {
          p_username: username.toLowerCase()
        });

      if (error) throw error;
      if (!data || !data[0]?.username || !data[0]?.edit_code) {
        throw new Error('Failed to create profile - missing data');
      }

      setSuccess({
        code: data[0].edit_code,
        username: data[0].username
      });
    } catch (err: any) {
      console.error('Creation error:', err);
      if (err.message?.includes('duplicate key')) {
        setError('This username is already taken');
      } else {
        setError('Failed to create profile: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="relative">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-orange-500/10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        <div className="relative container mx-auto p-6 max-w-2xl">
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                Create Your Social Bio Page
              </CardTitle>
              <CardDescription className="text-gray-400">
                Choose a username for your social bio page. You&apos;ll get a secret code to edit it later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!success ? (
                <motion.form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="space-y-2">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      minLength={3}
                      maxLength={30}
                      className="bg-white/5 border-gray-800 focus:border-orange-500/50 text-white placeholder:text-gray-500"
                    />
                    <p className="text-sm text-gray-400">
                      Your page will be available at:{' '}
                      <span className="text-orange-400">
                        {window.location.origin}/p/{username || 'username'}
                      </span>
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Creating...' : 'Create Profile'}
                  </motion.button>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                        <AlertDescription className="text-red-200">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </motion.form>
              ) : (
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Alert className="border-orange-500/20 bg-gray-900/40 backdrop-blur-xl">
                    <AlertDescription className="space-y-2 text-gray-300">
                      <p className="font-medium text-orange-400">Your profile has been created! Save this information:</p>
                      <div className="bg-gray-900/60 p-4 rounded-md space-y-2 border border-gray-800">
                        <p>
                          <strong className="text-orange-400">Your page:</strong> <br/>
                          <a 
                            href={`/p/${success.username}`} 
                            className="text-pink-400 hover:text-orange-400 transition-colors duration-300"
                          >
                            {window.location.origin}/p/{success.username}
                          </a>
                        </p>
                        <p>
                          <strong className="text-orange-400">Edit code:</strong> <br/>
                          <span className="font-mono bg-gray-900/80 px-2 py-1 rounded text-pink-500">
                            {success.code}
                          </span>
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 mt-4">
                        Keep this code safe! You&apos;ll need it to edit your profile at:<br/>
                        <span className="text-orange-400">
                          {window.location.origin}/p/{success.username}/edit
                        </span>
                      </p>
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end">
                    <motion.button
                      onClick={() => {
                        window.location.href = `/p/${success.username}/edit?code=${success.code}`;
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white rounded-lg font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit Profile Now
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}