export const SEO_DEFAULT_TITLE = 'Minimal Flashcards';
export const SEO_DEFAULT_DESCRIPTION =
  'Create flashcard decks, study with swipe-based sessions, and track progress across iOS, Android, and web.';

const DEFAULT_SITE_URL = 'https://minimalflashcards.app';

export function getSiteUrl(): string {
  const rawSiteUrl = (process.env.EXPO_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).trim();
  const siteUrlWithProtocol =
    rawSiteUrl.startsWith('http://') || rawSiteUrl.startsWith('https://')
      ? rawSiteUrl
      : `https://${rawSiteUrl}`;

  return siteUrlWithProtocol.replace(/\/+$/, '');
}

export function getCanonicalUrl(path: string): string {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedPath === '/') {
    return `${siteUrl}/`;
  }

  return `${siteUrl}${normalizedPath.replace(/\/+$/, '')}`;
}
