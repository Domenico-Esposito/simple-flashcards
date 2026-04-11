import Head from 'expo-router/head';

import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_TITLE,
  getCanonicalUrl,
  getSiteUrl,
} from '@/utils/seo';

type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

type RouteHeadProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  jsonLd?: JsonLdValue;
};

export function RouteHead({
  title,
  description,
  canonicalPath,
  noIndex = false,
  jsonLd,
}: RouteHeadProps) {
  const siteUrl = getSiteUrl();
  const imageUrl = `${siteUrl}/assets/images/icon.png`;
  const resolvedTitle = title ? `${title} | ${SEO_DEFAULT_TITLE}` : SEO_DEFAULT_TITLE;
  const resolvedDescription = description ?? SEO_DEFAULT_DESCRIPTION;

  if (noIndex) {
    return (
      <Head>
        <title>{resolvedTitle}</title>
        <meta name="robots" content="noindex,nofollow,noarchive" />
        <meta name="googlebot" content="noindex,nofollow,noarchive" />
      </Head>
    );
  }

  const canonicalUrl = canonicalPath ? getCanonicalUrl(canonicalPath) : undefined;

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content="index,follow" />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SEO_DEFAULT_TITLE} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={imageUrl} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={imageUrl} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Head>
  );
}
