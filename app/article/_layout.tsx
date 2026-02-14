import { Stack } from 'expo-router';

export default function ArticleLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[slug]"
        options={{
          title: '',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
