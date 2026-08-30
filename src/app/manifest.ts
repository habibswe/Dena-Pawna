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
        src: '/icon.svg?v=3',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icon.svg?v=3',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
    ],
  };
}
