import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, fontSize } from '@/constants/theme';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantConfig: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#E8F5E9', text: colors.success },
  error:   { bg: '#FFEBEE', text: colors.error },
  warning: { bg: '#FFF8E1', text: colors.warning },
  info:    { bg: '#E3F2FD', text: '#1565C0' },
  default: { bg: '#F5F5F5', text: colors.textSecondary },
};

export default function Badge({ label, variant = 'default', style }: BadgeProps) {
  const { bg, text } = variantConfig[variant];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start' },
  text: { fontSize: fontSize.xs, fontWeight: '600' },
});
