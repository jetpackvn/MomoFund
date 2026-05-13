import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, parseFirebaseError, validatePassword } from '@/utils/helpers';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirm?: string;
    general?: string;
  }>({});
  const { register } = useAuth();
  const router = useRouter();

  const pwValidation = validatePassword(password);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Vui lòng nhập họ và tên';
    } else if (displayName.trim().length < 2) {
      newErrors.displayName = 'Tên phải có ít nhất 2 ký tự';
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Email không đúng định dạng (vd: abc@gmail.com)';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (!pwValidation.valid) {
      const missing: string[] = [];
      if (!pwValidation.minLength) missing.push('ít nhất 8 ký tự');
      if (!pwValidation.hasUppercase) missing.push('1 chữ hoa');
      if (!pwValidation.hasNumber) missing.push('1 chữ số');
      newErrors.password = `Mật khẩu cần: ${missing.join(', ')}`;
    }

    if (!confirm) {
      newErrors.confirm = 'Vui lòng xác nhận mật khẩu';
    } else if (confirm !== password) {
      newErrors.confirm = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(email.trim(), password, displayName.trim());
    } catch (e: any) {
      const code = e?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrors({ email: 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác' });
      } else if (code === 'auth/invalid-email') {
        setErrors({ email: parseFirebaseError(e) });
      } else if (code === 'auth/weak-password') {
        setErrors({ password: 'Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn' });
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
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>₫</Text>
          </View>
          <Text style={styles.appName}>MomoFund</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Tạo tài khoản</Text>

          {/* Lỗi chung */}
          {errors.general ? (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>⚠️ {errors.general}</Text>
            </View>
          ) : null}

          {/* Họ và tên */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <TextInput
              style={[styles.input, errors.displayName ? styles.inputError : null]}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={v => { setDisplayName(v); setErrors(p => ({ ...p, displayName: undefined })); }}
              autoCapitalize="words"
            />
            {errors.displayName ? <Text style={styles.errorText}>{errors.displayName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="example@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: undefined })); }}
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
                onChangeText={v => {
                  setPassword(v);
                  setShowPasswordHint(v.length > 0);
                  setErrors(p => ({ ...p, password: undefined }));
                }}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                <Text style={styles.eyeIcon}>{showPw ? '◉' : '⚆'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Checklist điều kiện — hiện khi đang gõ, kể cả khi đã đúng hết */}
            {showPasswordHint ? (
              <View style={styles.pwHint}>
                <PasswordRule ok={pwValidation.minLength} label="Ít nhất 8 ký tự" />
                <PasswordRule ok={pwValidation.hasUppercase} label="Ít nhất 1 chữ hoa (A-Z)" />
                <PasswordRule ok={pwValidation.hasNumber} label="Ít nhất 1 chữ số (0-9)" />
              </View>
            ) : null}
          </View>

          {/* Xác nhận mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex, errors.confirm ? styles.inputError : null]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                value={confirm}
                onChangeText={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: undefined })); }}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                <Text style={styles.eyeIcon}>{showConfirm ? '◉' : '⚆'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirm
              ? <Text style={styles.errorText}>{errors.confirm}</Text>
              : confirm.length > 0 && confirm === password
                ? <Text style={styles.successText}>✓ Mật khẩu khớp</Text>
                : null
            }
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Đăng ký</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkRow} onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Đã có tài khoản? <Text style={styles.link}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Component nhỏ hiển thị từng rule mật khẩu
function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <View style={styles.pwRule}>
      <Text style={[styles.pwRuleIcon, ok ? styles.pwRuleOk : styles.pwRuleFail]}>
        {ok ? '✓' : '✗'}
      </Text>
      <Text style={[styles.pwRuleText, ok ? styles.pwRuleOk : styles.pwRuleFail]}>
        {label}
      </Text>
    </View>
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
  // Input với nút hiện/ẩn mật khẩu
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: { flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  eyeBtn: {
    borderWidth: 1.5, borderColor: colors.border, borderLeftWidth: 0,
    borderTopRightRadius: radius.md, borderBottomRightRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  eyeIcon: { fontSize: 18 },
  errorText: { fontSize: fontSize.xs, color: colors.error, marginTop: 4 },
  successText: { fontSize: fontSize.xs, color: colors.success, marginTop: 4 },
  // Password hint checklist
  pwHint: {
    backgroundColor: '#F8F9FA', borderRadius: radius.sm,
    padding: spacing.sm, marginTop: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
    gap: 4,
  },
  pwRule: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pwRuleIcon: { fontSize: 12, fontWeight: '700', width: 14 },
  pwRuleText: { fontSize: fontSize.xs },
  pwRuleOk: { color: colors.success },
  pwRuleFail: { color: colors.textSecondary },
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
