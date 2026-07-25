import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL of your deployed application
  const baseUrl = 'https://nextwatchrec.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // Add additional static or dynamic routes here as your app grows
    // For example, if you add individual show pages:
    // {
    //   url: `${baseUrl}/anime`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.8,
    // },
  ];
}
