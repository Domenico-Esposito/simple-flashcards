import { ScrollViewStyleReset } from 'expo-router/html';

import { SEO_DEFAULT_DESCRIPTION, SEO_DEFAULT_TITLE, getSiteUrl } from '@/utils/seo';

export default function Root({ children }: { children: React.ReactNode }) {
  const siteUrl = getSiteUrl();
  const imageUrl = `${siteUrl}/assets/images/icon.png`;
  const homeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SEO_DEFAULT_TITLE,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'iOS, Android, Web',
    description: SEO_DEFAULT_DESCRIPTION,
    url: `${siteUrl}/`,
  };

  return (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        <title>{SEO_DEFAULT_TITLE}</title>
        <meta name="description" content={SEO_DEFAULT_DESCRIPTION} />
        <meta name="robots" content="index,follow" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SEO_DEFAULT_TITLE} />
        <meta property="og:title" content={SEO_DEFAULT_TITLE} />
        <meta property="og:description" content={SEO_DEFAULT_DESCRIPTION} />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={imageUrl} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_DEFAULT_TITLE} />
        <meta name="twitter:description" content={SEO_DEFAULT_DESCRIPTION} />
        <meta name="twitter:image" content={imageUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
        />

        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SEO_DEFAULT_TITLE} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
