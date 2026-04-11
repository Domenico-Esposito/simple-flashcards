import { useLocalSearchParams } from 'expo-router';
import { RouteHead } from '@/components/seo/RouteHead';
import { ReadMoreScreen } from '@/components/screens';

export default function ReadMoreRoute() {
  const { type, content } = useLocalSearchParams<{
    type: 'question' | 'answer';
    content: string;
  }>();

  return (
    <>
      <RouteHead noIndex title="Read More" />
      <ReadMoreScreen type={type} content={content || ''} />
    </>
  );
}
