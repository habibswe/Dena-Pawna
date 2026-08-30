import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dena Pawna',
    short_name: 'Dena Pawna',
    description: 'Track money you lend and borrow with ease. A modern fintech application for personal finance.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/logo-icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'maskable'
      },
      {
        src: '/logo-icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any'
      },
    ],
  };
}
