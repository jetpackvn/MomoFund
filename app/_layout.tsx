import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="fund/[id]" options={{ headerShown: true, title: 'Chi tiết quỹ', headerTintColor: colors.primary }} />
      <Stack.Screen name="fund/create" options={{ headerShown: true, title: 'Tạo quỹ mới', headerTintColor: colors.primary }} />
      <Stack.Screen name="fund/join" options={{ headerShown: true, title: 'Tham gia quỹ', headerTintColor: colors.primary }} />
      <Stack.Screen name="transaction/contribute" options={{ headerShown: true, title: 'Đóng góp', headerTintColor: colors.primary }} />
      <Stack.Screen name="transaction/withdraw" options={{ headerShown: true, title: 'Yêu cầu rút tiền', headerTintColor: colors.primary }} />
    </Stack>
  );
}
