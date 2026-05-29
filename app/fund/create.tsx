
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { fundService } from '@/services/fundService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateFundScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên quỹ');
      return;
    }
    
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const fundId = await fundService.createFund(name.trim(), description.trim(), user as any, visibility);
      Alert.alert('Thành công', 'Đã tạo quỹ mới!', [
        { text: 'OK', onPress: () => router.replace(`/fund/${fundId}`) }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo quỹ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên quỹ *</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Quỹ ăn uống, Quỹ du lịch..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mô tả (không bắt buộc)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mục đích của quỹ này là gì?"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Chế độ quỹ</Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionActive]}
              onPress={() => setVisibility('private')}
            >
              <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextActive]}>
                Riêng tư
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionActive]}
              onPress={() => setVisibility('public')}
            >
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextActive]}>
                Công khai
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.visibilityHint}>
            {visibility === 'private'
              ? 'Chỉ chủ quỹ có thể duyệt thành viên mới.'
              : 'Bất kỳ ai có mã quỹ đều có thể tham gia ngay lập tức.'}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, (!name.trim() || loading) && styles.submitBtnDisabled]} 
          onPress={handleCreate}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Tạo Quỹ</Text>
          )}
        </TouchableOpacity>
    </KeyboardAvoidingView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg, gap: spacing.md },
  inputGroup: { gap: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fontSize.md, color: colors.text
  },
  textArea: { height: 100, paddingTop: 12 },
  visibilityRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  visibilityOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  visibilityOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  visibilityText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  visibilityTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  visibilityHint: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
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
