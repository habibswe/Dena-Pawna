import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dena Pawna',
    short_name: 'Dena Pawna',
    description: 'Track money you lend and borrow with ease. A modern fintech application for personal finance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121514',
    theme_color: '#10b981',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
    ],
  };
}
