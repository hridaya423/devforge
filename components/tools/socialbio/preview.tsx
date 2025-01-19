/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Twitch,
  Globe,
} from 'lucide-react';
import type { Profile, SocialLink } from '@/types/bio';

interface ProfilePreviewProps {
  profile: Profile;
  socialLinks: SocialLink[];
}

const PLATFORM_ICONS: { [key: string]: React.ComponentType<any> } = {
  github: Github,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitch: Twitch,
  portfolio: Globe,
};


const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile, socialLinks }) => {

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950">
    <div className="max-w-2xl mx-auto p-6">
      <Card className="overflow-hidden shadow-xl bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
        <div className="p-8">
          <div className="text-center mb-8">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || ''}
                className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gradient-to-r from-orange-400 to-pink-500"
              />
            )}
            <h1 className="text-3xl font-bold mb-2 text-white">
              {profile.displayName || profile.username}
            </h1>
            {profile.bio && (
              <p className="text-gray-300 whitespace-pre-wrap">
                {profile.bio}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {socialLinks.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform];
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 rounded-lg border border-gray-800 hover:border-orange-500/50 
                           bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  {Icon && (
                    <Icon className="w-6 h-6 mr-3 text-orange-400" />
                  )}
                  <span className="flex-1 text-white">
                    {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
        
        <div className="text-center p-4 text-sm text-gray-400 border-t border-gray-800 bg-gray-900/60">
          Made with DevForge
        </div>
      </Card>
    </div>
  </div>
  );
};

export default ProfilePreview;