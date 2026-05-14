import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { fundService } from '@/services/fundService';
import { colors, fontSize, spacing, radius } from '@/constants/theme';

export default function CreateFundScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
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
      const fundId = await fundService.createFund(name.trim(), description.trim(), user as any);
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Tạo quỹ mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.form}>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: spacing.md, paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
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
