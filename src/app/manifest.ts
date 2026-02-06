import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Humobile | CHILE',
    short_name: 'Humobile',
    description: 'Humobile | Chile',
    start_url: '/',
    display: 'standalone',
    background_color: '#171717',
    theme_color: '#171717',
    icons: [
      {
        src: '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}