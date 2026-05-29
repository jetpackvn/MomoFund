import { FundPageHeader } from '@/components/common/FundPageHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { fundService } from '@/services/fundService';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Preset nhanh
const QUICK_AMOUNTS = [
  { label: '1 triệu', value: 1_000_000 },
  { label: '5 triệu', value: 5_000_000 },
  { label: '10 triệu', value: 10_000_000 },
  { label: '50 triệu', value: 50_000_000 },
];

export default function FundGoalScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const router = useRouter();
  const { fund } = useFund(id);
  const { user } = useAuth();

  const isOwner = !!fund && !!user && fund.ownerId === user.uid;

  // State
  const [targetAmount, setTargetAmount] = useState('');
  const [targetName, setTargetName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Đọc mục tiêu hiện tại từ fund (nếu có)
  useEffect(() => {
    if (fund) {
      const f = fund as any;
      if (f.goalAmount) setTargetAmount(f.goalAmount.toString());
      if (f.goalName) setTargetName(f.goalName);
      if (f.goalDeadline) setDeadline(f.goalDeadline);
    }
  }, [fund]);

  const balance = fund?.balance ?? 0;
  const target = parseInt(targetAmount.replace(/\D/g, '') || '0', 10);
  const progress = target > 0 ? Math.min(balance / target, 1) : 0;
  const remaining = Math.max(target - balance, 0);
  const progressPct = Math.round(progress * 100);

  const handleAmountChange = (val: string) => {
    const digits = val.replace(/\D/g, '');
    setTargetAmount(digits);
  };

  const formatAmount = (val: string) => {
    const num = parseInt(val || '0', 10);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('vi-VN');
  };

  const handleSave = async () => {
    if (!id) return;
    if (!targetName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên mục tiêu.');
      return;
    }
    if (target <= 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số tiền mục tiêu.');
      return;
    }

    setIsSaving(true);
    try {
      await fundService.updateFund(id, {
        goalName: targetName.trim(),
        goalAmount: target,
        goalDeadline: deadline.trim(),
      } as any);
      Alert.alert('Thành công', 'Đã lưu mục tiêu quỹ!');
      router.back();
    } catch (err: any) {
      console.error('saveGoal error', err);
      router.replace('/error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveGoal = () => {
    Alert.alert('Xoá mục tiêu', 'Bạn có chắc muốn xoá mục tiêu này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          try {
            await fundService.updateFund(id, {
              goalName: '',
              goalAmount: 0,
              goalDeadline: '',
            } as any);
            setTargetAmount('');
            setTargetName('');
            setDeadline('');
            Alert.alert('Đã xoá', 'Mục tiêu đã được xoá.');
          } catch (err: any) {
              console.error('removeGoal error', err);
              router.replace('/error');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Đặt mục tiêu" />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.goalIconBox}>
              <Ionicons name="trophy" size={28} color="#FFD700" />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle} numberOfLines={1}>
                {targetName || 'Chưa có mục tiêu'}
              </Text>
              <Text style={styles.progressSub}>
                {balance.toLocaleString('vi-VN')} ₫ / {target > 0 ? target.toLocaleString('vi-VN') + ' ₫' : '—'}
              </Text>
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` as any }]} />
          </View>

          {target > 0 && (
            <View style={styles.progressFooter}>
              <Text style={styles.progressFooterText}>
                Còn thiếu: <Text style={{ fontWeight: '700', color: colors.primary }}>{remaining.toLocaleString('vi-VN')} ₫</Text>
              </Text>
              {deadline ? (
                <Text style={styles.progressFooterText}>Hạn: <Text style={{ fontWeight: '600' }}>{deadline}</Text></Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thiết lập mục tiêu</Text>

          {/* Tên mục tiêu */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="flag" size={14} color={colors.primary} /> Tên mục tiêu
            </Text>
            <TextInput
              style={styles.input}
              value={targetName}
              onChangeText={setTargetName}
              placeholder="VD: Du lịch Đà Lạt, Quỹ khẩn cấp..."
              placeholderTextColor="#BDBDBD"
              editable={isOwner}
            />
          </View>

          {/* Số tiền mục tiêu */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="wallet" size={14} color={colors.primary} /> Số tiền mục tiêu
            </Text>
            <View style={styles.amountInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={targetAmount ? formatAmount(targetAmount) : ''}
                onChangeText={handleAmountChange}
                placeholder="0"
                placeholderTextColor="#BDBDBD"
                keyboardType="numeric"
                editable={isOwner}
              />
              <View style={styles.currencyTag}>
                <Text style={styles.currencyTagText}>₫</Text>
              </View>
            </View>

            {/* Quick pick */}
            {isOwner && (
              <View style={styles.quickRow}>
                {QUICK_AMOUNTS.map((q) => (
                  <TouchableOpacity
                    key={q.value}
                    style={[styles.quickChip, parseInt(targetAmount || '0', 10) === q.value && styles.quickChipActive]}
                    onPress={() => setTargetAmount(q.value.toString())}
                  >
                    <Text style={[styles.quickChipText, parseInt(targetAmount || '0', 10) === q.value && styles.quickChipTextActive]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Hạn chót */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              <Ionicons name="calendar" size={14} color={colors.primary} /> Hạn chót (tuỳ chọn)
            </Text>
            <TextInput
              style={styles.input}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="VD: 31/12/2025"
              placeholderTextColor="#BDBDBD"
              editable={isOwner}
            />
          </View>
        </View>

        {/* Milestones */}
        {target > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cột mốc tiến độ</Text>
            <View style={styles.milestonesCard}>
              {[25, 50, 75, 100].map((pct) => {
                const reached = progressPct >= pct;
                const milestoneAmt = Math.round((target * pct) / 100);
                return (
                  <View key={pct} style={[styles.milestone, pct < 100 && styles.milestoneBorder]}>
                    <View style={[styles.milestoneDot, reached && styles.milestoneDotReached]}>
                      {reached && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={[styles.milestonePct, reached && styles.milestonePctReached]}>{pct}%</Text>
                      <Text style={styles.milestoneAmt}>{milestoneAmt.toLocaleString('vi-VN')} ₫</Text>
                    </View>
                    {reached && <Ionicons name="trophy" size={16} color="#FFD700" />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Actions */}
        {isOwner && (
          <View style={styles.actionsArea}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Ionicons name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>Lưu mục tiêu</Text>
                  </>
              }
            </TouchableOpacity>

            {(fund as any)?.goalAmount > 0 && (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveGoal}>
                <Ionicons name="trash-outline" size={16} color={colors.error} style={{ marginRight: 6 }} />
                <Text style={styles.removeBtnText}>Xoá mục tiêu</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isOwner && (
          <View style={styles.readonlyNote}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.readonlyText}>Chỉ chủ quỹ mới có thể chỉnh sửa mục tiêu.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  progressCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  goalIconBox: {
    width: 50, height: 50, borderRadius: radius.md,
    backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  progressSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  progressPct: { fontSize: 22, fontWeight: '800', color: colors.primary },

  progressBarBg: {
    height: 10, backgroundColor: '#F5F5F5', borderRadius: 5, overflow: 'hidden', marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
    minWidth: 6,
  },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressFooterText: { fontSize: 12, color: colors.textSecondary },

  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: 15, color: colors.text, backgroundColor: '#fff',
  },
  amountInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currencyTag: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center', alignItems: 'center',
  },
  currencyTagText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  quickRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#fff',
  },
  quickChipActive: { borderColor: colors.primary, backgroundColor: '#FFF0F7' },
  quickChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  quickChipTextActive: { color: colors.primary },

  milestonesCard: {
    backgroundColor: '#fff', borderRadius: radius.lg, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  milestone: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  milestoneBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  milestoneDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  milestoneDotReached: { backgroundColor: colors.success },
  milestoneInfo: { flex: 1 },
  milestonePct: { fontSize: 14, fontWeight: '700', color: colors.textSecondary },
  milestonePctReached: { color: colors.success },
  milestoneAmt: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  actionsArea: { gap: spacing.sm },
  saveBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  removeBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.lg, padding: 12,
    backgroundColor: '#FFF5F5',
  },
  removeBtnText: { color: colors.error, fontWeight: '600', fontSize: 14 },

  readonlyNote: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm,
  },
  readonlyText: { flex: 1, fontSize: 13, color: colors.textSecondary },
});
