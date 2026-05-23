import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { transactionService } from '@/services/transactionService';
import { Transaction } from '@/types';
import TransactionItem from '@/components/ui/TransactionItem';
import { useFocusEffect } from '@react-navigation/native';
import { FundPageHeader } from '@/components/common/FundPageHeader';

export default function FundHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await transactionService.getTransactions(id);
      setTransactions(data);
    } catch (err) {
      console.error('loadTransactions history', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = t.createdAt instanceof Date ? t.createdAt : (t.createdAt as any)?.toDate?.() || new Date();
      return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  const { totalIn, totalOut } = useMemo(() => {
    let _in = 0;
    let _out = 0;
    currentMonthTransactions.forEach(t => {
      if (t.type === 'contribution') _in += t.amount;
      else _out += t.amount;
    });
    return { totalIn: _in, totalOut: _out };
  }, [currentMonthTransactions]);

  const maxAmount = Math.max(totalIn, totalOut) || 1;
  const inHeight = totalIn > 0 ? (totalIn / maxAmount) * 100 : 5;
  const outHeight = totalOut > 0 ? (totalOut / maxAmount) * 100 : 5;

  // Nhóm giao dịch theo ngày
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, { dateObj: Date, data: Transaction[] }> = {};
    
    currentMonthTransactions.forEach(t => {
      const dateObj = t.createdAt instanceof Date ? t.createdAt : (t.createdAt as any)?.toDate?.() || new Date();
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      
      if (!groups[dateStr]) {
        groups[dateStr] = { dateObj, data: [] };
      }
      groups[dateStr].data.push(t);
    });
    
    const daysOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    return Object.keys(groups).map(dateStr => {
      const group = groups[dateStr];
      const dayName = daysOfWeek[group.dateObj.getDay()];
      
      // Tính tổng thu chi trong ngày
      let dayIn = 0;
      let dayOut = 0;
      group.data.forEach(t => {
        if (t.type === 'contribution') dayIn += t.amount;
        else dayOut += t.amount;
      });

      return {
        dateStr,
        dayName,
        dayIn,
        dayOut,
        timestamp: group.dateObj.getTime(),
        data: group.data
      };
    }).sort((a, b) => b.timestamp - a.timestamp); // Sắp xếp giảm dần
  }, [currentMonthTransactions]);

  // Phân loại chi tiêu (Giả lập vì model hiện tại có thể chưa có trường category)
  const categories = useMemo(() => {
    if (totalOut === 0) return [];
    return [
      { name: 'Ăn uống', amount: totalOut * 0.4, color: '#FF9800', icon: 'restaurant-outline' },
      { name: 'Sinh hoạt', amount: totalOut * 0.3, color: '#2196F3', icon: 'home-outline' },
      { name: 'Khác', amount: totalOut * 0.3, color: '#9C27B0', icon: 'grid-outline' },
    ];
  }, [totalOut]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Lịch sử giao dịch" />

      <View style={styles.monthSelectorWrapper}>
        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.monthBadge}>
          <Text style={styles.monthText}>
            Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
          </Text>
        </View>
        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Biểu đồ nhanh */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tổng tiền ra/vào</Text>
            <Ionicons name="bar-chart-outline" size={20} color={colors.textSecondary} />
          </View>
          
          <View style={styles.chartArea}>
            <View style={styles.barColumn}>
              <Text style={[styles.barValue, { color: '#4CAF50' }]}>+{totalIn.toLocaleString('vi-VN')}đ</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${inHeight}%`, backgroundColor: '#4CAF50' }]} />
              </View>
              <Text style={styles.barLabel}>Tiền vào</Text>
            </View>
            <View style={styles.barColumn}>
              <Text style={[styles.barValue, { color: '#F44336' }]}>-{totalOut.toLocaleString('vi-VN')}đ</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${outHeight}%`, backgroundColor: '#F44336' }]} />
              </View>
              <Text style={styles.barLabel}>Tiền ra</Text>
            </View>
          </View>
        </View>

        {/* Danh mục chi tiêu */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Danh mục chi tiêu</Text>
            <TouchableOpacity><Text style={styles.linkText}>Chi tiết</Text></TouchableOpacity>
          </View>
          
          {categories.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map((cat, idx) => (
                <View key={idx} style={styles.categoryItem}>
                  <View style={[styles.categoryIconBox, { backgroundColor: `${cat.color}20` }]}>
                    <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <Text style={styles.categoryAmount}>{cat.amount.toLocaleString('vi-VN')}đ</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCategories}>
              <Text style={styles.emptyCategoriesText}>Chưa có khoản chi tiêu nào trong tháng.</Text>
            </View>
          )}
        </View>

        {/* Danh sách giao dịch theo ngày */}
        <View style={styles.transactionListHeader}>
          <Text style={styles.cardTitle}>Giao dịch</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map((group, idx) => (
            <View key={idx} style={styles.dateGroup}>
              <View style={styles.dateGroupHeader}>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateDay}>{group.dateStr.split('/')[0]}</Text>
                  <View>
                    <Text style={styles.dateDayName}>{group.dayName}</Text>
                    <Text style={styles.dateMonthYear}>tháng {group.dateStr.split('/')[1]}, {group.dateStr.split('/')[2]}</Text>
                  </View>
                </View>
                <View style={styles.dateSummary}>
                  {group.dayIn > 0 && <Text style={styles.summaryIn}>+{group.dayIn.toLocaleString('vi-VN')}đ</Text>}
                  {group.dayOut > 0 && <Text style={styles.summaryOut}>-{group.dayOut.toLocaleString('vi-VN')}đ</Text>}
                </View>
              </View>
              
              <View style={styles.transactionsContainer}>
                {group.data.map(item => (
                  <TransactionItem key={item.id} transaction={item} />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Ionicons name="receipt-outline" size={48} color="#E0E0E0" />
            <Text style={styles.emptyText}>Chưa có giao dịch nào trong tháng này</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  monthSelectorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  monthBadge: {
    backgroundColor: '#FFF0F5',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginHorizontal: spacing.sm,
  },
  monthText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  arrowBtn: { padding: spacing.sm },

  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  linkText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  chartArea: { flexDirection: 'row', justifyContent: 'center', height: 160, gap: 60 },
  barColumn: { alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: {
    width: 40, height: 110,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginVertical: spacing.sm,
  },
  barFill: { width: '100%', borderRadius: 6 },
  barValue: { fontSize: 12, fontWeight: '700' },
  barLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },

  categoriesScroll: { flexDirection: 'row' },
  categoryItem: { alignItems: 'center', marginRight: spacing.lg, width: 80 },
  categoryIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  categoryName: { fontSize: 12, color: colors.text, fontWeight: '500', marginBottom: 2 },
  categoryAmount: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  emptyCategories: { paddingVertical: spacing.md, alignItems: 'center' },
  emptyCategoriesText: { fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' },

  transactionListHeader: { paddingHorizontal: spacing.xs, paddingBottom: spacing.md, paddingTop: spacing.sm },
  
  dateGroup: { marginBottom: spacing.lg },
  dateGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  dateInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateDay: { fontSize: 24, fontWeight: '800', color: colors.text },
  dateDayName: { fontSize: 14, fontWeight: '600', color: colors.text },
  dateMonthYear: { fontSize: 12, color: colors.textSecondary },
  dateSummary: { alignItems: 'flex-end' },
  summaryIn: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  summaryOut: { fontSize: 13, fontWeight: '600', color: '#F44336' },

  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },

  emptyHistory: { alignItems: 'center', paddingVertical: spacing.xl, marginTop: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.md, fontWeight: '500' },
});
