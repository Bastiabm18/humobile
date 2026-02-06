import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nombre de tu App',
    short_name: 'MiApp',
    description: 'Descripción de mi proyecto en Vercel',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}