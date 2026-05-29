import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';
import { useAuth } from '@/hooks/useAuth';

export default function TopupScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { user } = useAuth();

  const [selectedPackage, setSelectedPackage] = useState<{name: string, price: number} | null>(null);

  const packages = [
    { name: '1GB', desc: '1 ngày', price: 10000 },
    { name: '1,2GB', desc: '1 ngày', price: 12000 },
    { name: '1.5GB', desc: '30 ngày', price: 15000, cashback: '450đ' },
    { name: '7GB', desc: '7 ngày', price: 35000 },
  ];

  const handleTopup = () => {
    if (!selectedPackage) return;
    router.push(`/transaction/withdraw?fundId=${id}&reason=Nạp điện thoại: Gói ${selectedPackage.name}`);
  };

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Điện thoại - Data 4G/5G</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="star-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.push(`/fund/${id}/report`)}>
              <Ionicons name="headset-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.topTabs}>
          <Text style={styles.topTabText}>Mã thẻ</Text>
          <View style={styles.topTabActive}>
            <Text style={styles.topTabTextActive}>Nạp điện thoại</Text>
          </View>
          <Text style={styles.topTabText}>Nạp data</Text>
          <Text style={styles.topTabText}>Combo</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Phone Input Box */}
          <View style={styles.phoneBox}>
            <View style={styles.networkLogo}>
              <Ionicons name="snow" size={32} color="#E0E0E0" />
            </View>
            <View style={styles.phoneInputArea}>
              <Text style={styles.phoneLabel}>Tôi</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput style={styles.phoneInput} value="0912 616 691" editable={false} />
                <Ionicons name="id-card-outline" size={24} color="#424242" />
              </View>
            </View>
          </View>

          {/* Tier progress */}
          <View style={styles.tierBox}>
            <Ionicons name="phone-portrait" size={32} color="#2196F3" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.tierTitle}>Thuê bao</Text>
                <Text style={styles.tierProgress}><Text style={{color:'#E91E63'}}>10.000</Text> / 70.000đ</Text>
              </View>
              <Text style={styles.tierDesc}>Thăng hạng để nhận xu</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#E91E63" />
          </View>

          {/* Data packages */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gói thường được mua kèm</Text>
            <View style={styles.grid}>
              {packages.map((pkg, idx) => {
                const isSelected = selectedPackage?.name === pkg.name;
                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.pkgCard, isSelected && styles.pkgCardActive]}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <View style={[styles.pkgLeft, isSelected && styles.pkgLeftActive]}>
                      <Text style={[styles.pkgName, isSelected && styles.pkgNameActive]}>{pkg.name}</Text>
                      <Text style={styles.pkgDesc}>{pkg.desc}</Text>
                    </View>
                    <View style={styles.pkgRight}>
                      <Text style={styles.pkgPrice}>{pkg.price.toLocaleString('vi-VN')}đ</Text>
                      {pkg.cashback && (
                        <Text style={styles.pkgCashback}>Hoàn: <Text style={{color:'#4CAF50'}}>{pkg.cashback}</Text></Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tiện ích khác */}
          <Text style={styles.cardTitle}>Tiện ích khác</Text>
          <View style={styles.utilitiesRow}>
            <View style={styles.utilItem}>
              <View style={styles.utilIcon}><Ionicons name="refresh-circle" size={28} color="#E91E63" /></View>
              <Text style={styles.utilText} textAlign="center">Quản lý nạp{'\n'}tự động</Text>
            </View>
            <View style={styles.utilItem}>
              <View style={styles.utilIcon}><Ionicons name="time-outline" size={28} color="#E91E63" /></View>
              <Text style={styles.utilText} textAlign="center">Lịch sử</Text>
            </View>
            <View style={styles.utilItem}>
              <View style={styles.utilIcon}>
                <View style={styles.badge}><Text style={styles.badgeText}>+1,3 Tr</Text></View>
                <Ionicons name="gift-outline" size={28} color="#E91E63" />
              </View>
              <Text style={styles.utilText} textAlign="center">Mời bạn bè</Text>
            </View>
            <View style={styles.utilItem}>
              <View style={styles.utilIcon}><Ionicons name="people-outline" size={28} color="#E91E63" /></View>
              <Text style={styles.utilText} textAlign="center">Cộng đồng</Text>
            </View>
          </View>

        </ScrollView>

        {/* Promo banner fixed */}
        <View style={styles.bottomPromo}>
          <Ionicons name="calendar" size={24} color="#00BCD4" />
          <Text style={styles.bottomPromoText}>Nạp tiền tự động, không bỏ lỡ khuyến mãi</Text>
          <Text style={styles.bottomPromoLink}>Kích hoạt</Text>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>
            {selectedPackage ? `${selectedPackage.price.toLocaleString('vi-VN')}đ` : '0đ'}
          </Text>
          <TouchableOpacity 
            style={[styles.payBtn, selectedPackage && styles.payBtnActive]} 
            disabled={!selectedPackage}
            onPress={handleTopup}
          >
            <Text style={[styles.payBtnText, selectedPackage && styles.payBtnTextActive]}>Nạp ngay</Text>
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
    backgroundColor: '#FFF0F5',
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

  topTabs: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF0F5', paddingTop: spacing.md },
  topTabText: { fontSize: 15, color: '#757575', paddingBottom: spacing.md },
  topTabActive: { borderBottomWidth: 3, borderBottomColor: '#E91E63', paddingBottom: spacing.md - 3 },
  topTabTextActive: { fontSize: 15, fontWeight: '700', color: '#E91E63' },

  scrollContent: { padding: spacing.md, paddingBottom: 150, backgroundColor: '#FAFAFA' },

  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#FCE4EC',
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  networkLogo: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E91E63', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  phoneInputArea: { flex: 1 },
  phoneLabel: { fontSize: 12, color: '#757575', marginBottom: 2 },
  phoneInput: { flex: 1, fontSize: 20, fontWeight: '800', color: '#212121' },

  tierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1, borderColor: '#FCE4EC',
    marginBottom: spacing.lg,
  },
  tierTitle: { fontSize: 14, fontWeight: '800', color: '#212121', marginRight: spacing.md },
  tierProgress: { fontSize: 12, fontWeight: '600', color: '#757575' },
  tierDesc: { fontSize: 12, color: '#616161', marginTop: 4 },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: spacing.md },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  pkgCard: {
    width: '48%',
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pkgCardActive: { borderColor: '#E91E63' },
  pkgLeft: { width: '40%', backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.sm },
  pkgLeftActive: { backgroundColor: '#FCE4EC' },
  pkgName: { fontSize: 16, fontWeight: '900', color: '#1976D2' },
  pkgNameActive: { color: '#E91E63' },
  pkgDesc: { fontSize: 10, color: '#757575' },
  pkgRight: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.sm, backgroundColor: '#fff' },
  pkgPrice: { fontSize: 14, fontWeight: '700', color: '#212121' },
  pkgCashback: { fontSize: 10, color: '#757575', marginTop: 2 },

  utilitiesRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.sm },
  utilItem: { alignItems: 'center', width: 70 },
  utilIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FCE4EC', justifyContent: 'center', alignItems: 'center', marginBottom: 8, position: 'relative' },
  badge: { position: 'absolute', top: -10, right: -15, backgroundColor: '#4CAF50', paddingHorizontal: 4, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  utilText: { fontSize: 12, color: '#424242' },

  bottomPromo: {
    position: 'absolute',
    bottom: 80, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bottomPromoText: { flex: 1, fontSize: 12, color: '#006064', marginLeft: 8 },
  bottomPromoLink: { fontSize: 12, fontWeight: 'bold', color: '#00BCD4' },

  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    paddingBottom: 24,
  },
  totalLabel: { fontSize: 14, color: '#757575', marginRight: 8 },
  totalAmount: { flex: 1, fontSize: 20, fontWeight: '800', color: '#212121' },
  payBtn: { backgroundColor: '#EEEEEE', paddingHorizontal: 32, paddingVertical: 12, borderRadius: radius.full },
  payBtnActive: { backgroundColor: '#E91E63' },
  payBtnText: { color: '#9E9E9E', fontWeight: 'bold', fontSize: 16 },
  payBtnTextActive: { color: '#fff' },
});
