import { Metadata } from 'next';
import PRAnalyzer from '@/components/tools/pranalyzer';

export const metadata: Metadata = {
  title: 'PR Quality Scorer | DevForge',
  description: 'Analyze GitHub pull requests and get quality metrics and recommendations',
};

export default function PRScorerPage() {
  return <PRAnalyzer />;
}