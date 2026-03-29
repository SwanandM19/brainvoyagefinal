import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.vidyasangrah.app';
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified,
    },
    {
      url: `${baseUrl}/student/feed`,
      lastModified,
    },
    {
      url: `${baseUrl}/teacher/feed`,
      lastModified,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified,
    },
  ];
}