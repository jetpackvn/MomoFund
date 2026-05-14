import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/theme';

interface LoadingProps {
  fullScreen?: boolean;
  style?: ViewStyle;
  color?: string;
  size?: 'small' | 'large';
}

export function Loading({ fullScreen = true, style, color = colors.primary, size = 'large' }: LoadingProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  inline: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
