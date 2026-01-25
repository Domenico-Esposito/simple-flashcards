import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Linking } from 'react-native';
import { Text, View, Heading, Stack } from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo } from 'react';
import Markdown from 'react-native-markdown-display';

import type { RenderRules } from 'react-native-markdown-display';
import { Header } from '@/components/Header';

export default function ReadMoreScreen() {
	const { type, content } = useLocalSearchParams<{ type: 'question' | 'answer'; content: string }>();
	const insets = useSafeAreaInsets();

	const title = type === 'question' ? 'Domanda' : 'Risposta';

	// Markdown render rules using Tamagui components
	const markdownRules: RenderRules = useMemo(
		() => ({
			text: (node, _children, _parent, _styles, inheritedStyles = {}) => (
				<Text key={node.key} fontSize={17} style={inheritedStyles}>
					{node.content}
				</Text>
			),
			paragraph: (node, children) => (
				<Text key={node.key} fontSize={17} marginBottom="$3">
					{children}
				</Text>
			),
			heading1: (node, children) => (
				<Heading key={node.key} size="$9">
					{children}
				</Heading>
			),
			heading2: (node, children) => (
				<Heading key={node.key} size="$8">
					{children}
				</Heading>
			),
			heading3: (node, children) => (
				<Heading key={node.key} size="$7">
					{children}
				</Heading>
			),
			heading4: (node, children) => (
				<Heading key={node.key} size="$6">
					{children}
				</Heading>
			),
			heading5: (node, children) => (
				<Heading key={node.key} size="$5">
					{children}
				</Heading>
			),
			heading6: (node, children) => (
				<Heading key={node.key} size="$4">
					{children}
				</Heading>
			),
			strong: (node, children) => (
				<Text key={node.key} fontWeight="bold">
					{children}
				</Text>
			),
			em: (node, children) => (
				<Text key={node.key} fontStyle="italic">
					{children}
				</Text>
			),
			s: (node, children) => (
				<Text key={node.key} textDecorationLine="line-through">
					{children}
				</Text>
			),
			code_inline: (node) => (
				<Text
					key={node.key}
					backgroundColor="$backgroundStrong"
					color="$primary"
					paddingHorizontal="$1"
					paddingVertical="$0.5"
					borderRadius="$2"
					fontSize={16}
					fontFamily="$mono">
					{node.content}
				</Text>
			),
			fence: (node) => (
				<View key={node.key} backgroundColor="$backgroundStrong" padding="$3" borderRadius="$3" marginVertical="$2">
					<Text fontSize={14} fontFamily="$mono">
						{node.content}
					</Text>
				</View>
			),
			code_block: (node) => (
				<View key={node.key} backgroundColor="$backgroundStrong" padding="$3" borderRadius="$3" marginVertical="$2">
					<Text fontSize={14} fontFamily="$mono">
						{node.content}
					</Text>
				</View>
			),
			blockquote: (node, children) => (
				<View key={node.key} borderLeftWidth={4} borderLeftColor="$primary" paddingLeft="$3" marginVertical="$2" opacity={0.9}>
					{children}
				</View>
			),
			bullet_list: (node, children) => (
				<View key={node.key} marginVertical="$2">
					{children}
				</View>
			),
			ordered_list: (node, children) => (
				<View key={node.key} marginVertical="$2">
					{children}
				</View>
			),
			list_item: (node, children, _parent) => {
				const isOrdered = _parent[0]?.type === 'ordered_list';
				const index = _parent[0]?.children?.indexOf(node) ?? 0;
				const bullet = isOrdered ? `${index + 1}.` : '•';
				return (
					<View key={node.key} flexDirection="row" marginBottom="$1">
						<Text width={24} fontSize={18}>
							{bullet}
						</Text>
						<View flex={1}>{children}</View>
					</View>
				);
			},
			link: (node, children) => (
				<Text key={node.key} color="$primary" textDecorationLine="underline" onPress={() => Linking.openURL(node.attributes.href)}>
					{children}
				</Text>
			),
			hr: (node) => <View key={node.key} height={1} backgroundColor="$borderColor" marginVertical="$4" />,
			image: (node) => (
				<View key={node.key} marginVertical="$2">
					<Text color="$secondary">[Image: {node.attributes.alt || 'image'}]</Text>
				</View>
			),
		}),
		[],
	);

	return (
		<View flex={1} backgroundColor="$background">
			{/* Header */}
			<Header title={title} isModal />

			{/* Content */}
			<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom }}>
				<Stack gap="$4" flex={1} paddingHorizontal="$4" paddingVertical="$2">
					<Markdown rules={markdownRules}>{content || ''}</Markdown>
				</Stack>
			</ScrollView>
		</View>
	);
}
