import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';

export default function FundQRScreen() {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR góp quỹ</Text>
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
        {/* Main Card */}
        <View style={styles.cardContainer}>
          <View style={styles.qrPlaceholder}>
            {/* Ảnh QR code */}
            <Ionicons name="qr-code" size={180} color="#000" style={{ opacity: showQR ? 1 : 0.1 }} />
            
            {/* Nội dung đè lên (chỉ hiện khi chưa xem mã) */}
            {!showQR && (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayText}>
                  QR này có thể được quét bằng ứng dụng ngân hàng để chuyển tiền vào Quỹ
                </Text>
                
                {/* Mock logos */}
                <View style={styles.logosRow}>
                  <Text style={styles.logoText}>MOMO</Text>
                  <View style={styles.logoDivider} />
                  <Text style={[styles.logoText, { color: 'red' }]}>VIETQR</Text>
                  <View style={styles.logoCircle}><Ionicons name="leaf" size={12} color="#fff" /></View>
                  <View style={[styles.logoCircle, { backgroundColor: '#1E88E5' }]}><Text style={{ color: '#fff', fontSize: 8 }}>MB</Text></View>
                  <View style={[styles.logoCircle, { backgroundColor: 'red' }]}><Ionicons name="infinite" size={12} color="#fff" /></View>
                  <Text style={{ fontSize: 10, fontWeight: '700', marginLeft: 4, color: colors.textSecondary }}>50+</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer Text */}
        <Text style={styles.footerText}>
          * Bằng việc sử dụng mã QR này, bạn đồng ý rằng tất cả các giao dịch nhận tiền thông qua mã QR sẽ được chuyển vào ví và tự động ghi nhận vào quỹ mà bạn đã thiết lập trước đó. <Text style={styles.linkText}>Chi tiết</Text>
        </Text>

        {/* Action Button */}
        {!showQR ? (
          <Button 
            label="Xem mã" 
            onPress={() => setShowQR(true)} 
            style={styles.actionBtn} 
          />
        ) : (
          <Button 
            label="Tải mã QR" 
            onPress={() => {}} 
            style={[styles.actionBtn, { backgroundColor: colors.text }]} 
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  
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

  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 350,
    marginBottom: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.xl,
    position: 'relative',
  },
  
  overlayContent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  overlayText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoText: { fontSize: 12, fontWeight: '800', color: '#E91E63' },
  logoDivider: { width: 1, height: 12, backgroundColor: colors.border, marginHorizontal: 4 },
  logoCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },

  footerText: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
    textAlign: 'justify',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  linkText: {
    color: '#E91E63',
    fontWeight: '700',
  },

  actionBtn: {
    backgroundColor: '#E91E63',
    marginHorizontal: spacing.sm,
  },
});
