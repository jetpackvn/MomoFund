import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export default function PaymentScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const handleServiceClick = (serviceLabel: string) => {
    const label = serviceLabel.replace('\n', ' ');
    if (label.includes('Thanh toán hóa đơn')) {
      router.push(`/fund/${id}/bill`);
    } else if (label.includes('Du lịch - Đi lại')) {
      router.push(`/fund/${id}/travel`);
    } else if (label.includes('Mua vé xem phim')) {
      router.push(`/fund/${id}/movie`);
    } else if (label.includes('Đến ví MoMo') || label.includes('Đến Ngân hàng')) {
      router.push(`/fund/${id}/transfer`);
    } else {
      router.push(`/transaction/withdraw?fundId=${id}&reason=${encodeURIComponent('Thanh toán: ' + label)}`);
    }
  };

  const services = [
    { icon: 'wallet', label: 'Đến ví\nMoMo', color: '#E91E63' },
    { icon: 'business', label: 'Đến\nNgân hàng', color: '#2196F3' },
    { icon: 'qr-code', label: 'Quét\nmọi QR', color: '#E91E63' },
    { icon: 'qr-code-outline', label: 'QR\nThanh toán', color: '#FF9800' },
    { icon: 'airplane', label: 'Du lịch -\nĐi lại', color: '#2196F3' },
    { icon: 'film', label: 'Mua vé\nxem phim', color: '#FF9800' },
    { icon: 'receipt', label: 'Thanh toán\nhóa đơn', color: '#00BCD4' },
    { icon: 'grid', label: 'Xem thêm\ndịch vụ', color: '#E91E63' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.headerArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thanh toán, Chuyển tiền</Text>
          </View>
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Thanh toán tiện lợi hơn với Quỹ */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thanh toán tiện lợi hơn với Quỹ</Text>
          
          <View style={styles.grid}>
            {services.map((item, index) => (
              <TouchableOpacity key={index} style={styles.gridItem} onPress={() => handleServiceClick(item.label)}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.gridLabel} textAlign="center">{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hướng dẫn chọn Quỹ để thanh toán */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hướng dẫn chọn Quỹ để thanh toán</Text>
          
          <View style={styles.guideContainer}>
            {/* Mocking the phone UI graphic */}
            <View style={styles.phoneMockup}>
              <View style={styles.phoneScreen}>
                {/* Fake header inside phone */}
                <View style={styles.fakeHeader}>
                  <Ionicons name="search" size={12} color="#9E9E9E" />
                  <Text style={styles.fakeSearch}>Tìm kiếm dịch vụ</Text>
                </View>
                {/* Fake content */}
                <View style={styles.fakeBody}>
                  <Text style={styles.fakeTitle}>Bạn vừa xem</Text>
                  <View style={styles.fakeGrid}>
                    {[1,2,3,4].map(i => <View key={i} style={styles.fakeIcon} />)}
                  </View>
                  <View style={styles.highlightBox}>
                    <Ionicons name="wallet" size={16} color="#E91E63" />
                    <Text style={styles.highlightText}>Chứng Chỉ Quỹ</Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={styles.guideText}>
              Chọn dịch vụ trên MoMo bạn muốn để thanh toán và chuyển tiền
            </Text>
            
            <View style={styles.paginationDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  headerArea: {
    backgroundColor: '#FFE4EE', // Mocking the pink gradient background
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121', marginBottom: spacing.lg },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconWrapper: {
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: '#424242',
    lineHeight: 16,
  },

  guideContainer: {
    alignItems: 'center',
  },
  phoneMockup: {
    width: width * 0.55,
    height: width * 1.1,
    backgroundColor: '#212121',
    borderRadius: 30,
    padding: 6,
    marginBottom: spacing.lg,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  fakeHeader: {
    height: 60,
    backgroundColor: '#E91E63',
    paddingTop: 24,
    alignItems: 'center',
  },
  fakeSearch: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: '80%',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 4,
  },
  fakeBody: {
    padding: 12,
  },
  fakeTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fakeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fakeIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E91E63',
    backgroundColor: '#FFF0F5',
  },
  highlightText: {
    fontSize: 10,
    color: '#E91E63',
    fontWeight: 'bold',
    marginLeft: 4,
  },

  guideText: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  paginationDots: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
  dotActive: { width: 16, backgroundColor: '#E91E63' },
});
