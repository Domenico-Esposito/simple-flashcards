import { useMemo } from 'react';
import { MarkdownRenderer } from '@domenico-esposito/react-native-markdown-editor';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createRendererComponents } from '@/components/ui/markdown-theme';

type HtmlContentProps = {
  html: string;
  baseFontSize?: number;
};

/**
 * Component to render markdown content.
 * Used in QuizScreen, StudyScreen, and ReadMoreScreen to display flashcard content.
 */
export function HtmlContent({ html }: HtmlContentProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const components = useMemo(() => createRendererComponents(colorScheme), [colorScheme]);

  return <MarkdownRenderer markdown={html} components={components} />;
}
