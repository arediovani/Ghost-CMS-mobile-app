import { Stack } from 'expo-router';

export default function ArticleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        headerTitle: '',
        headerShadowVisible: false,
        headerTransparent: false,
      }}
    >
      <Stack.Screen
        name="[slug]"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
