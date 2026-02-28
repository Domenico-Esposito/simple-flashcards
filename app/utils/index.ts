/**
 * Utility functions
 */

export { initDatabase } from './database';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Format a date string to a localized format
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a duration in milliseconds to a human-readable string (e.g. "5m 30s")
 */
export function formatTime(ms: number): string {
  if (!ms) return '0s';
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

/**
 * Strip markdown/HTML formatting from text, returning plain text.
 * Useful for generating previews of markdown content.
 */
export function stripMarkdown(text: string): string {
  return (
    text
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&[a-z]+;/gi, '')
      .replace(/^[=-]{2,}\s*$/gm, '')
      .replace(/\[\^.+?\](: .*?$)?/gm, '')
      .replace(/\s{0,2}\[.*?\]: .*?$/gm, '')
      .replace(/!\[(.*?)\][[(].*?[\])]/g, '')
      .replace(/\[([\s\S]*?)\]\s*[([].*?[)\]]/g, '$1')
      .replace(/^(\n)?\s{0,3}>\s?/gm, '$1')
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/gm, '')
      .replace(/^(\n)?\s{0,}#{1,6}\s*( (.+))? +#+$|^(\n)?\s{0,}#{1,6}\s*( (.+))?$/gm, '$1$3$4$6')
      .replace(/([*]+)(\S)(.*?\S)??\1/g, '$2$3')
      .replace(/(^|\W)([_]+)(\S)(.*?\S)??\2($|\W)/g, '$1$3$4$5')
      .replace(/(`{3,})(.*?)\1/gms, '$2')
      .replace(/`(.+?)`/g, '$1')
      .replace(/~(.*?)~/g, '$1')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  );
}
