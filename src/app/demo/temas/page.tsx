import type { Metadata } from 'next';
import { ThemePreview } from '@/components/theme-preview';

export const metadata: Metadata = {
  title: 'Explorar diseños | Smart Menu SaaS',
  description: 'Previsualiza estilos de cartas digitales para restaurantes.',
};

export default function ThemePreviewPage() {
  return <ThemePreview />;
}
