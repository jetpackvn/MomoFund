import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';

export default function TravelScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const services = [
    { icon: 'airplane-outline', label: 'Máy bay', color: '#00BCD4' },
    { icon: 'bus-outline', label: 'Xe khách', color: '#2196F3' },
    { icon: 'train-outline', label: 'Tàu hoả', color: '#FF9800' },
    { icon: 'business-outline', label: 'Khách sạn', color: '#FF9800' },
    { icon: 'balloon-outline', label: 'Vé trải nghiệm', color: '#E91E63' },
    { icon: 'subway-outline', label: 'Vé Metro', color: '#2196F3', badge: 'Free' },
    { icon: 'card-outline', label: 'SIM du lịch', color: '#F44336' },
    { icon: 'grid-outline', label: 'Tất cả', color: '#2196F3' },
  ];

  const handleServiceClick = (serviceLabel: string) => {
    router.push(`/transaction/withdraw?fundId=${id}&reason=Du lịch: ${serviceLabel}`);
  };

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Banner header mix */}
        <View style={styles.topBannerArea}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Du lịch - Đi lại</Text>
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

          <View style={styles.heroBanner}>
            <Text style={styles.heroSub}>SALE CUỐI THÁNG</Text>
            <Text style={styles.heroMain}>Combo du lịch thả ga{'\n'}giảm đến <Text style={{color:'#1A237E'}}>2.1 triệu</Text></Text>
            <Text style={styles.heroDate}>Duy nhất 25.05</Text>
          </View>

          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9E9E9E" style={{ marginLeft: 12 }} />
              <TextInput placeholder="Sun World Bà Đen" style={styles.searchInput} />
            </View>
            <View style={styles.assistantBtn}>
              <Ionicons name="happy" size={20} color="#E91E63" />
              <Text style={styles.assistantText}>Trợ lý</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.card}>
            <View style={styles.grid}>
              {services.map((item, index) => (
                <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleServiceClick(item.label)}>
                  <View style={[styles.iconBox, { borderColor: item.color }]}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={styles.gridLabel} textAlign="center">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.promoCard, { backgroundColor: '#FFF0F5' }]}>
            <Ionicons name="gift" size={32} color="#E91E63" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.promoTitle}>Bạn mới ơi, quà tới</Text>
              <Text style={styles.promoDesc}>Chỉ dành riêng cho hành khách chưa từng đặt vé trên MoMo. Đừng bỏ lỡ!</Text>
            </View>
            <TouchableOpacity style={styles.discoverBtn}>
              <Text style={styles.discoverText}>Khám phá</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.promoCard, { backgroundColor: '#FCE4EC', flexDirection: 'column', alignItems: 'stretch', padding: 0, overflow: 'hidden' }]}>
            <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
              <Text style={styles.promoTitleLarge}>Ngắm pháo hoa{'\n'}Đà Nẵng</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.promoDesc}>Vé bay giảm </Text>
                <View style={styles.tagBox}><Text style={styles.tagText}>20%</Text></View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.promoDesc}>Khách sạn giảm đến </Text>
                <View style={styles.tagBox}><Text style={styles.tagText}>500k</Text></View>
              </View>
            </View>
            {/* Mock image area */}
            <View style={{ height: 120, backgroundColor: '#212121', justifyContent: 'center', alignItems: 'center' }}>
               <Ionicons name="sparkles" size={40} color="#FFEB3B" />
            </View>
          </View>

        </ScrollView>

        <View style={styles.bottomTabs}>
          {[
            { icon: 'home', label: 'Trang chủ', active: true },
            { icon: 'ticket-outline', label: 'Ưu đãi', active: false },
            { icon: 'calendar-outline', label: 'Chỗ đã đặt', active: false },
            { icon: 'compass-outline', label: 'Khám phá', active: false },
            { icon: 'person-outline', label: 'Tôi', active: false }
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
  
  topBannerArea: {
    backgroundColor: '#E1F5FE', // Light blue mix
    paddingBottom: spacing.md,
  },
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

  heroBanner: { padding: spacing.md },
  heroSub: { fontSize: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#1A237E', alignSelf: 'flex-start', paddingHorizontal: 4, borderRadius: 4, marginBottom: 4 },
  heroMain: { fontSize: 20, fontWeight: '900', color: '#212121', lineHeight: 28 },
  heroDate: { fontSize: 12, color: '#616161', marginTop: 4 },

  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    height: 44,
  },
  searchInput: { flex: 1, height: 44, paddingHorizontal: 12, fontSize: 14 },
  assistantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FCE4EC',
  },
  assistantText: { color: '#E91E63', fontWeight: 'bold', fontSize: 12, marginLeft: 4 },

  scrollContent: { padding: spacing.md, paddingBottom: 100 },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  iconBox: {
    width: 50, height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    backgroundColor: '#FAFAFA'
  },
  badge: {
    position: 'absolute',
    top: -8, right: -10,
    backgroundColor: '#FF3D00',
    paddingHorizontal: 4, paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  gridLabel: { fontSize: 11, color: '#424242' },

  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  promoTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  promoDesc: { fontSize: 11, color: '#616161' },
  discoverBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E91E63', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  discoverText: { color: '#E91E63', fontSize: 12, fontWeight: 'bold' },

  promoTitleLarge: { fontSize: 18, fontWeight: '900', color: '#212121', lineHeight: 24 },
  tagBox: { backgroundColor: '#E91E63', paddingHorizontal: 4, borderRadius: 4 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

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
