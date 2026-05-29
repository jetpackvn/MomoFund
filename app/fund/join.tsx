import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { memberService } from '@/services/memberService';



export default function JoinFundScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      Alert.alert('Lỗi', 'Mã quỹ phải gồm 6 ký tự');
      return;
    }
    
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const { fundId, joinedDirectly } = await memberService.requestJoinFundByCode(user as any, code.trim());
      Alert.alert(
        'Thành công',
        joinedDirectly
          ? 'Bạn đã tham gia quỹ thành công!'
          : 'Đã gửi yêu cầu tham gia. Vui lòng chờ Chủ quỹ phê duyệt!',
        [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

      <View style={styles.form}>
        <Text style={styles.instruction}>Nhập mã quỹ gồm 6 ký tự do chủ quỹ cung cấp để tham gia.</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã quỹ (VD: A1B2C3)"
            placeholderTextColor={colors.textSecondary}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, (code.length !== 6 || loading) && styles.submitBtnDisabled]} 
          onPress={handleJoin}
          disabled={code.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Tham Gia</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg, gap: spacing.md },
  instruction: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.sm, textAlign: 'center' },
  inputGroup: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 14,
    fontSize: fontSize.lg, fontWeight: '700', color: colors.text,
    textAlign: 'center', letterSpacing: 2
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' }
});
