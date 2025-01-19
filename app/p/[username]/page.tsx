import { createServerClien } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProfilePreview from '@/components/tools/socialbio/preview';
import type { Profile, SocialLink } from '@/types/bio';

export async function generateMetadata({ params }: { params: { username: string } }) {
  const supabase = createServerClien();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    return {
      title: 'Profile Not Found',
    };
  }

  return {
    title: `${profile.display_name || profile.username} - Social Bio`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s social links`,
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createServerClien();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: socialLinks } = await supabase
    .from('social_links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('display_order');
  const transformedProfile: Profile = {
    id: profile.id,
    editCode: profile.user_id,
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    theme: profile.theme,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };

  const transformedLinks: SocialLink[] = socialLinks?.map(link => ({
    id: link.id,
    profileId: link.profile_id,
    platform: link.platform,
    url: link.url,
    displayOrder: link.display_order,
    createdAt: link.created_at,
    updatedAt: link.updated_at,
  })) || [];

  return <ProfilePreview profile={transformedProfile} socialLinks={transformedLinks} />;
}