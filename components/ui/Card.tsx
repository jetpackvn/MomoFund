import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export default function Card({ children, style, padding = 'md' }: CardProps) {
  return (
    <View style={[styles.card, padding !== 'none' && styles[`pad_${padding}`], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pad_sm: { padding: spacing.sm },
  pad_md: { padding: spacing.md },
  pad_lg: { padding: spacing.lg },
});
