import type { Metadata } from 'next';
import ColorSchemeExplorer from '@/components/tools/colorscheme';

export const metadata: Metadata = {
  title: 'Color Scheme Explorer | DevForge',
  description: 'Generate beautiful color palettes from images and export to Tailwind CSS or CSS variables',
};

export default function ColorSchemePage() {
  return <ColorSchemeExplorer />;
}