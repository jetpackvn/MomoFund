import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View } from 'react-native';
import { colors } from '@/constants/theme';
import { Loading } from '@/components/common/Loading';

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
    return <Loading fullScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="fund/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="fund/create" options={{ 
        headerShown: true, 
        title: 'Tạo quỹ mới',
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
        headerTitleAlign: 'center',
        headerBackTitle: '',
      }} />
      <Stack.Screen name="fund/join" options={{ 
        headerShown: true, 
        title: 'Tham gia quỹ',
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { fontWeight: '700', color: colors.text },
        headerTintColor: colors.primary,
        headerTitleAlign: 'center',
        headerBackTitle: '',
      }} />
      <Stack.Screen name="transaction/contribute" options={{ headerShown: true, title: 'Đóng góp', headerTintColor: colors.primary }} />
      <Stack.Screen name="transaction/withdraw" options={{ headerShown: true, title: 'Yêu cầu rút tiền', headerTintColor: colors.primary }} />
    </Stack>
  );
}
