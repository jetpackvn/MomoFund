import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { memberService } from '@/services/memberService';
import { notificationService } from '@/services/notificationService';
import { useFund } from '@/hooks/useFund';
import { useAuth } from '@/hooks/useAuth';
import { FundMember } from '@/types';
import AppBackground from '@/components/ui/AppBackground';

export default function FundRemindScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  
  const { user } = useAuth();
  const { fund } = useFund(id);

  const [members, setMembers] = useState<FundMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const [reminderName, setReminderName] = useState('Cùng góp quỹ bạn nhé!');
  const [isPeriodic, setIsPeriodic] = useState(false);
  const [amount, setAmount] = useState('0');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const loadData = async () => {
      try {
        const data = await memberService.getFundMembers(id);
        // Loại bỏ chính mình khỏi danh sách nhắc
        const others = data.filter(m => m.userId !== user.uid);
        setMembers(others);
        
        // Mặc định chọn tất cả
        const allIds = new Set(others.map(m => m.userId));
        setSelectedIds(allIds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMembers(false);
      }
    };
    loadData();
  }, [id, user]);

  const toggleSelection = (userId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(userId)) {
      newSet.delete(userId);
    } else {
      newSet.add(userId);
    }
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(newSet => { newSet.clear(); return newSet; });
    } else {
      setSelectedIds(new Set(members.map(m => m.userId)));
    }
  };

  const formatAmount = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    if (!num) return '0';
    return parseInt(num).toLocaleString('vi-VN');
  };

  const handleCreateReminder = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 thành viên để nhắc');
      return;
    }
    
    setSubmitting(true);
    try {
      const cleanAmount = amount.replace(/[^0-9]/g, '');
      const numAmount = cleanAmount ? parseInt(cleanAmount) : 0;
      
      let bodyText = `${user?.displayName || 'Chủ quỹ'} đang nhắc bạn đóng quỹ "${fund?.name || ''}".`;
      if (numAmount > 0) {
        bodyText += ` Số tiền: ${numAmount.toLocaleString('vi-VN')}đ.`;
      }
      if (reminderName) {
        bodyText += `\nLời nhắn: ${reminderName}`;
      }

      const promises = Array.from(selectedIds).map(userId => 
        notificationService.createNotification(
          userId,
          'Nhắc nhở góp quỹ',
          bodyText,
          'contribution',
          id
        )
      );

      await Promise.all(promises);
      Alert.alert('Thành công', 'Đã gửi lời nhắc đến các thành viên được chọn!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo lời nhắc');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nhắc góp quỹ</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="headset-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.push('/')}>
              <Ionicons name="home-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Thông tin lời nhắc */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Thông tin lời nhắc</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.floatingLabel}>Tên lời nhắc ({reminderName.length}/50)</Text>
              <TextInput
                style={styles.input}
                value={reminderName}
                onChangeText={(text) => setReminderName(text.substring(0, 50))}
                placeholder="Nhập tên lời nhắc..."
              />
            </View>
          </View>

          {/* Đặt lời nhắc định kỳ */}
          <View style={styles.card}>
            <View style={styles.periodicRow}>
              <View style={styles.periodicInfo}>
                <Text style={styles.cardSectionTitle}>Đặt lời nhắc định kỳ</Text>
                <Text style={styles.periodicDesc}>MoMo tự động nhắc thành viên theo chu kỳ bạn chọn</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPeriodic(!isPeriodic)}>
                <Ionicons 
                  name={isPeriodic ? "radio-button-on" : "radio-button-off"} 
                  size={28} 
                  color={isPeriodic ? colors.primary : colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Khoản thu */}
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Khoản thu</Text>
            <View style={[styles.inputContainer, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
              <Text style={[styles.floatingLabel, { color: '#E91E63' }]}>Tổng tiền cần thu*</Text>
              <View style={styles.amountInputRow}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={(val) => setAmount(formatAmount(val))}
                  keyboardType="numeric"
                />
                <Text style={styles.currencySymbol}>đ</Text>
              </View>
            </View>

            <View style={styles.membersHeaderRow}>
              <Text style={styles.cardSectionTitle}>Nhắc cho ({selectedIds.size})</Text>
              <TouchableOpacity onPress={toggleAll}>
                <Text style={styles.selectAllText}>
                  {selectedIds.size === members.length ? `Bỏ chọn tất cả (${members.length})` : `Chọn tất cả (${members.length})`}
                </Text>
              </TouchableOpacity>
            </View>

            {loadingMembers ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
            ) : members.length === 0 ? (
              <Text style={styles.emptyMembers}>Không có thành viên nào để nhắc</Text>
            ) : (
              members.map((item) => {
                const isSelected = selectedIds.has(item.userId);
                return (
                  <View key={item.userId} style={styles.memberRow}>
                    <TouchableOpacity onPress={() => toggleSelection(item.userId)} style={{ padding: 4 }}>
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={24} 
                        color={isSelected ? '#E91E63' : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    
                    <View style={styles.memberAvatar}>
                      <Text style={styles.avatarText}>{item.displayName?.substring(0, 2).toUpperCase() || 'U'}</Text>
                    </View>
                    
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{item.displayName}</Text>
                      {/* Fake phone number for UI completeness as requested */}
                      <Text style={styles.memberPhone}>*******691</Text>
                    </View>

                    <View style={styles.memberAmountBox}>
                      <Text style={styles.memberAmountText}>{amount === '0' || amount === '' ? '0đ' : `${amount}đ`}</Text>
                      <View style={styles.memberAmountLine} />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomBar}>
          <Button 
            label="Tạo lời nhắc" 
            onPress={handleCreateReminder} 
            loading={submitting}
            disabled={selectedIds.size === 0 || submitting}
            style={{ 
              backgroundColor: selectedIds.size > 0 ? '#F4F5F7' : '#EEEEEE',
            }}
            textStyle={{ color: selectedIds.size > 0 ? colors.text : colors.textSecondary, fontWeight: '600' }}
          />
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconBtnRight: { padding: 6 },
  divider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: 4 },

  scrollContent: { padding: spacing.md, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardSectionTitle: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 4 },

  inputContainer: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -10, left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#757575',
  },
  input: {
    fontSize: 15,
    color: '#212121',
    paddingVertical: 10,
  },

  periodicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodicInfo: { flex: 1, paddingRight: spacing.md },
  periodicDesc: { fontSize: 13, color: '#757575', marginTop: 2 },

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    paddingVertical: 8,
  },
  currencySymbol: { fontSize: 24, fontWeight: '700', color: '#212121' },

  membersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectAllText: { fontSize: 14, fontWeight: '600', color: '#E91E63' },

  emptyMembers: { textAlign: 'center', color: '#9E9E9E', fontStyle: 'italic', marginTop: spacing.md },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  memberAvatar: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#E91E63' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 2 },
  memberPhone: { fontSize: 12, color: '#9E9E9E' },

  memberAmountBox: { alignItems: 'flex-end', minWidth: 60 },
  memberAmountText: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 2 },
  memberAmountLine: { width: '100%', height: 1, backgroundColor: '#E0E0E0' },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
