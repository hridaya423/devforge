import APIMonitor from '@/components/tools/apimonitor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Performance Monitor | DevForge',
  description: 'Keep track on APIs and get useful stats!',
};
export default function APIMonitorPage() {
  return <APIMonitor />
}