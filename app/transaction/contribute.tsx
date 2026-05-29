import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { transactionService } from '@/services/transactionService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function ContributeScreen() {
  const { fundId } = useLocalSearchParams<{ fundId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const value = Number(amount.replace(/,/g, ''));

    if (!fundId) {
      Alert.alert('Lỗi', 'Không xác định quỹ');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để đóng góp');
      return;
    }

    if (!value || value <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await transactionService.contribute(fundId, user as any, value, note.trim());
      Alert.alert('Thành công', 'Đã đóng góp vào quỹ', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      console.error('contribute error', error);
      router.replace('/error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>Đóng góp vào quỹ</Text>
        <Text style={styles.description}>Nhập thông tin và gửi yêu cầu đóng góp. Số tiền sẽ được cập nhật ngay khi giao dịch hoàn tất.</Text>

        <Input
          label="Số tiền (₫)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Nhập số tiền"
        />

        <Input
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          placeholder="Lý do hoặc nội dung giao dịch"
          multiline
        />

        <Button label="Gửi đóng góp" onPress={handleSubmit} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  description: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
});
