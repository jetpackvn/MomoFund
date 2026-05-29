import { FundPageHeader } from '@/components/common/FundPageHeader';
import { Loading } from '@/components/common/Loading';
import Button from '@/components/ui/Button';
import TransactionItem from '@/components/ui/TransactionItem';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { transactionService } from '@/services/transactionService';
import { Transaction, WithdrawRequest } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FundHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { fund, loading: fundLoading, error } = useFund(id);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [loadingWithdrawRequests, setLoadingWithdrawRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const isOwner = user?.uid === fund?.ownerId;

  const loadTransactions = useCallback(async () => {
    if (!id) return;
    setLoadingTransactions(true);
    try {
      const data = await transactionService.getTransactions(id);
      // Giới hạn 5 giao dịch gần nhất
      setTransactions(data.slice(0, 5));
    } catch (err) {
      console.error('loadTransactions', err);
    } finally {
      setLoadingTransactions(false);
    }
  }, [id]);

  const loadWithdrawRequests = useCallback(async () => {
    if (!id || !isOwner) return;
    setLoadingWithdrawRequests(true);
    try {
      const data = await transactionService.getPendingWithdrawRequests(id);
      setWithdrawRequests(data);
    } catch (err) {
      console.error('loadWithdrawRequests', err);
    } finally {
      setLoadingWithdrawRequests(false);
    }
  }, [id, isOwner]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadWithdrawRequests();
    }, [loadTransactions, loadWithdrawRequests])
  );

  const handlePlaceholder = () => {
    Alert.alert('Thông báo', 'Tính năng đang được phát triển');
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;
    setProcessingRequestId(requestId);
    try {
      await transactionService.approveWithdrawRequest(requestId, user.uid);
      Alert.alert('Thành công', 'Đã duyệt yêu cầu rút tiền');
      await Promise.all([loadTransactions(), loadWithdrawRequests()]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể duyệt yêu cầu rút tiền');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user) return;
    setProcessingRequestId(requestId);
    try {
      await transactionService.rejectWithdrawRequest(requestId, user.uid);
      Alert.alert('Thành công', 'Đã từ chối yêu cầu rút tiền');
      await loadWithdrawRequests();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể từ chối yêu cầu rút tiền');
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (fundLoading) return <Loading fullScreen />;

  if (error || !fund) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không thể tải thông tin quỹ</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title={fund.name} showBack={true} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* Header Info */}
      <View style={styles.headerArea}>
        <View style={styles.fundInfo}>
          <Text style={styles.fundName}>{fund.name}</Text>
          <Text style={styles.fundBalance}>{fund.balance?.toLocaleString('vi-VN')} ₫</Text>
        </View>
        <TouchableOpacity 
          style={styles.inviteButton}
          onPress={() => router.push(`/fund/${id}/invite`)}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={styles.inviteText}>Mời thành viên</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Actions: Góp quỹ & Rút quỹ */}
      <View style={styles.primaryActionsRow}>
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/transaction/contribute?fundId=${id}`)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-down" size={24} color={colors.primary} />
          </View>
          <Text style={styles.primaryBtnText}>Góp quỹ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: '#FF9800' }]}
          onPress={() => router.push(`/transaction/withdraw?fundId=${id}`)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-up" size={24} color="#FF9800" />
          </View>
          <Text style={styles.primaryBtnText}>Rút quỹ</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Actions Row */}
      <View style={styles.secondaryActionsRow}>
        <SecondaryAction icon="notifications" label="Nhắc góp quỹ" onPress={() => router.push(`/fund/${id}/remind`)} color="#4CAF50" />
        <SecondaryAction icon="star" label="Đặc quyền" onPress={() => router.push(`/fund/${id}/privileges`)} color="#9C27B0" />
        <SecondaryAction icon="card" label="Thanh toán" onPress={() => router.push(`/fund/${id}/payment`)} color="#2196F3" />
        <SecondaryAction icon="qr-code" label="QR góp quỹ" onPress={() => router.push(`/fund/${id}/qr`)} color="#607D8B" />
      </View>

      {isOwner && (
        <View style={styles.withdrawSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yêu cầu rút tiền</Text>
            {withdrawRequests.length > 0 && (
              <Text style={styles.pendingCount}>{withdrawRequests.length} chờ duyệt</Text>
            )}
          </View>

          {loadingWithdrawRequests ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : withdrawRequests.length === 0 ? (
            <View style={styles.emptyWithdrawRequests}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.border} />
              <Text style={styles.emptyText}>Không có yêu cầu rút tiền mới</Text>
            </View>
          ) : (
            withdrawRequests.map((req) => {
              const isProcessing = processingRequestId === req.id;
              return (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestRow}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestName}>{req.requesterName}</Text>
                      <Text style={styles.requestAmount}>{req.amount.toLocaleString('vi-VN')} ₫</Text>
                      <Text style={styles.requestReason}>{req.reason}</Text>
                    </View>
                    <Text style={styles.requestStatus}>Chờ duyệt</Text>
                  </View>

                  <View style={styles.requestActions}>
                    <Button
                      label="Từ chối"
                      variant="outline"
                      fullWidth={false}
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => handleRejectRequest(req.id)}
                      disabled={isProcessing}
                    />
                    <Button
                      label="Duyệt"
                      fullWidth={false}
                      style={{ flex: 1 }}
                      onPress={() => handleApproveRequest(req.id)}
                      disabled={isProcessing}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity onPress={() => router.push(`/fund/${id}/history`)}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loadingTransactions ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
        ) : transactions.length > 0 ? (
          transactions.map((item) => <TransactionItem key={item.id} transaction={item} />)
        ) : (
          <View style={styles.emptyHistory}>
            <Ionicons name="receipt-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component cho các chức năng nhỏ
function SecondaryAction({ icon, label, onPress, color }: { icon: any, label: string, onPress: () => void, color: string }) {
  return (
    <TouchableOpacity style={styles.secondaryActionBtn} onPress={onPress}>
      <View style={[styles.secondaryIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.secondaryActionLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.md, color: colors.error },
  scrollContent: { paddingBottom: spacing.xl },

  headerArea: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    marginBottom: spacing.lg,
  },
  fundInfo: { flex: 1 },
  fundName: { fontSize: fontSize.md, color: colors.textSecondary, marginBottom: spacing.xs },
  fundBalance: { fontSize: 32, fontWeight: '800', color: colors.text },
  
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: 6,
  },
  inviteText: { color: '#fff', fontWeight: '600', fontSize: fontSize.sm },

  primaryActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },

  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  secondaryActionBtn: {
    alignItems: 'center',
    width: 70,
  },
  secondaryIconCircle: {
    width: 50, height: 50,
    borderRadius: 25,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  secondaryActionLabel: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },

  section: {
    paddingHorizontal: spacing.md,
  },
  withdrawSection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  pendingCount: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyWithdrawRequests: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    opacity: 0.7,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  requestInfo: { flex: 1, paddingRight: spacing.sm },
  requestName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  requestAmount: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary, marginTop: spacing.xs },
  requestReason: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  requestStatus: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '600' },
  
  emptyHistory: { alignItems: 'center', paddingVertical: spacing.xl, opacity: 0.6 },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
});
