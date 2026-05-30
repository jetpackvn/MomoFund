import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { transactionService } from '@/services/transactionService';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

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
      console.error('withdraw error', error);
      router.replace('/error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  container: { flex: 1, padding: spacing.md },
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
  description: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.lg },
});
