import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import AppBackground from '@/components/ui/AppBackground';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { reportService } from '@/services/reportService';
import { FundMember } from '@/types';

export default function ReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { fund, loading: fundLoading } = useFund(id);

  const [targetType, setTargetType] = useState<'fund' | 'user'>('fund');
  const [members, setMembers] = useState<FundMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch members when targetType is 'user'
  useEffect(() => {
    if (targetType === 'user' && id) {
      setLoadingMembers(true);
      memberService
        .getFundMembers(id)
        .then((data) => {
          // Exclude current reporter user from the report target list
          const otherMembers = data.filter((m) => m.userId !== user?.uid);
          setMembers(otherMembers);
          if (otherMembers.length > 0) {
            setSelectedMemberId(otherMembers[0].userId);
          } else {
            setSelectedMemberId(null);
          }
        })
        .catch((err) => {
          console.error('Failed to load members for report', err);
          Alert.alert('Lỗi', 'Không thể tải danh sách thành viên');
        })
        .finally(() => {
          setLoadingMembers(false);
        });
    }
  }, [targetType, id, user?.uid]);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Lỗi', 'Bạn cần đăng nhập để thực hiện chức năng này');
      return;
    }
    if (!id || !fund) {
      Alert.alert('Lỗi', 'Không xác định được quỹ liên quan');
      return;
    }

    const cleanReason = reason.trim();
    if (!cleanReason) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do báo cáo vi phạm');
      return;
    }
    if (cleanReason.length < 10) {
      Alert.alert('Lỗi', 'Lý do báo cáo phải có độ dài tối thiểu 10 ký tự');
      return;
    }

    let finalTargetId = id;
    if (targetType === 'user') {
      if (!selectedMemberId) {
        Alert.alert('Lỗi', 'Vui lòng chọn thành viên bị báo cáo');
        return;
      }
      finalTargetId = selectedMemberId;
    }

    setSubmitting(true);
    try {
      await reportService.createReport(user.uid, targetType, finalTargetId, cleanReason);
      Alert.alert('Thành công', 'Báo cáo vi phạm đã được gửi thành công!', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace(`/fund/${id}`);
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('Create report error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi báo cáo vi phạm. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fundLoading) {
    return (
      <AppBackground style={styles.container}>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      </AppBackground>
    );
  }

  const selectedMember = members.find((m) => m.userId === selectedMemberId);

  return (
    <AppBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo báo cáo vi phạm</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backCircle}>
            <Ionicons name="home-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Guide Card */}
            <View style={styles.guideCard}>
              <View style={styles.guideIconContainer}>
                <Ionicons name="shield-checkmark" size={28} color="#E91E63" />
              </View>
              <View style={styles.guideTextContainer}>
                <Text style={styles.guideTitle}>Bảo vệ cộng đồng MomoFund</Text>
                <Text style={styles.guideDesc}>
                  Báo cáo của bạn sẽ giúp hệ thống phát hiện các hành vi gian lận tài chính, lạm dụng quỹ hoặc quấy rối thành viên. Chúng tôi cam kết bảo mật danh tính người báo cáo.
                </Text>
              </View>
            </View>

            {/* Target Type Selector */}
            <Text style={styles.sectionTitle}>1. Chọn đối tượng vi phạm</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity
                style={[
                  styles.selectorCard,
                  targetType === 'fund' && styles.selectorCardActive,
                ]}
                onPress={() => setTargetType('fund')}
              >
                <View
                  style={[
                    styles.selectorIconCircle,
                    { backgroundColor: targetType === 'fund' ? `${colors.primary}15` : '#F5F5F5' },
                  ]}
                >
                  <Ionicons
                    name="folder-open"
                    size={24}
                    color={targetType === 'fund' ? colors.primary : '#757575'}
                  />
                </View>
                <Text
                  style={[
                    styles.selectorLabel,
                    targetType === 'fund' && styles.selectorLabelActive,
                  ]}
                >
                  Báo cáo Quỹ nhóm
                </Text>
                <Text style={styles.selectorSublabel} numberOfLines={1}>
                  {fund?.name}
                </Text>
                {targetType === 'fund' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.selectorCard,
                  targetType === 'user' && styles.selectorCardActive,
                ]}
                onPress={() => setTargetType('user')}
              >
                <View
                  style={[
                    styles.selectorIconCircle,
                    { backgroundColor: targetType === 'user' ? `${colors.primary}15` : '#F5F5F5' },
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={24}
                    color={targetType === 'user' ? colors.primary : '#757575'}
                  />
                </View>
                <Text
                  style={[
                    styles.selectorLabel,
                    targetType === 'user' && styles.selectorLabelActive,
                  ]}
                >
                  Thành viên quỹ
                </Text>
                <Text style={styles.selectorSublabel} numberOfLines={1}>
                  {targetType === 'user' && selectedMember
                    ? selectedMember.displayName
                    : 'Chọn một thành viên'}
                </Text>
                {targetType === 'user' && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Target Details Section */}
            {targetType === 'fund' ? (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="folder-outline" size={20} color="#757575" />
                  <Text style={styles.detailTitle}>Thông tin quỹ bị báo cáo</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tên quỹ:</Text>
                  <Text style={styles.detailValue}>{fund?.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Chủ quỹ:</Text>
                  <Text style={styles.detailValue}>{fund?.ownerName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Số lượng thành viên:</Text>
                  <Text style={styles.detailValue}>{fund?.memberCount} thành viên</Text>
                </View>
              </View>
            ) : (
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <Ionicons name="person-outline" size={20} color="#757575" />
                  <Text style={styles.detailTitle}>Chọn thành viên bị báo cáo</Text>
                </View>

                {loadingMembers ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.md }} />
                ) : members.length === 0 ? (
                  <Text style={styles.emptyMembersText}>Không có thành viên nào khác để báo cáo</Text>
                ) : (
                  <View style={styles.membersGrid}>
                    {members.map((member) => {
                      const isSelected = selectedMemberId === member.userId;
                      return (
                        <TouchableOpacity
                          key={member.userId}
                          style={[
                            styles.memberCard,
                            isSelected && styles.memberCardSelected,
                          ]}
                          onPress={() => setSelectedMemberId(member.userId)}
                        >
                          <View
                            style={[
                              styles.memberAvatar,
                              { backgroundColor: isSelected ? '#FFF0F5' : '#F5F5F5' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.memberAvatarText,
                                { color: isSelected ? '#E91E63' : '#757575' },
                              ]}
                            >
                              {member.displayName?.substring(0, 2).toUpperCase() || 'U'}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.memberNameText,
                              isSelected && styles.memberNameTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {member.displayName}
                          </Text>
                          <Text style={styles.memberRoleText}>
                            {member.role === 'owner' ? 'Chủ quỹ' : member.role === 'admin' ? 'Phó quỹ' : 'Thành viên'}
                          </Text>
                          {isSelected && (
                            <View style={styles.memberCheckIcon}>
                              <Ionicons name="checkmark" size={14} color="#FFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Reason Form */}
            <Text style={styles.sectionTitle}>2. Mô tả nội dung vi phạm</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                placeholder="Vui lòng cung cấp thông tin chi tiết về hành vi vi phạm (ví dụ: rút tiền quỹ không đúng mục đích, gian lận đóng góp, quấy rối bằng văn bản nhắc nhở...)"
                placeholderTextColor="#9E9E9E"
                value={reason}
                onChangeText={(text) => setReason(text.slice(0, 500))}
                textAlignVertical="top"
              />
              <Text style={styles.charCounter}>{reason.length}/500 ký tự</Text>
            </View>

            {/* Submit Actions */}
            <View style={styles.actionContainer}>
              <Button
                label={submitting ? 'Đang gửi báo cáo...' : 'Gửi báo cáo vi phạm'}
                onPress={handleSubmit}
                disabled={submitting}
                style={styles.submitBtn}
              />
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.cancelBtn}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text, flex: 1, textAlign: 'center' },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F5',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FFD1DC',
  },
  guideIconContainer: { marginRight: spacing.md, justifyContent: 'center' },
  guideTextContainer: { flex: 1 },
  guideTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  guideDesc: { fontSize: 12, color: '#757575', lineHeight: 18 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },

  selectorRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  selectorCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectorCardActive: { borderColor: colors.primary, backgroundColor: '#FFF5F7' },
  selectorIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  selectorLabel: { fontSize: 14, fontWeight: '700', color: '#616161', marginBottom: 2 },
  selectorLabelActive: { color: colors.primary },
  selectorSublabel: { fontSize: 11, color: '#9E9E9E', textAlign: 'center', width: '100%' },
  checkBadge: { position: 'absolute', top: 8, right: 8 },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', paddingBottom: spacing.xs },
  detailTitle: { fontSize: 14, fontWeight: '700', color: '#616161' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  detailLabel: { fontSize: 13, color: '#757575' },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'right', marginLeft: spacing.sm },

  emptyMembersText: { fontSize: 13, color: '#9E9E9E', textAlign: 'center', marginVertical: spacing.md },
  membersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  memberCard: {
    width: '31%',
    backgroundColor: '#FAFAFA',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    position: 'relative',
  },
  memberCardSelected: { borderColor: '#E91E63', backgroundColor: '#FFF5F7' },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  memberAvatarText: { fontSize: 13, fontWeight: '700' },
  memberNameText: { fontSize: 12, fontWeight: '600', color: '#616161', textAlign: 'center', width: '100%', marginBottom: 2 },
  memberNameTextSelected: { color: '#E91E63' },
  memberRoleText: { fontSize: 10, color: '#9E9E9E' },
  memberCheckIcon: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E91E63', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },

  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: spacing.xl,
  },
  textArea: { fontSize: 14, color: colors.text, minHeight: 120, padding: spacing.xs },
  charCounter: { fontSize: 11, color: '#9E9E9E', textAlign: 'right', marginRight: spacing.xs, marginTop: spacing.xs },

  actionContainer: { gap: spacing.md, paddingHorizontal: spacing.sm },
  submitBtn: { backgroundColor: '#E91E63' },
  cancelBtn: { paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 15, color: '#757575', fontWeight: '600' },
});
