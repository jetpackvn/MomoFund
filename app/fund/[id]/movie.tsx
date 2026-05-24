import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { colors, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';

export default function MovieScreen() {
  const router = useRouter();
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;

  const handleMovieClick = (movieName: string) => {
    router.push(`/transaction/withdraw?fundId=${id}&reason=Mua vé xem phim: ${movieName}`);
  };

  const movies = [
    { title: 'Doraemon Movie 45', rating: '9/10 (1.4K đánh giá)', genre: 'Hoạt Hình, Giả Tượng', color: '#03A9F4' },
    { title: 'Lật Mặt 7', rating: '9.5/10 (5K đánh giá)', genre: 'Tâm lý, Tình cảm', color: '#795548' },
    { title: 'Hành Tinh Khỉ', rating: '8/10 (800 đánh giá)', genre: 'Hành Động, Viễn Tưởng', color: '#424242' },
  ];

  return (
    <AppBackground style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBannerArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backCircle} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mua vé xem phim</Text>
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
              <TextInput placeholder="Tìm tên phim hoặc rạp" style={styles.searchInput} />
            </View>
            <View style={styles.assistantBtn}>
              <Ionicons name="happy" size={20} color="#E91E63" />
              <Text style={styles.assistantText}>Trợ lý</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>Vé Lotte siêu ưu{'\n'}đãi chỉ <Text style={{backgroundColor:'#E91E63', color:'#fff', paddingHorizontal:4}}>105K</Text></Text>
            <Text style={styles.bannerDesc}>Cuối tuần xem phim cực đã giá siêu rẻ</Text>
          </View>

          <Text style={styles.sectionTitle}>Phim nổi bật</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moviesScroll}>
            {movies.map((item, index) => (
              <TouchableOpacity key={index} style={styles.movieCard} onPress={() => handleMovieClick(item.title)}>
                <View style={[styles.movieImage, { backgroundColor: item.color }]}>
                  <View style={styles.badge}><Text style={styles.badgeText}>P</Text></View>
                  <Text style={styles.mockImgText}>{item.title}</Text>
                </View>
                <Text style={styles.movieRating}>⭐ {item.rating}</Text>
                <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.movieGenre}>{item.genre}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>

        <View style={styles.bottomTabs}>
          {[
            { icon: 'ticket', label: 'Chọn phim', active: true },
            { icon: 'videocam-outline', label: 'Chọn rạp', active: false },
            { icon: 'fast-food-outline', label: 'Bắp nước', active: false },
            { icon: 'film-outline', label: 'Nhóm phim', active: false },
            { icon: 'person-outline', label: 'Tôi', active: false, badge: 'New' }
          ].map((tab, idx) => (
            <TouchableOpacity key={idx} style={styles.tabItem}>
              <View>
                <Ionicons name={tab.icon as any} size={24} color={tab.active ? '#E91E63' : '#757575'} />
                {tab.badge && <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{tab.badge}</Text></View>}
              </View>
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
    backgroundColor: '#E0F7FA', // Undersea theme light blue
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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

  bannerCard: {
    backgroundColor: '#FFF0F5',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: '#212121', marginBottom: 8, lineHeight: 28 },
  bannerDesc: { fontSize: 12, color: '#616161' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#212121', marginBottom: spacing.md },
  
  moviesScroll: { gap: spacing.md },
  movieCard: { width: 160 },
  movieImage: {
    height: 240,
    borderRadius: radius.lg,
    marginBottom: 8,
    padding: spacing.sm,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  mockImgText: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center', opacity: 0.5 },
  
  movieRating: { fontSize: 12, color: '#FF9800', marginBottom: 4 },
  movieTitle: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 2 },
  movieGenre: { fontSize: 12, color: '#757575' },

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
  tabBadge: { position: 'absolute', top: -4, right: -12, backgroundColor: '#FF3D00', paddingHorizontal: 4, borderRadius: 4 },
  tabBadgeText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
});
