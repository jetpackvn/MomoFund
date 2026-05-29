import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { FundPageHeader } from '@/components/common/FundPageHeader';

// Bật animation trên Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface GuideSection {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  content: GuideItem[];
}

interface GuideItem {
  step?: number;
  title: string;
  desc: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'intro',
    icon: 'wallet',
    iconColor: colors.primary,
    iconBg: '#FCE4EC',
    title: 'MomoFund là gì?',
    content: [
      {
        title: 'Quỹ chung',
        desc: 'MomoFund giúp bạn và bạn bè, gia đình cùng nhau góp và quản lý một quỹ tiền chung một cách minh bạch, dễ dàng.',
      },
      {
        title: 'Minh bạch 100%',
        desc: 'Mọi giao dịch đóng góp và rút tiền đều được ghi lại chi tiết, ai cũng có thể xem lịch sử.',
      },
    ],
  },
  {
    id: 'contribute',
    icon: 'arrow-down-circle',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
    title: 'Cách góp quỹ',
    content: [
      { step: 1, title: 'Vào quỹ muốn góp', desc: 'Chọn quỹ từ màn hình trang chủ.' },
      { step: 2, title: 'Nhấn nút "Góp quỹ"', desc: 'Nút màu hồng ở giữa màn hình chính của quỹ.' },
      { step: 3, title: 'Nhập số tiền', desc: 'Điền số tiền muốn góp và ghi chú nếu cần.' },
      { step: 4, title: 'Xác nhận', desc: 'Nhấn "Góp quỹ" để hoàn tất. Số dư quỹ sẽ cập nhật ngay lập tức.' },
    ],
  },
  {
    id: 'withdraw',
    icon: 'arrow-up-circle',
    iconColor: '#FF9800',
    iconBg: '#FFF3E0',
    title: 'Cách rút tiền',
    content: [
      { step: 1, title: 'Chọn "Rút quỹ"', desc: 'Nhấn nút màu cam trên màn hình chính của quỹ.' },
      { step: 2, title: 'Điền thông tin', desc: 'Nhập số tiền và lý do rút tiền.' },
      { step: 3, title: 'Chủ quỹ duyệt', desc: 'Nếu bạn là thành viên, yêu cầu sẽ gửi đến chủ quỹ để phê duyệt. Chủ quỹ rút trực tiếp được không cần duyệt.' },
    ],
  },
  {
    id: 'invite',
    icon: 'person-add',
    iconColor: '#2196F3',
    iconBg: '#E3F2FD',
    title: 'Mời thành viên',
    content: [
      { step: 1, title: 'Mời bằng mã code', desc: 'Vào mục "Mời thành viên" và chia sẻ mã 6 ký tự cho bạn bè.' },
      { step: 2, title: 'Bạn bè nhập mã', desc: 'Họ chọn "Tham gia quỹ" trên trang chủ và nhập mã code.' },
      { step: 3, title: 'Chủ quỹ phê duyệt', desc: 'Chủ quỹ vào mục "Thành viên" để duyệt yêu cầu tham gia.' },
    ],
  },
  {
    id: 'goal',
    icon: 'trophy',
    iconColor: '#FF6F00',
    iconBg: '#FFF8E1',
    title: 'Đặt mục tiêu quỹ',
    content: [
      {
        title: 'Tạo mục tiêu tiết kiệm',
        desc: 'Trong Cài đặt > Đặt mục tiêu, chủ quỹ có thể đặt mục tiêu số tiền cần đạt và thời hạn.',
      },
      {
        title: 'Theo dõi tiến độ',
        desc: 'Thanh tiến độ và các cột mốc 25%, 50%, 75%, 100% giúp mọi người biết quỹ đang đến đâu.',
      },
    ],
  },
  {
    id: 'dissolve',
    icon: 'nuclear',
    iconColor: '#D32F2F',
    iconBg: '#FFEBEE',
    title: 'Giải tán quỹ',
    content: [
      {
        title: 'Khi nào giải tán?',
        desc: 'Khi mục đích quỹ đã hoàn thành hoặc các thành viên không muốn tiếp tục, chủ quỹ có thể chọn giải tán.',
      },
      {
        title: '3 cách chia tiền',
        desc: '① Chia đều — mỗi người nhận bằng nhau\n② Theo tỉ lệ đóng góp — ai góp nhiều nhận nhiều\n③ Tự điều chỉnh — nhập thủ công từng người',
      },
      {
        title: 'Lưu ý quan trọng',
        desc: 'Giải tán quỹ là hành động KHÔNG THỂ hoàn tác. Toàn bộ lịch sử giao dịch sẽ bị xoá.',
      },
    ],
  },
  {
    id: 'faq',
    icon: 'help-circle',
    iconColor: '#9C27B0',
    iconBg: '#F3E5F5',
    title: 'Câu hỏi thường gặp',
    content: [
      {
        title: 'Có giới hạn số thành viên không?',
        desc: 'Không có giới hạn số lượng thành viên trong một quỹ.',
      },
      {
        title: 'Tiền có thực sự được chuyển không?',
        desc: 'MomoFund là ứng dụng quản lý quỹ. Các giao dịch được ghi nhận trong app để theo dõi. Việc chuyển tiền thực tế cần thực hiện qua MoMo hoặc ngân hàng.',
      },
      {
        title: 'Thành viên có thể thấy số dư không?',
        desc: 'Có, tất cả thành viên đều thấy số dư và lịch sử giao dịch của quỹ.',
      },
    ],
  },
];

export default function FundGuideScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('intro');

  const toggleSection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Hướng dẫn sử dụng" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconBg}>
            <Ionicons name="book" size={36} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Hướng dẫn MomoFund</Text>
          <Text style={styles.heroSubtitle}>Tất cả những gì bạn cần biết để sử dụng ứng dụng hiệu quả.</Text>
        </View>

        {/* Sections */}
        {GUIDE_SECTIONS.map((section) => {
          const isOpen = expandedId === section.id;
          return (
            <View key={section.id} style={styles.sectionCard}>
              {/* Header */}
              <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)} activeOpacity={0.7}>
                <View style={[styles.sectionIconBox, { backgroundColor: section.iconBg }]}>
                  <Ionicons name={section.icon as any} size={22} color={section.iconColor} />
                </View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>

              {/* Content */}
              {isOpen && (
                <View style={styles.sectionBody}>
                  {section.content.map((item, idx) => (
                    <View key={idx} style={[styles.guideItem, idx < section.content.length - 1 && styles.guideItemBorder]}>
                      {item.step !== undefined && (
                        <View style={[styles.stepBadge, { backgroundColor: section.iconBg }]}>
                          <Text style={[styles.stepBadgeText, { color: section.iconColor }]}>{item.step}</Text>
                        </View>
                      )}
                      <View style={styles.guideItemText}>
                        <Text style={styles.guideItemTitle}>{item.title}</Text>
                        <Text style={styles.guideItemDesc}>{item.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="heart" size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.footerText}>MomoFund — Quản lý quỹ chung dễ dàng</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  hero: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  heroIconBg: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF0F7', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  heroSubtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  sectionIconBox: {
    width: 40, height: 40, borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center', marginRight: spacing.md,
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },

  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  guideItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md, marginTop: 2,
    flexShrink: 0,
  },
  stepBadgeText: { fontSize: 13, fontWeight: '800' },
  guideItemText: { flex: 1 },
  guideItemTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  guideItemDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    opacity: 0.6,
  },
  footerText: { fontSize: 13, color: colors.textSecondary },
});
