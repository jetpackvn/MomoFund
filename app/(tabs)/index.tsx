import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { fundService } from '@/services/fundService';
import { Fund } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

function FundCard({ fund, onPress }: { fund: Fund; onPress: () => void }) {
  const isOwner = fund.role === 'owner';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIcon, { backgroundColor: isOwner ? colors.primary : colors.primaryLight }]}>
          <Ionicons name={isOwner ? 'shield-checkmark' : 'people'} size={20} color={isOwner ? '#fff' : colors.primaryDark} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{fund.name}</Text>
          <Text style={styles.cardOwner}>{isOwner ? 'Bạn là chủ quỹ' : `Chủ: ${fund.ownerName}`}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: fund.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.statusText, { color: fund.status === 'active' ? colors.primary : colors.error }]}>
            {fund.status === 'active' ? 'Đang mở' : 'Đã đóng'}
          </Text>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.balanceLabel}>Số dư</Text>
        <Text style={styles.balance}>{fund.balance?.toLocaleString('vi-VN')} ₫</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFunds = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fundService.getUserFunds(user.uid);
      // Gắn role vào fund để hiển thị (virtual field, không lưu Firestore)
      const withRole = data.map(f => ({ ...f, role: f.ownerId === user.uid ? 'owner' as const : 'member' as const }));
      setFunds(withRole);
    } catch (e) {
      console.error('loadFunds error', e);
      router.replace('/error');
    }
  }, [user]);

  useEffect(() => {
    loadFunds().finally(() => setLoading(false));
  }, [loadFunds]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFunds();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Stats banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerGreet}>Xin chào, {user?.displayName?.split(' ').pop()} 👋</Text>
          <Text style={styles.bannerSub}>{funds.length} quỹ đang tham gia</Text>
        </View>
        <View style={styles.bannerIcon}>
          <Ionicons name="trending-up" size={28} color={colors.primary} />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/fund/create')}>
          <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.actionText}>Tạo quỹ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/fund/join')}>
          <Ionicons name="enter-outline" size={22} color={colors.primary} />
          <Text style={styles.actionText}>Tham gia</Text>
        </TouchableOpacity>
      </View>

      

      {/* Fund list */}
      <FlatList
        data={funds}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FundCard fund={item} onPress={() => router.push(`/fund/${item.id}`)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={funds.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState 
            iconName="wallet-outline"
            title="Chưa có quỹ nào"
            description="Tạo quỹ mới hoặc tham gia bằng mã code do bạn bè chia sẻ."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, marginHorizontal: spacing.md, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  bannerGreet: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  bannerSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  bannerIcon: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  actions: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.surface, borderRadius: radius.md, paddingVertical: 12,
    borderWidth: 1.5, borderColor: colors.primary,
  },
  actionText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  
  list: { padding: spacing.md, gap: spacing.sm },
  emptyContainer: { flex: 1 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardIcon: { width: 40, height: 40, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardOwner: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  statusText: { fontSize: fontSize.xs, fontWeight: '600' },
  cardBottom: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  balance: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
});
