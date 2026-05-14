import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { FundMember } from '@/types';
import { colors, fontSize, spacing, radius } from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';

export default function FundDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fund, loading: fundLoading, error } = useFund(id);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);

  useEffect(() => {
    if (id) {
      memberService.getFundMembers(id)
        .then(setMembers)
        .catch(console.error)
        .finally(() => setMembersLoading(false));
    }
  }, [id]);

  const handleCopyCode = async () => {
    if (fund?.code) {
      await Clipboard.setStringAsync(fund.code);
      Alert.alert('Thành công', 'Đã sao chép mã quỹ');
    }
  };

  if (fundLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{fund.name}</Text>
        <TouchableOpacity style={styles.settingBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Số dư quỹ</Text>
        <Text style={styles.balance}>{fund.balance?.toLocaleString('vi-VN')} ₫</Text>
        <TouchableOpacity style={styles.codeBadge} onPress={handleCopyCode}>
          <Ionicons name="copy-outline" size={16} color={colors.primary} />
          <Text style={styles.codeText}>Mã: {fund.code}</Text>
        </TouchableOpacity>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thành viên ({fund.memberCount})</Text>
        </View>
        
        {membersLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
        ) : (
          <FlatList
            data={members}
            keyExtractor={item => item.userId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.memberRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.displayName?.charAt(0).toUpperCase() || 'U'}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.displayName}</Text>
                  <Text style={styles.memberRole}>{item.role === 'owner' ? 'Trưởng quỹ' : 'Thành viên'}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* History Placeholder Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
        </View>
        <View style={styles.emptyHistory}>
          <Ionicons name="receipt-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      </View>

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
  
  balanceCard: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  balanceLabel: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xs },
  balance: { fontSize: 36, fontWeight: '800', color: '#fff', marginBottom: spacing.md },
  codeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
  },
  codeText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },

  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm
  },
  avatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.primaryDark },
  memberInfo: { flex: 1 },
  memberName: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text },
  memberRole: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  emptyHistory: { alignItems: 'center', paddingVertical: spacing.xl, opacity: 0.6 },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm }
});
