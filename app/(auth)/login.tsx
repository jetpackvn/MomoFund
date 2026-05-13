import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, radius, fontSize } from '@/constants/theme';
import { isValidEmail, parseFirebaseError } from '@/utils/helpers';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Validate trước khi gửi
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Email không đúng định dạng (vd: abc@gmail.com)';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      const code = e?.code || '';
      // Mọi lỗi liên quan đến thông tin đăng nhập → gộp chung 1 thông báo
      const credentialErrors = [
        'auth/invalid-email', 'auth/user-not-found',
        'auth/wrong-password', 'auth/invalid-credential',
      ];
      if (credentialErrors.includes(code)) {
        setErrors({ password: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      } else {
        setErrors({ general: parseFirebaseError(e) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₫</Text>
          </View>
          <Text style={styles.appName}>MomoFund</Text>
          <Text style={styles.tagline}>Quản lý quỹ nhóm minh bạch</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Đăng nhập</Text>

          {/* Lỗi chung (network, disabled, ...) */}
          {errors.general ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>⚠️ {errors.general}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="example@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: undefined, password: undefined })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, errors.password ? styles.inputError : null]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={v => { setPassword(v); setErrors(p => ({ ...p, password: undefined })); }}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text style={styles.eyeIcon}>{showPw ? '◉' : '⚆'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Đăng nhập</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              Chưa có tài khoản? <Text style={styles.link}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 72, height: 72, borderRadius: radius.full,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  logoText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  appName: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  tagline: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  alertBox: {
    backgroundColor: '#FFF1F0', borderRadius: radius.sm, padding: spacing.sm,
    marginBottom: spacing.md, borderWidth: 1, borderColor: '#FFCDD2',
  },
  alertText: { fontSize: fontSize.sm, color: colors.error },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text, backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderLeftWidth: 0,
    borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  eyeIcon: { fontSize: 18, color: colors.textSecondary },
  errorText: { fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
  btn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  linkRow: { marginTop: spacing.md, alignItems: 'center' },
  linkText: { fontSize: fontSize.sm, color: colors.textSecondary },
  link: { color: colors.primary, fontWeight: '600' },
});
