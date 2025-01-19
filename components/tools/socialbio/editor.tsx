/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, GripVertical, Save, Eye, Share2 } from 'lucide-react';
import type { Profile, SocialLink, Theme } from '@/types/bio';
import ProfilePreview from './preview';

interface SocialBioEditorProps {
  profileId: string;
  username: string;
  editCode: string;
}

const SOCIAL_PLATFORMS = [
  { id: 'github', name: 'GitHub', placeholder: 'https://github.com/username' },
  { id: 'twitter', name: 'Twitter', placeholder: 'https://twitter.com/username' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/username' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/c/username' },
  { id: 'twitch', name: 'Twitch', placeholder: 'https://twitch.tv/username' },
  { id: 'portfolio', name: 'Portfolio', placeholder: 'https://yourwebsite.com' },
];

const THEMES: Theme[] = ['light', 'dark', 'purple', 'blue', 'green'];

export default function SocialBioEditor({ profileId, editCode }: SocialBioEditorProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('edit');
  
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, [profileId]);

  const loadProfile = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('edit_code', editCode)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        setProfile({
          id: profile.id,
          username: profile.username,
          displayName: profile.display_name,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          theme: profile.theme || 'light',
          editCode: profile.edit_code,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        });

        const { data: links, error: linksError } = await supabase
          .from('social_links')
          .select('*')
          .eq('profile_id', profile.id)
          .order('display_order');

        if (linksError) throw linksError;
        setSocialLinks(links || []);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName,
          bio: profile.bio,
          theme: profile.theme,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .eq('edit_code', editCode);

      if (error) throw error;
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!profile) return;


    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert([{
          profile_id: profile.id,
          platform: SOCIAL_PLATFORMS[0].id,
          url: '',
          display_order: socialLinks.length
        }])
        .select()
        .single();

      if (error) throw error;

      setSocialLinks([...socialLinks, {
        id: data.id,
        profileId: data.profile_id,
        platform: data.platform,
        url: data.url,
        displayOrder: data.display_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }]);
    } catch (err) {
      setError('Failed to add social link');
      console.error(err);
    }
  };

  const handleUpdateLink = async (index: number, updates: Partial<SocialLink>) => {
    const updatedLinks = [...socialLinks];
    const link = updatedLinks[index];

    try {
      const { error } = await supabase
        .from('social_links')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', link.id)
        .eq('profile_id', profileId);

      if (error) throw error;
      updatedLinks[index] = { ...link, ...updates };
      setSocialLinks(updatedLinks);
    } catch (err) {
      setError('Failed to update social link');
      console.error(err);
    }
  };

  const handleDeleteLink = async (index: number) => {
    const link = socialLinks[index];

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', link.id)
        .eq('profile_id', profileId);

      if (error) throw error;
      const updatedLinks = socialLinks.filter((_, i) => i !== index);
      setSocialLinks(updatedLinks);
    } catch (err) {
      setError('Failed to delete social link');
      console.error(err);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(socialLinks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((link, index) => ({
      ...link,
      displayOrder: index
    }));

    try {
      const updates = updatedItems.map(link => ({
        id: link.id,
        profile_id: profileId,
        display_order: link.displayOrder
      }));

      const { error } = await supabase
        .from('social_links')
        .upsert(updates);

      if (error) throw error;
      setSocialLinks(updatedItems);
    } catch (err) {
      setError('Failed to reorder links');
      console.error(err);
    }
  };

  if (!profile) {
    return (
      <div className="p-8">
        <Alert>
          <AlertDescription>Loading profile...</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger 
          value="edit" 
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500"
        >
          <Save className="w-4 h-4" />
          Edit Profile
        </TabsTrigger>
        <TabsTrigger 
          value="preview"
          className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-pink-500"
        >
          <Eye className="w-4 h-4" />
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="edit">
        <div className="space-y-6">
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Customize how your profile appears to others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Display Name</label>
                    <Input
                      value={profile.displayName || ''}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      placeholder="Your name"
                      className="bg-white/5 border-gray-800 focus:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Bio</label>
                    <Textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="bg-white/5 border-gray-800 focus:border-orange-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Theme</label>
                    <Select
                      value={profile.theme}
                      onValueChange={(value: Theme) => setProfile({ ...profile, theme: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-gray-800 focus:border-orange-500/50">
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        {THEMES.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600"
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
                <CardDescription className="text-gray-400">
                  Add and arrange your social media links
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="social-links">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {socialLinks.map((link, index) => (
                          <Draggable
                            key={link.id}
                            draggableId={link.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-gray-800 group hover:border-orange-500/50"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-400" />
                                </div>

                                <Select
                                  value={link.platform}
                                  onValueChange={(value) =>
                                    handleUpdateLink(index, { platform: value })
                                  }
                                >
                                  <SelectTrigger className="w-[140px] bg-white/5 border-gray-800 focus:border-orange-500/50">
                                    <SelectValue placeholder="Platform" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-900 border-gray-800">
                                    {SOCIAL_PLATFORMS.map((platform) => (
                                      <SelectItem
                                        key={platform.id}
                                        value={platform.id}
                                      >
                                        {platform.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input
                                  value={link.url}
                                  onChange={(e) =>
                                    handleUpdateLink(index, { url: e.target.value })
                                  }
                                  placeholder={
                                    SOCIAL_PLATFORMS.find(
                                      (p) => p.id === link.platform
                                    )?.placeholder
                                  }
                                  className="flex-1 bg-white/5 border-gray-800 focus:border-orange-500/50"
                                />

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLink(index)}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <Button
                  onClick={handleAddLink}
                  variant="outline"
                  className="mt-4 w-full border-orange-500/20 hover:border-orange-500/50 bg-white/5 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <ProfilePreview profile={profile} socialLinks={socialLinks} />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                const shareUrl = `${window.location.origin}/p/${profile.username}`;
                navigator.clipboard.writeText(shareUrl);
                setSuccess('Profile URL copied to clipboard!');
              }}
              className="flex items-center gap-2 border-orange-500/20 hover:border-orange-500/50 bg-white/5 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mt-4 border-orange-500/20">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}