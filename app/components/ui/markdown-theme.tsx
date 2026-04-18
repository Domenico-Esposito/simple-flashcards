import * as React from 'react';
import { Image, Linking, Platform, StyleSheet, Text as RNText, type TextStyle } from 'react-native';
import { Text, View } from 'tamagui';
import {
  getDefaultSegmentStyle,
  type HighlightSegmentType,
  type SegmentComponentProps,
  type SegmentComponentMap,
  type RendererComponentMap,
  type ParagraphRendererProps,
  type TextRendererProps,
  type HeadingRendererProps,
  type BoldRendererProps,
  type ItalicRendererProps,
  type StrikethroughRendererProps,
  type InlineCodeRendererProps,
  type CodeBlockRendererProps,
  type BlockquoteRendererProps,
  type UnorderedListRendererProps,
  type OrderedListRendererProps,
  type ListItemRendererProps,
  type LinkRendererProps,
  type ImageRendererProps,
  type RootRendererProps,
} from '@domenico-esposito/react-native-markdown-editor';

import { appFonts } from '@/theme/fonts';

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------

type ColorScheme = 'light' | 'dark';

const colors = {
  light: {
    text: '#171717',
    delimiter: '#A3A3A3',
    code: '#3B82F6',
    codeBg: '#F5F5F5',
    link: '#3B82F6',
    linkUrl: '#A3A3A3',
    image: '#3B82F6',
    quote: '#6B7280',
    quoteMarker: '#A3A3A3',
    quoteBorder: '#3B82F6',
    listMarker: '#3B82F6',
    horizontalRule: '#E5E5E5',
    codeBlockBg: '#F5F5F5',
    codeBlockLabelBg: '#E5E5E5',
  },
  dark: {
    text: '#FAFAFA',
    delimiter: '#737373',
    code: '#60A5FA',
    codeBg: '#262626',
    link: '#60A5FA',
    linkUrl: '#737373',
    image: '#60A5FA',
    quote: '#9CA3AF',
    quoteMarker: '#737373',
    quoteBorder: '#60A5FA',
    listMarker: '#60A5FA',
    horizontalRule: '#404040',
    codeBlockBg: '#262626',
    codeBlockLabelBg: '#404040',
  },
};

function getColors(scheme: ColorScheme) {
  return colors[scheme];
}

// ---------------------------------------------------------------------------
// Segment components (for MarkdownTextInput – must be Text-based)
// ---------------------------------------------------------------------------

export function createSegmentComponents(scheme: ColorScheme): SegmentComponentMap {
  const c = getColors(scheme);

  // Custom heading sizes for better visual hierarchy (body text is 16)
  const editorHeadingSizes: Record<string, number> = {
    '1': 32,
    '2': 26,
    '3': 22,
    '4': 20,
    '5': 18,
    '6': 17,
  };

  // Merges the base default style with custom overrides and optional heading
  // metrics into a single flat object. Avoids style arrays and StyleSheet.flatten
  // so that the library's web style-extraction (resolveSegmentStyle / collectNestedStyles)
  // can read the style directly from `element.props.style`.
  function mergeStyle(
    type: HighlightSegmentType,
    meta?: Record<string, string>,
    overrides: TextStyle = {},
  ): TextStyle {
    const base = getDefaultSegmentStyle(type, meta);
    const isCode = type === 'code' || type === 'codeBlock';
    const fontFamily = isCode ? appFonts.mono : appFonts.sans;
    const heading: TextStyle | undefined =
      meta?.lineContext === 'heading'
        ? {
            fontSize: editorHeadingSizes[meta?.headingLevel ?? '1'] ?? 16,
            lineHeight: Math.ceil((editorHeadingSizes[meta?.headingLevel ?? '1'] ?? 16) * 1.5),
            fontFamily: appFonts.sansBold,
          }
        : undefined;
    return Object.assign({}, base, { fontFamily }, overrides, heading);
  }

  // On web the library calls segment components as plain functions (outside
  // React's render cycle) to extract styles from the returned element tree.
  // Tamagui's Text and RNText (react-native-web) both use hooks internally,
  // which throws "Invalid hook call" when invoked outside a render.
  // We use RNText on native (rendered by React, hooks are fine) and a plain
  // React.createElement('span') on web (no hooks, style is still extractable).
  function createSegment(
    type: HighlightSegmentType,
    meta: Record<string, string> | undefined,
    children: React.ReactNode,
    style: TextStyle,
  ) {
    if (Platform.OS === 'web') {
      return React.createElement('span', { style }, children);
    }
    return React.createElement(RNText, { style }, children);
  }

  const ThemedSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.text }));

  const DelimiterSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.delimiter }));

  const HeadingSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.text }));

  const BoldSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(
      type,
      meta,
      children,
      mergeStyle(type, meta, { color: c.text, fontWeight: '700', fontFamily: appFonts.sansBold }),
    );

  const ItalicSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.text }));

  const StrikethroughSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.text }));

  const CodeSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(
      type,
      meta,
      children,
      mergeStyle(type, meta, {
        color: c.code,
        backgroundColor: c.codeBg,
        fontSize: 16,
      }),
    );

  const CodeBlockSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.code, fontSize: 16 }));

  const LinkSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.link }));

  const LinkUrlSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.linkUrl }));

  const ImageSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.image }));

  const QuoteSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.quote }));

  const QuoteMarkerSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.quoteMarker }));

  const ListMarkerSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.listMarker }));

  const HorizontalRuleSegment = ({ type, meta, children }: SegmentComponentProps) =>
    createSegment(type, meta, children, mergeStyle(type, meta, { color: c.horizontalRule }));

  return {
    text: ThemedSegment,
    delimiter: DelimiterSegment,
    heading: HeadingSegment,
    bold: BoldSegment,
    italic: ItalicSegment,
    strikethrough: StrikethroughSegment,
    code: CodeSegment,
    codeBlock: CodeBlockSegment,
    link: LinkSegment,
    linkUrl: LinkUrlSegment,
    image: ImageSegment,
    quote: QuoteSegment,
    quoteMarker: QuoteMarkerSegment,
    listMarker: ListMarkerSegment,
    horizontalRule: HorizontalRuleSegment,
  };
}

// ---------------------------------------------------------------------------
// Renderer components (for MarkdownRenderer – can use View/Text/Image)
// ---------------------------------------------------------------------------

export function createRendererComponents(scheme: ColorScheme): RendererComponentMap {
  const c = getColors(scheme);

  const Root = ({ children, style }: RootRendererProps) => (
    <View style={[rendererStyles.root, style]}>{children}</View>
  );

  const Paragraph = ({ children }: ParagraphRendererProps) => (
    <Text style={[rendererStyles.paragraph, { color: c.text }]}>{children}</Text>
  );

  const TextComponent = ({ children }: TextRendererProps) => (
    <Text style={{ color: c.text }}>{children}</Text>
  );

  function createHeading(fontSize: number) {
    const HeadingComponent = ({ children }: HeadingRendererProps<1 | 2 | 3 | 4 | 5 | 6>) => (
      <Text style={{ fontSize, fontWeight: '700', fontFamily: appFonts.sansBold, color: c.text }}>
        {children}
      </Text>
    );
    HeadingComponent.displayName = `Heading`;
    return HeadingComponent;
  }

  const Bold = ({ children }: BoldRendererProps) => (
    <Text style={[rendererStyles.bold, { color: c.text }]}>{children}</Text>
  );

  const Italic = ({ children }: ItalicRendererProps) => (
    <Text style={[rendererStyles.italic, { color: c.text }]}>{children}</Text>
  );

  const Strikethrough = ({ children }: StrikethroughRendererProps) => (
    <Text style={[rendererStyles.strikethrough, { color: c.text }]}>{children}</Text>
  );

  const InlineCode = ({ children }: InlineCodeRendererProps) => (
    <Text style={[rendererStyles.inlineCode, { color: c.code, backgroundColor: c.codeBg }]}>
      {children}
    </Text>
  );

  const CodeBlock = ({ text, language }: CodeBlockRendererProps) => (
    <View style={[rendererStyles.codeBlock, { backgroundColor: c.codeBlockBg }]}>
      <Text
        style={[
          rendererStyles.codeBlockLanguage,
          { backgroundColor: c.codeBlockLabelBg, color: c.text },
        ]}
      >
        {language?.trim() || 'Code'}
      </Text>
      <Text style={[rendererStyles.codeBlockText, { color: c.code }]}>{text}</Text>
    </View>
  );

  const Blockquote = ({ children }: BlockquoteRendererProps) => (
    <View style={[rendererStyles.blockquote, { borderLeftColor: c.quoteBorder }]}>{children}</View>
  );

  const HorizontalRule = () => (
    <View style={[rendererStyles.horizontalRule, { borderBottomColor: c.horizontalRule }]} />
  );

  const UnorderedList = ({ children }: UnorderedListRendererProps) => (
    <View style={rendererStyles.list}>{children}</View>
  );

  const OrderedList = ({ children }: OrderedListRendererProps) => (
    <View style={rendererStyles.list}>{children}</View>
  );

  const ListItem = ({ children }: ListItemRendererProps) => (
    <View style={rendererStyles.listItem}>
      <Text style={[rendererStyles.paragraph, { color: c.text }]}>{children}</Text>
    </View>
  );

  const Link = ({ children, href }: LinkRendererProps) => (
    <Text
      style={[rendererStyles.link, { color: c.link }]}
      onPress={() => href && Linking.openURL(href)}
    >
      {children}
    </Text>
  );

  const ImageComponent = ({ src, alt, title }: ImageRendererProps) => (
    <View style={rendererStyles.imageContainer}>
      <Image
        source={{ uri: src }}
        style={rendererStyles.image}
        resizeMode="contain"
        accessibilityLabel={alt ?? title}
      />
      {alt ? <Text style={[rendererStyles.imageAlt, { color: c.quote }]}>{alt}</Text> : null}
    </View>
  );

  return {
    root: Root,
    paragraph: Paragraph,
    text: TextComponent,
    heading1: createHeading(34),
    heading2: createHeading(28),
    heading3: createHeading(24),
    heading4: createHeading(21),
    heading5: createHeading(19),
    heading6: createHeading(17),
    bold: Bold,
    italic: Italic,
    strikethrough: Strikethrough,
    inlineCode: InlineCode,
    codeBlock: CodeBlock,
    blockquote: Blockquote,
    horizontalRule: HorizontalRule,
    unorderedList: UnorderedList,
    orderedList: OrderedList,
    listItem: ListItem,
    link: Link,
    image: ImageComponent,
  };
}

// ---------------------------------------------------------------------------
// Shared renderer styles (color-independent)
// ---------------------------------------------------------------------------

const rendererStyles = StyleSheet.create({
  root: {
    gap: 8,
  },
  paragraph: {
    lineHeight: 24,
    fontSize: 17,
  },
  bold: {
    fontWeight: '700',
    fontFamily: appFonts.sansBold,
  },
  italic: {
    fontStyle: 'italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    fontFamily: appFonts.mono,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontSize: 17,
  },
  codeBlock: {
    borderRadius: 8,
    padding: 12,
  },
  codeBlockLanguage: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 8,
  },
  codeBlockText: {
    fontFamily: appFonts.mono,
    fontSize: 17,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 12,
  },
  horizontalRule: {
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  list: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
  },
  link: {
    textDecorationLine: 'underline',
  },
  image: {
    width: '100%',
    height: 200,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageAlt: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
