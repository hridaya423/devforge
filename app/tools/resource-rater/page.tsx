import type { Metadata } from 'next';
import DevResourceRater from '@/components/tools/resourcerater';

export const metadata: Metadata = {
  title: 'Dev Resource Rater | DevForge',
  description: 'Rate and review development tools with code examples',
};

export default function ResourceRaterPage() {
  return <DevResourceRater />;
}