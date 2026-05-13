import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, fontSize, spacing } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  label, onPress, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = true,
  style, textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary} />
        : <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },

  // Sizes
  size_sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  size_md: { paddingVertical: 13, paddingHorizontal: spacing.lg },
  size_lg: { paddingVertical: 16, paddingHorizontal: spacing.xl },

  // Text base
  text: { fontWeight: '700' },
  text_primary: { color: '#fff' },
  text_outline: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: '#fff' },

  // Text sizes
  textSize_sm: { fontSize: fontSize.xs },
  textSize_md: { fontSize: fontSize.md },
  textSize_lg: { fontSize: fontSize.lg },
});
