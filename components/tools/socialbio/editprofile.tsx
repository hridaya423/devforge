'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import SocialBioEditor from './editor';

interface EditProfileClientProps {
  username: string;
}

export default function EditProfileClient({ username }: EditProfileClientProps) {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams?.get('code') || '');
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const verifyCode = async () => {
    if (!username || !code) {
      setError('Missing username or code');
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .eq('edit_code', code.toUpperCase())
        .single();

      if (queryError) throw queryError;

      if (data) {
        setVerified(true);
        setProfileId(data.id);
      } else {
        setError('Invalid edit code');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify edit code. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code && !verified) {
      verifyCode();
    }
  }, [code]);

  if (verified && profileId) {
    return <SocialBioEditor profileId={profileId} username={username} editCode={code} />;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
    <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50">
      <CardHeader>
        <CardTitle className="text-white">Edit Your Social Bio Page</CardTitle>
        <CardDescription className="text-gray-400">
          Enter your edit code to modify your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          verifyCode();
        }} className="space-y-4">
          <div className="space-y-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter your edit code"
              required
              maxLength={8}
              className="font-mono bg-white/5 border-gray-800 focus:border-orange-500/50"
            />
            <p className="text-sm text-gray-400">
              Editing profile: {username}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600" 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Continue'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  </div>
  );
}