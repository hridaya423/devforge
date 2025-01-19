import type { Metadata } from 'next';
import JsonFormatter from '@/components/tools/jsonformatter';

export const metadata: Metadata = {
  title: 'JSON Formatter & Validator | DevForge',
  description: 'Format, validate, and beautify your JSON data with ease',
};

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}