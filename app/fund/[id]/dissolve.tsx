import { FundPageHeader } from '@/components/common/FundPageHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { fundService } from '@/services/fundService';
import { memberService } from '@/services/memberService';
import { transactionService } from '@/services/transactionService';
import { FundMember } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type SplitMode = 'equal' | 'suggested' | 'custom';

interface MemberAllocation {
  userId: string;
  displayName: string;
  amount: number;
  contributedAmount: number; // Tổng đóng góp
}

export default function DissolveFundScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const router = useRouter();
  const { fund } = useFund(id);
  const { user } = useAuth();

  const [members, setMembers] = useState<FundMember[]>([]);
  const [allocations, setAllocations] = useState<MemberAllocation[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [isLoading, setIsLoading] = useState(true);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const balance = fund?.balance ?? 0;

  // Tải danh sách thành viên và lịch sử đóng góp
  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const fetchedMembers = await memberService.getFundMembers(id);
      setMembers(fetchedMembers);

      // Lấy lịch sử giao dịch để tính tổng đóng góp của mỗi người
      const transactions = await transactionService.getTransactions(id);
      const contributionMap: Record<string, number> = {};
      transactions.forEach((tx) => {
        if (tx.type === 'contribution') {
          contributionMap[tx.userId] = (contributionMap[tx.userId] ?? 0) + tx.amount;
        }
      });

      const allocs: MemberAllocation[] = fetchedMembers.map((m) => ({
        userId: m.userId,
        displayName: m.displayName || 'Người dùng',
        amount: 0,
        contributedAmount: contributionMap[m.userId] ?? 0,
      }));

      setAllocations(allocs);
      recalculate('equal', allocs, balance);
    } catch (err) {
      console.error('loadData error', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán phân bổ theo mode
  const recalculate = (
    mode: SplitMode,
    allocs: MemberAllocation[],
    totalBalance: number
  ) => {
    if (allocs.length === 0) return;

    let updated: MemberAllocation[];

    if (mode === 'equal') {
      // Chia đều
      const perPerson = Math.floor(totalBalance / allocs.length);
      const remainder = totalBalance - perPerson * allocs.length;
      updated = allocs.map((a, idx) => ({
        ...a,
        amount: perPerson + (idx === 0 ? remainder : 0),
      }));
    } else if (mode === 'suggested') {
      // Chia theo tỉ lệ đóng góp
      const totalContributed = allocs.reduce((sum, a) => sum + a.contributedAmount, 0);
      if (totalContributed === 0) {
        // Nếu không ai đóng gì thì chia đều
        const perPerson = Math.floor(totalBalance / allocs.length);
        const remainder = totalBalance - perPerson * allocs.length;
        updated = allocs.map((a, idx) => ({
          ...a,
          amount: perPerson + (idx === 0 ? remainder : 0),
        }));
      } else {
        let distributed = 0;
        updated = allocs.map((a, idx) => {
          if (idx === allocs.length - 1) {
            return { ...a, amount: totalBalance - distributed };
          }
          const portion = Math.floor((a.contributedAmount / totalContributed) * totalBalance);
          distributed += portion;
          return { ...a, amount: portion };
        });
      }
    } else {
      // Custom — giữ nguyên
      updated = allocs;
    }

    setAllocations(updated);

    // Sync custom inputs
    if (mode !== 'custom') {
      const inputs: Record<string, string> = {};
      updated.forEach((a) => {
        inputs[a.userId] = a.amount.toString();
      });
      setCustomInputs(inputs);
    }
  };

  const handleModeChange = (mode: SplitMode) => {
    setSplitMode(mode);
    recalculate(mode, allocations, balance);
  };

  const handleCustomInput = (userId: string, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setCustomInputs((prev) => ({ ...prev, [userId]: cleaned }));

    const parsed = parseInt(cleaned || '0', 10);
    setAllocations((prev) =>
      prev.map((a) => (a.userId === userId ? { ...a, amount: parsed } : a))
    );
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const isCustomValid = splitMode !== 'custom' || totalAllocated === balance;

  const handleDisband = () => {
    if (!isCustomValid) {
      Alert.alert(
        'Tổng không khớp',
        `Tổng tiền đã phân bổ (${totalAllocated.toLocaleString('vi-VN')} ₫) phải bằng số dư quỹ (${balance.toLocaleString('vi-VN')} ₫).`
      );
      return;
    }

    Alert.alert(
      '⚠️ Xác nhận giải tán quỹ',
      `Bạn sắp giải tán quỹ "${fund?.name}". Hành động này KHÔNG THỂ hoàn tác. Toàn bộ dữ liệu giao dịch và thành viên sẽ bị xóa vĩnh viễn.\n\nBạn có chắc chắn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Giải tán',
          style: 'destructive',
          onPress: confirmDisband,
        },
      ]
    );
  };

  const confirmDisband = async () => {
    if (!id) return;
    setIsDisbanding(true);
    try {
      await fundService.disbandFund(
        id,
        allocations.map((a) => ({
          userId: a.userId,
          displayName: a.displayName,
          amount: a.amount,
        })),
        user?.uid
      );
      Alert.alert('Thành công', 'Quỹ đã được giải tán thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể giải tán quỹ. Vui lòng thử lại.');
      setIsDisbanding(false);
    }
  };

  if (isLoading || !fund) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FundPageHeader title="Giải tán quỹ" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Giải tán quỹ" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={24} color="#FF6B35" style={{ marginRight: 10 }} />
            <Text style={styles.warningText}>
              Giải tán quỹ sẽ xóa toàn bộ dữ liệu vĩnh viễn. Hãy cân nhắc kỹ trước khi thực hiện.
            </Text>
          </View>

          {/* Số dư hiện tại */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Số dư quỹ cần chia</Text>
            <Text style={styles.balanceAmount}>{balance.toLocaleString('vi-VN')} ₫</Text>
            <Text style={styles.balanceSubLabel}>{members.length} thành viên</Text>
          </View>

          {/* Chọn phương thức chia */}
          <Text style={styles.sectionTitle}>Chọn phương thức chia tiền</Text>

          <TouchableOpacity
            style={[styles.optionCard, splitMode === 'equal' && styles.optionCardActive]}
            onPress={() => handleModeChange('equal')}
          >
            <View style={styles.optionIconBox}>
              <Ionicons name="people" size={22} color={splitMode === 'equal' ? '#fff' : colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, splitMode === 'equal' && styles.optionTitleActive]}>
                Chia đều
              </Text>
              <Text style={styles.optionDesc}>Mỗi người nhận số tiền bằng nhau</Text>
            </View>
            <View style={[styles.radioOuter, splitMode === 'equal' && styles.radioOuterActive]}>
              {splitMode === 'equal' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, splitMode === 'suggested' && styles.optionCardActive]}
            onPress={() => handleModeChange('suggested')}
          >
            <View style={[styles.optionIconBox, { backgroundColor: splitMode === 'suggested' ? '#9C27B0' : '#F3E5F5' }]}>
              <Ionicons name="analytics" size={22} color={splitMode === 'suggested' ? '#fff' : '#9C27B0'} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, splitMode === 'suggested' && styles.optionTitleActive]}>
                Chia theo tỉ lệ đề xuất
              </Text>
              <Text style={styles.optionDesc}>Dựa trên tỉ lệ đóng góp của mỗi người</Text>
            </View>
            <View style={[styles.radioOuter, splitMode === 'suggested' && styles.radioOuterActive, splitMode === 'suggested' && { borderColor: '#9C27B0' }]}>
              {splitMode === 'suggested' && <View style={[styles.radioInner, { backgroundColor: '#9C27B0' }]} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, splitMode === 'custom' && styles.optionCardActive, splitMode === 'custom' && { borderColor: '#FF9800' }]}
            onPress={() => handleModeChange('custom')}
          >
            <View style={[styles.optionIconBox, { backgroundColor: splitMode === 'custom' ? '#FF9800' : '#FFF3E0' }]}>
              <Ionicons name="create" size={22} color={splitMode === 'custom' ? '#fff' : '#FF9800'} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, splitMode === 'custom' && styles.optionTitleActive]}>
                Tự điều chỉnh
              </Text>
              <Text style={styles.optionDesc}>Nhập thủ công số tiền cho từng người</Text>
            </View>
            <View style={[styles.radioOuter, splitMode === 'custom' && styles.radioOuterActive, splitMode === 'custom' && { borderColor: '#FF9800' }]}>
              {splitMode === 'custom' && <View style={[styles.radioInner, { backgroundColor: '#FF9800' }]} />}
            </View>
          </TouchableOpacity>

          {/* Bảng phân bổ */}
          <Text style={styles.sectionTitle}>Phân bổ tiền hoàn trả</Text>

          <View style={styles.allocationCard}>
            {allocations.map((alloc, index) => (
              <View
                key={alloc.userId}
                style={[styles.memberRow, index < allocations.length - 1 && styles.memberRowBorder]}
              >
                {/* Avatar */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {alloc.displayName?.trim()?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{alloc.displayName || 'Người dùng'}</Text>
                  {splitMode === 'suggested' && (
                    <Text style={styles.memberContrib}>
                      Đã góp: {alloc.contributedAmount.toLocaleString('vi-VN')} ₫
                    </Text>
                  )}
                </View>

                {/* Số tiền */}
                {splitMode === 'custom' ? (
                  <View style={styles.customInputWrapper}>
                    <TextInput
                      style={styles.customInput}
                      value={customInputs[alloc.userId] ?? '0'}
                      onChangeText={(v) => handleCustomInput(alloc.userId, v)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.currencyLabel}>₫</Text>
                  </View>
                ) : (
                  <Text style={styles.memberAmount}>
                    {alloc.amount.toLocaleString('vi-VN')} ₫
                  </Text>
                )}
              </View>
            ))}

            {/* Tổng kiểm tra (custom mode) */}
            {splitMode === 'custom' && (
              <View style={[styles.totalRow, !isCustomValid && styles.totalRowError]}>
                <Text style={[styles.totalLabel, !isCustomValid && styles.totalLabelError]}>
                  Tổng đã phân bổ
                </Text>
                <Text style={[styles.totalAmount, !isCustomValid && styles.totalAmountError]}>
                  {totalAllocated.toLocaleString('vi-VN')} / {balance.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
            )}
          </View>

          {splitMode === 'suggested' && (
            <View style={styles.formulaBox}>
              <Ionicons name="information-circle-outline" size={16} color="#9C27B0" style={{ marginRight: 6 }} />
              <Text style={styles.formulaText}>
                Công thức: <Text style={{ fontWeight: '700' }}>Số tiền = (Đóng góp / Tổng đóng góp) × Số dư</Text>
              </Text>
            </View>
          )}

          {/* Nút giải tán */}
          <TouchableOpacity
            style={[styles.disbandBtn, (!isCustomValid || isDisbanding) && styles.disbandBtnDisabled]}
            onPress={handleDisband}
            disabled={!isCustomValid || isDisbanding}
          >
            {isDisbanding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.disbandBtnText}>Xác nhận giải tán quỹ</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  warningText: { flex: 1, fontSize: 13, color: '#BF360C', lineHeight: 18 },

  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: '800' },
  balanceSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: '#FFF5F9' },

  optionIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  optionTitleActive: { color: colors.primary },
  optionDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: { borderColor: colors.primary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },

  allocationCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: colors.text },
  memberContrib: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  memberAmount: { fontSize: 15, fontWeight: '700', color: colors.primary },

  customInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 110,
  },
  customInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9800',
    minWidth: 70,
    textAlign: 'right',
    padding: 0,
  },
  currencyLabel: { fontSize: 13, color: colors.textSecondary, marginLeft: 4 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F9F9F9',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalRowError: { backgroundColor: '#FFF3F3' },
  totalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  totalLabelError: { color: colors.error },
  totalAmount: { fontSize: 14, fontWeight: '700', color: colors.success },
  totalAmountError: { color: colors.error },

  formulaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E5F5',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  formulaText: { flex: 1, fontSize: 12, color: '#6A1B9A', lineHeight: 18 },

  disbandBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  disbandBtnDisabled: { opacity: 0.5 },
  disbandBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
