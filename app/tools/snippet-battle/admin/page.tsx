import type { Metadata } from 'next';
import AdminPanel from '@/components/tools/snippetadmin';

export const metadata: Metadata = {
  title: 'Code Snippet Battle Admin | DevForge',
  description: 'Approve code challenge submissions',
};

export default function AdminPage() {
  return <AdminPanel />;
}