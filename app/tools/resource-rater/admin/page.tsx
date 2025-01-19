import type { Metadata } from 'next';
import ResourceAdmin from '@/components/tools/resourceadmin';

export const metadata: Metadata = {
  title: 'Resource Rater Admin | DevForge',
  description: 'Approve developer resource submissions',
};

export default function AdminPage() {
  return <ResourceAdmin />;
}