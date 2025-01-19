import type { Metadata } from 'next';
import TechStackVisualizer from '@/components/tools/stackvisualizer';

export const metadata: Metadata = {
  title: 'Tech Stack Visualizer | DevForge',
  description: 'Discover technologies powering any website',
};

export default function TechStackVisualizerPage() {
  return <TechStackVisualizer />;
}