import type { Metadata } from 'next';
import BrowserTester from '@/components/tools/browsertester';

export const metadata: Metadata = {
  title: 'Cross Browser Tester | DevForge',
  description: 'Test your website across various browsers and versions to ensure compatibility',
};

export default function BrowserTesterPage() {
  return <BrowserTester />;
}