import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';

export default function PrivilegesScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const [collectedOffers, setCollectedOffers] = useState<Set<number>>(new Set());

  const services = [
    { icon: 'receipt-outline', label: 'Thanh toán\nhóa đơn', color: '#00BCD4' },
    { icon: 'airplane-outline', label: 'Du lịch -\nĐi lại', color: '#2196F3' },
    { icon: 'film-outline', label: 'Mua vé\nxem phim', color: '#FF9800' },
    { icon: 'cash-outline', label: 'Chuyển\ntiền', color: '#F44336' },
    { icon: 'phone-portrait-outline', label: 'Nạp\nđiện thoại', color: '#4CAF50' },
  ];

  const offers = [
    { brand: 'Highlands Coffee', discount: 'Ưu đãi 20K', condition: 'Cho hóa đơn 100K', coins: 59, oldCoins: '20.000', imgColor: '#F8BBD0' },
    { brand: 'Kai Coffee', discount: 'Ưu đãi 40K', condition: 'Cho đơn từ 200K', coins: 29, oldCoins: '40.000', imgColor: '#DCEDC8' },
    { brand: 'MIA', discount: 'Ưu đãi 20%', condition: 'Cho đơn từ 500K', coins: 99, oldCoins: '150.000', imgColor: '#FFF9C4' },
  ];

  const exploreOffers = [
    { title: 'Bạn mới', desc: 'Ưu đãi 10K cho đơn từ 0...', type: 'Ăn uống & Mua sắm', iconColor: '#E91E63' },
    { title: 'Giảm 2K', desc: 'khi đặt gọi xe từ 65K', type: 'Ứng dụng gọi xe', iconColor: '#E91E63' },
    { title: 'Giảm 50%', desc: 'Tới 15K khi Thanh toán...', type: 'Thanh toán', iconColor: '#2196F3' },
  ];

  const handleServiceClick = (serviceLabel: string) => {
    const label = serviceLabel.replace('\n', ' ');
    if (label.includes('Thanh toán hóa đơn')) {
      router.push(`/fund/${id}/bill`);
    } else if (label.includes('Du lịch - Đi lại')) {
      router.push(`/fund/${id}/travel`);
    } else if (label.includes('Mua vé xem phim')) {
      router.push(`/fund/${id}/movie`);
    } else if (label.includes('Chuyển tiền')) {
      router.push(`/fund/${id}/transfer`);
    } else if (label.includes('Nạp điện thoại')) {
      router.push(`/fund/${id}/topup`);
    } else {
      router.push(`/transaction/withdraw?fundId=${id}&reason=${encodeURIComponent('Thanh toán: ' + label)}`);
    }
  };

  const handleCollectOffer = (index: number) => {
    if (collectedOffers.has(index)) return;
    Alert.alert('Thành công', 'Thu thập thành công! Ưu đãi đã được lưu vào ví của bạn.');
    const newCollected = new Set(collectedOffers);
    newCollected.add(index);
    setCollectedOffers(newCollected);
  };

  const handleShowOfferDetails = (brand: string, discount: string) => {
    Alert.alert('Chi tiết ưu đãi', `${brand}\n${discount}\n\nLưu ý: Chức năng đổi điểm hiện đang được thử nghiệm.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header & Banner Area */}
        <View style={styles.bannerArea}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Đặc quyền</Text>
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

          <View style={styles.bannerContent}>
            <Text style={styles.bannerSub}>Quỹ đã có - quà đợi sẵn đó!</Text>
            <Text style={styles.bannerMain}>Trang đặc quyền riêng của hội nhà Quỹ</Text>
            <Text style={styles.bannerDesc}>Săn ưu đãi ngay!</Text>
          </View>
        </View>

        {/* Chi tiêu tiện lợi hơn với Quỹ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiêu tiện lợi hơn với Quỹ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
            {services.map((item, index) => (
              <TouchableOpacity key={index} style={styles.serviceItem} onPress={() => handleServiceClick(item.label)}>
                <Ionicons name={item.icon as any} size={28} color={item.color} style={{ marginBottom: 8 }} />
                <Text style={styles.serviceLabel} textAlign="center">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        <View style={styles.grayDivider} />

        {/* Ưu đãi khi dùng Quỹ thanh toán */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Ưu đãi khi dùng Quỹ thanh toán</Text>
            <Ionicons name="chevron-forward-circle" size={20} color={colors.textSecondary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
            {offers.map((offer, index) => (
              <TouchableOpacity key={index} style={styles.offerCard} onPress={() => handleShowOfferDetails(offer.brand, offer.discount)}>
                <View style={[styles.offerImageArea, { backgroundColor: offer.imgColor }]} />
                <View style={styles.offerInfo}>
                  <Text style={styles.offerBrand} numberOfLines={1}>☕ {offer.brand}</Text>
                  <Text style={styles.offerDiscount}>{offer.discount}</Text>
                  <Text style={styles.offerCondition}>{offer.condition}</Text>
                  <View style={styles.offerCoinsRow}>
                    <View style={styles.coinIcon}><Text style={styles.coinText}>m</Text></View>
                    <Text style={styles.coinValue}>{offer.coins}</Text>
                    <Text style={styles.coinOld}>{offer.oldCoins}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Khám phá thêm nhiều ưu đãi */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Khám phá thêm nhiều ưu đãi</Text>
            <Ionicons name="chevron-forward-circle" size={20} color={colors.textSecondary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersScroll}>
            {exploreOffers.map((item, index) => {
              const isCollected = collectedOffers.has(index);
              return (
                <View key={index} style={styles.exploreCard}>
                  <View style={styles.exploreHeader}>
                    <Ionicons name="cart-outline" size={16} color={item.iconColor} />
                    <Text style={styles.exploreType}>{item.type}</Text>
                  </View>
                  <Text style={styles.exploreTitle}>{item.title}</Text>
                  <Text style={styles.exploreDesc} numberOfLines={1}>{item.desc}</Text>
                  <TouchableOpacity 
                    style={[styles.collectBtn, isCollected && styles.collectedBtn]}
                    onPress={() => handleCollectOffer(index)}
                    disabled={isCollected}
                  >
                    <Text style={[styles.collectBtnText, isCollected && styles.collectedBtnText]}>
                      {isCollected ? 'Đã lưu' : 'Thu thập'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xxl },

  bannerArea: {
    backgroundColor: '#FFE4EE',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
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

  bannerContent: { paddingHorizontal: spacing.md, width: '65%' },
  bannerSub: { fontSize: 14, fontWeight: '600', color: '#E91E63', fontStyle: 'italic', marginBottom: 4 },
  bannerMain: { fontSize: 20, fontWeight: '800', color: '#212121', lineHeight: 28, marginBottom: 8 },
  bannerDesc: { fontSize: 12, color: '#424242' },

  section: { backgroundColor: '#fff', paddingVertical: spacing.lg },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212121', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  
  servicesScroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  serviceItem: { alignItems: 'center', width: 70 },
  serviceLabel: { fontSize: 12, color: '#424242', lineHeight: 16 },

  paginationDots: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
  dotActive: { width: 16, backgroundColor: '#E91E63' },

  grayDivider: { height: 8, backgroundColor: colors.background },

  offersScroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  offerCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  offerImageArea: { height: 80, justifyContent: 'center', alignItems: 'center' },
  offerInfo: { padding: spacing.sm },
  offerBrand: { fontSize: 12, color: '#757575', marginBottom: 4 },
  offerDiscount: { fontSize: 15, fontWeight: '800', color: '#212121', marginBottom: 2 },
  offerCondition: { fontSize: 11, color: '#9E9E9E', marginBottom: 8 },
  offerCoinsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  coinIcon: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFC107', justifyContent: 'center', alignItems: 'center' },
  coinText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  coinValue: { fontSize: 13, fontWeight: '700', color: '#E91E63' },
  coinOld: { fontSize: 11, color: '#BDBDBD', textDecorationLine: 'line-through' },

  exploreCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  exploreHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  exploreType: { fontSize: 11, color: '#757575' },
  exploreTitle: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 4 },
  exploreDesc: { fontSize: 11, color: '#9E9E9E', marginBottom: 12 },
  collectBtn: {
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: '#E91E63',
    alignItems: 'center',
  },
  collectedBtn: {
    borderColor: '#BDBDBD',
    backgroundColor: '#F5F5F5',
  },
  collectBtnText: { fontSize: 12, fontWeight: '600', color: '#E91E63' },
  collectedBtnText: { color: '#9E9E9E' },
});
