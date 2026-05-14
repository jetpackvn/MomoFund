import Button from '@/components/ui/Button';
import TransactionItem from '@/components/ui/TransactionItem';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { transactionService } from '@/services/transactionService';
import { FundMember, Transaction, WithdrawRequest } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { fund, loading: fundLoading, error } = useFund(id);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const loadMembers = useCallback(() => {
    if (!id) return;
    setMembersLoading(true);
    memberService.getFundMembers(id)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setMembersLoading(false));
  }, [id]);

  const loadTransactions = useCallback(async () => {
    if (!id) return;
    setLoadingTransactions(true);
    try {
      const data = await transactionService.getTransactions(id);
      setTransactions(data);
    } catch (err) {
      console.error('loadTransactions', err);
      Alert.alert('Lỗi', 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoadingTransactions(false);
    }
  }, [id]);

  const loadRequests = useCallback(async () => {
    if (!id) return;
    setLoadingRequests(true);
    try {
      const data = await transactionService.getPendingWithdrawRequests(id);
      setRequests(data);
    } catch (err) {
      console.error('loadRequests', err);
      Alert.alert('Lỗi', 'Không thể tải yêu cầu rút tiền');
    } finally {
      setLoadingRequests(false);
    }
  }, [id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadRequests();
    }, [loadTransactions, loadRequests])
  );

  const handleCopyCode = async () => {
    if (fund?.code) {
      await Clipboard.setStringAsync(fund.code);
      Alert.alert('Thành công', 'Đã sao chép mã quỹ');
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để duyệt yêu cầu');
      return;
    }

    setProcessingRequestId(requestId);
    try {
      await transactionService.approveWithdrawRequest(requestId, user.uid);
      await loadRequests();
      await loadTransactions();
      Alert.alert('Đã duyệt', 'Yêu cầu rút tiền đã được chấp nhận');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      Alert.alert('Lỗi', message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để duyệt yêu cầu');
      return;
    }

    setProcessingRequestId(requestId);
    try {
      await transactionService.rejectWithdrawRequest(requestId, user.uid);
      await loadRequests();
      Alert.alert('Đã từ chối', 'Yêu cầu rút tiền đã bị từ chối');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      Alert.alert('Lỗi', message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (fundLoading) {
    return <Loading fullScreen />;
  }

  if (error || !fund) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không thể tải thông tin quỹ</Text>
        <TouchableOpacity style={styles.backBtnError} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.uid === fund.ownerId;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{fund.name}</Text>
        <TouchableOpacity style={styles.settingBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư quỹ</Text>
          <Text style={styles.balance}>{fund.balance?.toLocaleString('vi-VN')} ₫</Text>
          <TouchableOpacity style={styles.codeBadge} onPress={handleCopyCode}>
            <Ionicons name="copy-outline" size={16} color={colors.primary} />
            <Text style={styles.codeText}>Mã: {fund.code}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <Button label="Đóng góp" onPress={() => router.push(`/transaction/contribute?fundId=${id}`)} fullWidth={false} style={styles.actionButton} />
          <Button label="Rút tiền" variant="outline" onPress={() => router.push(`/transaction/withdraw?fundId=${id}`)} fullWidth={false} style={styles.actionButton} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thành viên ({fund.memberCount})</Text>
          </View>
          {membersLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : (
            members.map((item) => (
              <View key={item.userId} style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.displayName?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.displayName}</Text>
                  <Text style={styles.memberRole}>{item.role === 'owner' ? 'Trưởng quỹ' : 'Thành viên'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {isOwner && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Yêu cầu rút tiền</Text>
              <Text style={styles.sectionSub}>{requests.length} đang chờ</Text>
            </View>
            {loadingRequests ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestTop}>
                    <Text style={styles.requestTitle}>{request.requesterName}</Text>
                    <Text style={styles.requestAmount}>{request.amount.toLocaleString('vi-VN')} ₫</Text>
                  </View>
                  <Text style={styles.requestNote}>{request.reason}</Text>
                  <View style={styles.requestFooter}>
                    <Button
                      label="Duyệt"
                      onPress={() => handleApprove(request.id)}
                      loading={processingRequestId === request.id}
                      fullWidth={false}
                      style={styles.requestButton}
                    />
                    <Button
                      label="Từ chối"
                      variant="danger"
                      onPress={() => handleReject(request.id)}
                      loading={processingRequestId === request.id}
                      fullWidth={false}
                      style={styles.requestButton}
                    />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyText}>Không có yêu cầu rút tiền đang chờ</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          </View>

          {loadingTransactions ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : transactions.length > 0 ? (
            transactions.map((item) => <TransactionItem key={item.id} transaction={item} />)
          ) : (
            <View style={styles.emptyHistory}>
              <Ionicons name="receipt-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: fontSize.md, color: colors.error, marginBottom: spacing.md },
  backBtnError: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  backBtnText: { color: colors.primary, fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, paddingTop: spacing.xl,
    backgroundColor: colors.primary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  settingBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: '#fff', textAlign: 'center' },
  
  scrollContent: { paddingBottom: spacing.xl },
  balanceCard: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  balanceLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  balance: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: spacing.md },
  codeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
  },
  codeText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginHorizontal: spacing.md },
  actionButton: { flex: 1 },

  section: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  sectionSub: { fontSize: fontSize.xs, color: colors.textSecondary },
  
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm
  },
  avatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.primaryDark },
  memberInfo: { flex: 1 },
  memberName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  memberRole: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  requestCard: { backgroundColor: '#F7FDF6', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  requestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  requestTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  requestAmount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  requestNote: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  requestButton: { flex: 1 },

  emptyHistory: { alignItems: 'center', paddingVertical: spacing.xl, opacity: 0.6 },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
});
