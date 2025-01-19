import type { Metadata } from 'next';
import RegexTester from '@/components/tools/regextester';

export const metadata: Metadata = {
  title: 'Regex Tester | DevForge',
  description: 'Test and debug regular expressions with real-time feedback and sample inputs',
};

export default function RegexTesterPage() {
  return <RegexTester />;
}