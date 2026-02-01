import { useMemo } from 'react';
import { useWindowDimensions, Linking } from 'react-native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { markdownToHtml } from '@/utils/import-export';

type HtmlContentProps = {
	html: string;
	baseFontSize?: number;
};

/**
 * Check if text contains Markdown patterns that should be converted
 */
function containsMarkdown(text: string): boolean {
	// Check for common Markdown patterns that aren't HTML
	const markdownPatterns = [
		/\*\*[^*]+\*\*/, // **bold**
		/\*[^*]+\*/, // *italic*
		/__[^_]+__/, // __bold__
		/_[^_]+_/, // _italic_
		/`[^`]+`/, // `code`
		/^#+\s/, // # heading
		/^\s*[-*+]\s/, // - list item
		/^\s*\d+\.\s/, // 1. ordered list
		/\[.+\]\(.+\)/, // [link](url)
		/!\[.*\]\(.+\)/, // ![image](url)
		/^>\s/, // > blockquote
		/~~[^~]+~~/, // ~~strikethrough~~
	];

	return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Check if text is already HTML
 */
function isHtml(text: string): boolean {
	const trimmed = text.trim();
	return trimmed.startsWith('<') && trimmed.includes('>');
}

/**
 * Component to render HTML content with proper styling for both light and dark modes.
 * Used in QuizScreen and ReadMoreScreen to display flashcard content.
 */
export function HtmlContent({ html, baseFontSize = 17 }: HtmlContentProps) {
	const { width } = useWindowDimensions();
	const colorScheme = useColorScheme() ?? 'light';

	const isDark = colorScheme === 'dark';

	const tagsStyles: any = useMemo(
		() => ({
			body: {
				color: isDark ? '#FAFAFA' : '#171717',
				fontSize: baseFontSize,
				lineHeight: baseFontSize * 1.5,
			},
			p: {
				marginBottom: 12,
			},
			h1: {
				fontSize: 28,
				fontWeight: 'bold' as const,
				marginBottom: 16,
				marginTop: 8,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			h2: {
				fontSize: 24,
				fontWeight: 'bold' as const,
				marginBottom: 14,
				marginTop: 8,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			h3: {
				fontSize: 20,
				fontWeight: 'bold' as const,
				marginBottom: 12,
				marginTop: 6,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			h4: {
				fontSize: 18,
				fontWeight: '600' as const,
				marginBottom: 10,
				marginTop: 6,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			h5: {
				fontSize: 16,
				fontWeight: '600' as const,
				marginBottom: 8,
				marginTop: 4,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			h6: {
				fontSize: 14,
				fontWeight: '600' as const,
				marginBottom: 8,
				marginTop: 4,
				color: isDark ? '#FAFAFA' : '#171717',
			},
			strong: {
				fontWeight: 'bold' as const,
			},
			b: {
				fontWeight: 'bold' as const,
			},
			em: {
				fontStyle: 'italic' as const,
			},
			i: {
				fontStyle: 'italic' as const,
			},
			u: {
				textDecorationLine: 'underline' as const,
			},
			s: {
				textDecorationLine: 'line-through' as const,
			},
			del: {
				textDecorationLine: 'line-through' as const,
			},
			code: {
				fontFamily: 'monospace',
				backgroundColor: isDark ? '#262626' : '#F5F5F5',
				color: isDark ? '#60A5FA' : '#3B82F6',
				paddingHorizontal: 4,
				paddingVertical: 2,
				borderRadius: 4,
				fontSize: baseFontSize - 1,
			},
			pre: {
				backgroundColor: isDark ? '#262626' : '#F5F5F5',
				padding: 12,
				borderRadius: 8,
				marginVertical: 8,
				overflow: 'hidden' as const,
			},
			blockquote: {
				borderLeftWidth: 3,
				borderLeftColor: isDark ? '#60A5FA' : '#3B82F6',
				paddingLeft: 12,
				marginVertical: 8,
				opacity: 0.9,
			},
			a: {
				color: isDark ? '#60A5FA' : '#3B82F6',
				textDecorationLine: 'underline' as const,
			},
			ul: {
				marginVertical: 8,
				paddingLeft: 16,
			},
			ol: {
				marginVertical: 8,
				paddingLeft: 16,
			},
			li: {
				marginBottom: 4,
			},
			hr: {
				backgroundColor: isDark ? '#404040' : '#E5E5E5',
				height: 1,
				marginVertical: 16,
			},
		}),
		[isDark, baseFontSize],
	);

	const renderersProps = useMemo(
		() => ({
			a: {
				onPress: (_: unknown, href: string) => {
					if (href) {
						Linking.openURL(href);
					}
				},
			},
		}),
		[],
	);

	// Convert Markdown to HTML if necessary, then wrap if needed
	const processedHtml = useMemo(() => {
		const trimmed = html.trim();

		// If it's already HTML, use as-is (or wrap if not properly tagged)
		if (isHtml(trimmed)) {
			return trimmed;
		}

		// If it contains Markdown patterns, convert to HTML
		if (containsMarkdown(trimmed)) {
			return markdownToHtml(trimmed);
		}

		// Plain text, wrap in paragraph
		return `<p>${trimmed}</p>`;
	}, [html]);

	return (
		<RenderHtml
			contentWidth={width - 48}
			source={{ html: processedHtml }}
			tagsStyles={tagsStyles}
			systemFonts={[...defaultSystemFonts, 'monospace']}
			renderersProps={renderersProps}
			enableExperimentalMarginCollapsing
		/>
	);
}
