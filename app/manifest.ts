import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Recruit Pro',
    short_name: 'airecruitpro',
    description: 'Platform Rekrutmen Cerdas Berbasis AI',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo_hd.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
