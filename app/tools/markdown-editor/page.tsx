import type { Metadata } from 'next';
import MarkdownEditor from '@/components/tools/markdowneditor';

export const metadata: Metadata = {
  title: 'Markdown Editor | DevForge',
  description: 'Create and preview Markdown files with live formatting',
};

export default function MarkdownEditorPage() {
  return <MarkdownEditor />;
}