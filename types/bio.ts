export type Theme = 'light' | 'dark' | 'purple' | 'blue' | 'green';

export interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  theme: Theme;
  editCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  url: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateProfileDto {
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: Theme;
}

export interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: Theme;
}

export interface CreateSocialLinkDto {
  platform: string;
  url: string;
  displayOrder?: number;
}

export interface UpdateSocialLinkDto {
  platform?: string;
  url?: string;
  displayOrder?: number;
}

export interface ProfileWithLinks extends Profile {
  socialLinks: SocialLink[];
}