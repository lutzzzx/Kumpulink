import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kumpulink',
    short_name: 'Kumpulink',
    description: 'Personal bookmarking and link-saving web application.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0B0F19',
    theme_color: '#E11D48',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
