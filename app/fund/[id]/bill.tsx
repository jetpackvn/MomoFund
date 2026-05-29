import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';

export default function BillScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const services = [
    { icon: 'bulb-outline', label: 'Điện', color: '#FF9800', badge: 'Giảm 3K' },
    { icon: 'water-outline', label: 'Nước', color: '#2196F3', badge: 'Giảm 3K' },
    { icon: 'globe-outline', label: 'Internet', color: '#4CAF50', badge: 'Giảm 50%' },
    { icon: 'home-outline', label: 'Thanh toán\nkhoản vay', color: '#FF9800' },
    { icon: 'phone-portrait-outline', label: 'Di động\ntrả sau', color: '#E91E63' },
    { icon: 'school-outline', label: 'Thanh toán\nhọc phí', color: '#FF9800', badge: 'Giảm 50%' },
    { icon: 'tv-outline', label: 'Truyền hình', color: '#E91E63' },
    { icon: 'car-sport-outline', label: 'Thu phí\nkhông dừng', color: '#FF9800' },
    { icon: 'business-outline', label: 'Chung cư', color: '#2196F3' },
    { icon: 'medkit-outline', label: 'Dịch vụ y tế\nvà làm đẹp', color: '#E91E63' },
    { icon: 'umbrella-outline', label: 'Thanh toán\nphí bảo hiểm', color: '#FF9800' },
    { icon: 'search-outline', label: 'Tìm kiếm\ndịch vụ', color: '#424242' },
  ];

  const handleServiceClick = (serviceLabel: string) => {
    const cleanLabel = serviceLabel.replace('\n', ' ');
    router.push(`/transaction/withdraw?fundId=${id}&reason=Thanh toán hóa đơn: ${cleanLabel}`);
  };

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán hoá đơn</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.push(`/fund/${id}/report`)}>
              <Ionicons name="headset-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Ưu đãi của bạn */}
          <View style={styles.card}>
            <View style={styles.offerHeader}>
              <Text style={styles.cardTitle}>Ưu đãi của bạn</Text>
              <Ionicons name="chevron-forward" size={16} color="#E91E63" />
            </View>
            <View style={styles.offerBox}>
              <View style={styles.offerIconBox}>
                <Ionicons name="globe-outline" size={24} color="#00BCD4" />
                <Text style={styles.offerIconText}>Internet</Text>
              </View>
              <View style={styles.offerDetails}>
                <Text style={styles.offerTitle}>Giảm 3K</Text>
                <Text style={styles.offerDesc}>Giảm 3K Cho đơn từ 6K</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.offerLink}>Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Danh sách dịch vụ */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Danh sách dịch vụ</Text>
            <View style={styles.grid}>
              {services.map((item, index) => (
                <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleServiceClick(item.label)}>
                  <View style={styles.iconWrapper}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name={item.icon as any} size={30} color={item.color} />
                  </View>
                  <Text style={styles.gridLabel} textAlign="center">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vì sao nên chọn MoMo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vì sao nên chọn MoMo?</Text>
            <View style={styles.bannerBox}>
              <Ionicons name="gift-outline" size={40} color="#E91E63" style={{ marginRight: 12 }} />
              <Text style={styles.bannerText}>Vô vàn ưu đãi hấp dẫn khi thanh toán hoá đơn trên MoMo.</Text>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Tabs */}
        <View style={styles.bottomTabs}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="receipt" size={24} color="#E91E63" />
            <Text style={[styles.tabText, { color: '#E91E63' }]}>Thanh toán hoá đơn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="compass-outline" size={24} color="#757575" />
            <Text style={styles.tabText}>Khám phá</Text>
          </TouchableOpacity>
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
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backCircle: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm,
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
  iconBtnRight: { padding: 4 },
  divider: { width: 1, height: 16, backgroundColor: colors.border, marginHorizontal: 4 },

  scrollContent: { padding: spacing.md, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: spacing.md },

  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  offerIconBox: { alignItems: 'center', marginRight: spacing.md },
  offerIconText: { fontSize: 10, color: '#757575', marginTop: 4 },
  offerDetails: { flex: 1 },
  offerTitle: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 2 },
  offerDesc: { fontSize: 12, color: '#757575' },
  offerLink: { fontSize: 13, fontWeight: '600', color: '#E91E63' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 8,
    height: 44,
    justifyContent: 'flex-end',
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#FF3D00',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  gridLabel: {
    fontSize: 12,
    color: '#424242',
    lineHeight: 16,
  },

  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bannerText: { flex: 1, fontSize: 14, color: '#212121', lineHeight: 20 },

  bottomTabs: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: { fontSize: 12, marginTop: 4, color: '#757575' },
});
