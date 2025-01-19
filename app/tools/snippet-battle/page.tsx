import type { Metadata } from 'next';
import CodeSnippetBattle from '@/components/tools/snippetbattle';

export const metadata: Metadata = {
  title: 'Code Snippet Battle | DevForge',
  description: 'Submit and vote on coding challenge solutions',
};

export default function CodeSnippetBattlePage() {
  return <CodeSnippetBattle />;
}