import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';

export default function FundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết quỹ</Text>
      <Text style={styles.sub}>Fund ID: {id}</Text>
      <Text style={styles.placeholder}>🚧 Màn hình đang được phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
  placeholder: { fontSize: fontSize.md, color: colors.textSecondary },
});
