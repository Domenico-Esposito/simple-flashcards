import { Stack } from 'expo-router';

export default function DeckLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="new"
        options={{
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen
        name="[id]/edit"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="[id]/quiz" />
      <Stack.Screen name="[id]/flashcard/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]/flashcard/[flashcardId]/edit" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
