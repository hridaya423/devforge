import type { Metadata } from 'next';
import GradientGenerator from '@/components/tools/gradientgenerator';

export const metadata: Metadata = {
  title: 'CSS Gradient Generator | DevForge',
  description: 'Create beautiful CSS gradients for your website',
};

export default function GradientGeneratorPage() {
  return <GradientGenerator />;
}