import type { Metadata } from 'next';
import SeoAnalyzer from '@/components/tools/seoanalyzer';

export const metadata: Metadata = {
  title: 'SEO Analyzer | DevForge',
  description: 'Analyze your website\'s SEO performance and get recommendations',
};

export default function SeoAnalyzerPage() {
  return <SeoAnalyzer />;
}