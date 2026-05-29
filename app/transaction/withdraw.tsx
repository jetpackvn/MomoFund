import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { transactionService } from '@/services/transactionService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function WithdrawScreen() {
  const { fundId, reason: initialReason } = useLocalSearchParams<{ fundId: string, reason?: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { fund } = useFund(fundId);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState(initialReason || '');
  const [loading, setLoading] = useState(false);

  const isOwner = user?.uid === fund?.ownerId;
  const title = isOwner ? 'Rút tiền' : 'Yêu cầu rút tiền';
  const description = isOwner
    ? 'Chủ quỹ có thể rút tiền trực tiếp và ghi vào lịch sử giao dịch.'
    : 'Gửi yêu cầu rút tiền để chủ quỹ kiểm tra và duyệt.';

  const handleSubmit = async () => {
    const value = Number(amount.replace(/,/g, ''));

    if (!fundId) {
      Alert.alert('Lỗi', 'Không xác định quỹ');
      return;
    }

    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thực hiện yêu cầu rút tiền');
      return;
    }

    if (!value || value <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do rút tiền');
      return;
    }

    setLoading(true);
    try {
      const result = await transactionService.requestWithdrawal(fundId, user as any, value, reason.trim());
      if (result?.direct) {
        Alert.alert('Thành công', 'Đã rút tiền và cập nhật vào lịch sử giao dịch', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Thành công', 'Đã gửi yêu cầu rút tiền', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      Alert.alert('Lỗi', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Input
          label="Số tiền (₫)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="Nhập số tiền"
        />

        <Input
          label="Lý do rút tiền"
          value={reason}
          onChangeText={setReason}
          placeholder="Nhập lý do"
          multiline
        />

        <Button label={isOwner ? 'Thanh toán' : 'Gửi yêu cầu'} onPress={handleSubmit} loading={loading} />
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
