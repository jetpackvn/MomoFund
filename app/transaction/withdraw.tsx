import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '@/constants/theme';

export default function WithdrawScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yêu cầu rút tiền</Text>
      <Text style={styles.placeholder}>🚧 Màn hình đang được phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  placeholder: { fontSize: fontSize.md, color: colors.textSecondary },
});
