import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';

type Tab = 'Đang góp' | 'Định kỳ' | 'Một lần' | 'Đã xong';

export default function FundRemindScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Đang góp');
  const tabs: Tab[] = ['Đang góp', 'Định kỳ', 'Một lần', 'Đã xong'];

  return (
    <SafeAreaView style={styles.safeArea}>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Thu quỹ dễ như chơi!</Text>
            <Text style={styles.bannerDesc}>
              Nhắc góp quỹ ngay để theo dõi tiến độ góp quỹ, kể cả là ai góp rồi, ai chưa nha!
            </Text>
          </View>
          <View style={styles.bannerIconContainer}>
            {/* Giả lập hình ảnh */}
            <Ionicons name="notifications" size={60} color="#FF8A65" style={{ opacity: 0.8 }} />
          </View>
        </View>

        {/* Danh sách lời nhắc */}
        <Text style={styles.sectionTitle}>Danh sách lời nhắc (0)</Text>
        
        {/* Tabs / Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrapper} contentContainerStyle={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIllustration}>
            {/* Mock hình vẽ empty state bằng icon */}
            <Ionicons name="calendar-outline" size={100} color="#F8BBD0" />
            <Ionicons name="checkmark-done-circle" size={50} color="#AED581" style={{ position: 'absolute', bottom: -10, left: -10 }} />
          </View>
          <Text style={styles.emptyTitle}>Thu quỹ dễ như chơi</Text>
          <Text style={styles.emptyDesc}>
            Nhắc góp quỹ ngay để theo dõi tiến độ góp quỹ của từng thành viên thật dễ dàng, kể cả là ai góp rồi, ai chưa nha!
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Button 
          label="Tạo lời nhắc" 
          icon={<Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />}
          onPress={() => {}} 
          style={{ backgroundColor: '#E91E63' }} // Màu hồng đặc trưng Momo
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFF0F5', // Nền hồng nhạt
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  iconBtnRight: { padding: 6 },
  divider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: 4 },

  scrollContent: { padding: spacing.md, paddingBottom: 100 },

  banner: {
    backgroundColor: '#FFF9C4', // Vàng nhạt
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  bannerTextContainer: { flex: 1, paddingRight: spacing.md },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#424242', marginBottom: spacing.xs },
  bannerDesc: { fontSize: 12, color: '#616161', lineHeight: 18 },
  bannerIconContainer: {
    width: 80, height: 80,
    backgroundColor: '#FFCCBC',
    borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },

  tabsWrapper: { marginBottom: spacing.xl },
  tabsContainer: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  tabChipActive: { backgroundColor: '#FFF0F5', borderColor: '#E91E63', borderWidth: 1, paddingHorizontal: 15, paddingVertical: 7 },
  tabChipText: { fontSize: 14, color: '#616161', fontWeight: '500' },
  tabChipTextActive: { color: '#E91E63', fontWeight: '600' },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIllustration: { marginBottom: spacing.xl, position: 'relative' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

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
