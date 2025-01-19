import type { Metadata } from 'next';
import CronGenerator from '@/components/tools/crongenerator';

export const metadata: Metadata = {
  title: 'Cron Job Generator | DevForge',
  description: 'Create and validate cron job expressions with an intuitive interface',
};

export default function CronGeneratorPage() {
  return <CronGenerator />;
}