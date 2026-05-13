import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function Input({
  label, error, containerStyle, rightIcon, onRightIconPress,
  secureTextEntry, ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.icon}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>
            <Ionicons name={rightIcon} size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  inputNormal: { borderColor: colors.border },
  inputError: { borderColor: colors.error },
  input: {
    flex: 1, paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text,
  },
  icon: { paddingHorizontal: spacing.sm },
  error: { fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
});
