import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.airecruit-pro.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/applicant/', '/(perusahaan)/', '/pending-approval/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
