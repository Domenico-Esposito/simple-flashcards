import { useMemo } from 'react';
import { MarkdownRenderer } from '@domenico-esposito/react-native-markdown-editor';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { createRendererComponents } from '@/components/ui/markdown-theme';

type MarkdownContentProps = {
  markdown: string;
  baseFontSize?: number;
};

/**
 * Component to render markdown content.
 * Used in QuizScreen, StudyScreen, and ReadMoreScreen to display flashcard content.
 */
export function MarkdownContent({ markdown }: MarkdownContentProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const components = useMemo(() => createRendererComponents(colorScheme), [colorScheme]);

  return <MarkdownRenderer markdown={markdown} components={components} />;
}
