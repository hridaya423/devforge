import type { Metadata } from 'next';
import DeadLinkDetector from '@/components/tools/deadlinkdetector';

export const metadata: Metadata = {
  title: 'Dead Link Detector | DevForge',
  description: 'Scan your website for broken links and images',
};

export default function DeadLinkDetectorPage() {
  return <DeadLinkDetector />;
}