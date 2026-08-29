import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dena Pawna - Simple Money Ledger',
    short_name: 'Dena Pawna',
    description: 'Track money you lend and borrow with ease. A modern fintech application for personal finance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon1',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon2',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
