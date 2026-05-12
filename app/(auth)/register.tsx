import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!displayName || !email || !password || !confirm)
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
    if (password !== confirm)
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    if (password.length < 6)
      return Alert.alert('Lỗi', 'Mật khẩu phải ít nhất 6 ký tự');
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim());
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₫</Text>
          </View>
          <Text style={styles.appName}>MomoFund</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Tạo tài khoản</Text>

          {[
            { label: 'Họ và tên', value: displayName, set: setDisplayName, placeholder: 'Nguyễn Văn A', secure: false, keyboard: 'default' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'example@email.com', secure: false, keyboard: 'email-address' },
            { label: 'Mật khẩu', value: password, set: setPassword, placeholder: '••••••••', secure: true, keyboard: 'default' },
            { label: 'Xác nhận mật khẩu', value: confirm, set: setConfirm, placeholder: '••••••••', secure: true, keyboard: 'default' },
          ].map((field) => (
            <View key={field.label} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textSecondary}
                value={field.value}
                onChangeText={field.set}
                secureTextEntry={field.secure}
                keyboardType={field.keyboard as any}
                autoCapitalize={field.keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Đăng ký</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  logo: {
    width: 60, height: 60, borderRadius: radius.full,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  logoText: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  appName: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  form: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text, backgroundColor: colors.background,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  linkRow: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { fontSize: fontSize.sm, color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '600' },
});
