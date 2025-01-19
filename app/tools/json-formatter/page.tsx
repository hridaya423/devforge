'use client'
import dynamic from 'next/dynamic';
const JsonFormatter = dynamic(
  () => import('@/components/tools/jsonformatter'),
  { ssr: false }
);

export default function JsonFormatterPage() {
  return <JsonFormatter />;
}
