import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
const JsonFormatter = dynamic(
  () => import('@/components/tools/jsonformatter'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'JSON Toolkit | DevForge',
  description: 'Format, validate, and beautify your JSON data with ease',
};

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}
