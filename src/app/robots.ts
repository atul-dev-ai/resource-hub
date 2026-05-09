import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin-portal/', '/api/'], 
    },
    sitemap: 'https://resource-hub-diu.vercel.app/sitemap.xml',
  };
}