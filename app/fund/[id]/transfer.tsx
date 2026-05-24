import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';

export default function TransferScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const handleBankClick = (bankName: string) => {
    router.push(`/transaction/withdraw?fundId=${id}&reason=Chuyển tiền: ${bankName}`);
  };

  const banks = [
    { icon: 'business', label: 'MBBank', color: '#1E88E5' },
    { icon: 'shield-checkmark', label: 'Vietcombank', color: '#4CAF50' },
    { icon: 'logo-edge', label: 'Techcombank', color: '#F44336' },
    { icon: 'cash', label: 'BIDV', color: '#00BCD4' },
    { icon: 'person', label: 'Vietinbank', color: '#1976D2' },
  ];

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chuyển tiền</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Ionicons name="headset-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.iconBtnRight} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9E9E9E" style={{ marginLeft: 12 }} />
            <TextInput placeholder="Nhập SĐT/STK tại đây" style={styles.searchInput} />
            <TouchableOpacity style={styles.pasteBtn}>
              <Ionicons name="clipboard-outline" size={16} color="#E91E63" />
              <Text style={styles.pasteText}>Dán</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.scanBtn}>
            <Ionicons name="qr-code-outline" size={24} color="#212121" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionTitle}>Chuyển tiền đến</Text>
          <View style={styles.transferOptions}>
            <TouchableOpacity style={styles.transferOptionCard} onPress={() => handleBankClick('Ví MoMo khác')}>
              <Ionicons name="wallet" size={24} color="#E91E63" />
              <Text style={styles.transferOptionText}>Ví MoMo khác</Text>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.transferOptionCard, { backgroundColor: '#E3F2FD' }]} onPress={() => handleBankClick('Ngân hàng')}>
              <Ionicons name="business" size={24} color="#2196F3" />
              <Text style={styles.transferOptionText}>Ngân hàng</Text>
              <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.banksScroll}>
            {banks.map((item, index) => (
              <TouchableOpacity key={index} style={styles.bankItem} onPress={() => handleBankClick(item.label)}>
                <View style={styles.bankIconWrapper}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <Text style={styles.bankLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dividerFull} />

          <Text style={styles.sectionTitle}>Chọn chuyển nhanh</Text>
          <View style={styles.recentTransferCard}>
             <View style={styles.recentItem}>
               <View style={styles.avatar}><Text style={{color:'#fff', fontWeight:'bold'}}>LT</Text></View>
               <View style={{flex: 1, marginLeft: 12}}>
                 <Text style={styles.recentName}>Lâm Chanh Thu</Text>
               </View>
               <Ionicons name="refresh-circle-outline" size={24} color="#9E9E9E" />
             </View>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Ưu đãi khi chuyển tiền trên MoMo</Text>
            <Ionicons name="chevron-forward" size={20} color="#E91E63" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promoScroll}>
            <View style={styles.promoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="cash-outline" size={20} color="#E91E63" />
                <Text style={{ fontSize: 12, marginLeft: 4, color: '#616161' }}>Chuyển tiền</Text>
              </View>
              <Text style={styles.promoTitle}>Hoàn tiền</Text>
              <Text style={styles.promoDesc}>Khi chuyển MoMo</Text>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="business" size={20} color="#2196F3" />
                <Text style={{ fontSize: 12, marginLeft: 4, color: '#616161' }}>Chuyển khoản</Text>
              </View>
              <Text style={styles.promoTitle}>Hoàn tiền</Text>
              <Text style={styles.promoDesc}>Chuyển Ngân hàng</Text>
              <TouchableOpacity style={styles.promoBtn}>
                <Text style={styles.promoBtnText}>Khám phá</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </ScrollView>

        <View style={styles.bottomTabs}>
          {[
            { icon: 'cash', label: 'Chuyển tiền', active: true },
            { icon: 'chatbubbles-outline', label: 'Chuyển qua Chat', active: false },
            { icon: 'ribbon-outline', label: 'Tôi', active: false }
          ].map((tab, idx) => (
            <TouchableOpacity key={idx} style={styles.tabItem}>
              <Ionicons name={tab.icon as any} size={24} color={tab.active ? '#E91E63' : '#757575'} />
              <Text style={[styles.tabText, { color: tab.active ? '#E91E63' : '#757575' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backCircle: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, marginLeft: spacing.sm, fontSize: 18, fontWeight: '700', color: colors.text },
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

  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    height: 48,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  searchInput: { flex: 1, height: 48, paddingHorizontal: 12, fontSize: 14 },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  pasteText: { color: '#E91E63', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },
  scanBtn: {
    width: 48, height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },

  scrollContent: { padding: spacing.md, paddingBottom: 100, backgroundColor: '#fff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: spacing.xl },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  
  transferOptions: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  transferOptionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  transferOptionText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#212121', marginLeft: 8 },

  banksScroll: { gap: spacing.md, marginBottom: spacing.lg },
  bankItem: { alignItems: 'center', width: 64 },
  bankIconWrapper: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  bankLabel: { fontSize: 11, color: '#616161' },

  dividerFull: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg, marginHorizontal: -spacing.md },

  recentTransferCard: { paddingVertical: spacing.xs },
  recentItem: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#9C27B0', justifyContent: 'center', alignItems: 'center' },
  recentName: { fontSize: 15, fontWeight: '600', color: '#212121' },

  promoScroll: { gap: spacing.md },
  promoCard: {
    width: 140,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
  },
  promoTitle: { fontSize: 15, fontWeight: '800', color: '#212121', marginBottom: 2 },
  promoDesc: { fontSize: 12, color: '#757575', marginBottom: 12 },
  promoBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E91E63', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  promoBtnText: { color: '#E91E63', fontSize: 11, fontWeight: 'bold' },

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
  tabText: { fontSize: 10, marginTop: 4 },
});
