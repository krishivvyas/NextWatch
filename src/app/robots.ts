import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://nextwatchrec.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // disallow: '/private/', // Add paths here if you want to hide them from Google
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
