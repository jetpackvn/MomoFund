import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { Transaction } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const isContribution = transaction.type === 'contribution';
  const statusColor = transaction.status === 'completed' ? colors.success : colors.warning;

  const createdAt = transaction.createdAt instanceof Date
    ? transaction.createdAt
    : transaction.createdAt && typeof transaction.createdAt === 'object' && 'toDate' in transaction.createdAt
      ? transaction.createdAt.toDate()
      : new Date(transaction.createdAt as string);

  const amountLabel = `${isContribution ? '+' : '-'}${transaction.amount.toLocaleString('vi-VN')} ₫`;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.iconWrapper, { backgroundColor: isContribution ? '#E8F5E9' : '#FFECE3' }]}>
          <Ionicons
            name={isContribution ? 'cash-outline' : 'arrow-down-outline'}
            size={18}
            color={isContribution ? colors.success : colors.error}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{isContribution ? 'Đóng góp' : 'Rút tiền'}</Text>
          <Text style={styles.subtitle}>{transaction.userName}</Text>
          <Text style={styles.date}>{createdAt.toLocaleDateString('vi-VN')}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isContribution ? colors.success : colors.error }]}>{amountLabel}</Text>
        <Text style={[styles.status, { color: statusColor }]}>{transaction.status === 'completed' ? 'Hoàn tất' : 'Chờ duyệt'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  title: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  date: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: fontSize.sm, fontWeight: '700' },
  status: { fontSize: fontSize.xs, fontWeight: '600', marginTop: 4 },
});
