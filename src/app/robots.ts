import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.vidyasangrah.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Prevent indexing of authenticated/protected app areas.
        disallow: [
          '/api/',
          '/admin/',
          '/auth/error',
          '/unauthorized',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}