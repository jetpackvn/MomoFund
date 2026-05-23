import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { FundMember } from '@/types';
import { useFocusEffect } from '@react-navigation/native';

export default function FundMembersScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const router = useRouter();
  const { user } = useAuth();
  const { fund } = useFund(id);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    memberService.getFundMembers(id)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [loadMembers])
  );

  const isOwner = user?.uid === fund?.ownerId;

  const handleAuthorize = () => {
    Alert.alert('Tính năng đang phát triển', 'Sắp tới bạn có thể thêm phó quỹ ở đây.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thành viên</Text>
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
        
        {/* Quản lý thành viên */}
        {isOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quản lý thành viên</Text>
            <View style={styles.managementCard}>
              <TouchableOpacity style={styles.manageRow} onPress={handleAuthorize}>
                <Ionicons name="person-circle-outline" size={24} color="#616161" style={styles.manageIcon} />
                <Text style={styles.manageText}>Ủy quyền thành viên</Text>
                <View style={styles.badgeNew}>
                  <Text style={styles.badgeNewText}>Mới</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.manageDivider} />
              
              <TouchableOpacity 
                style={styles.manageRow} 
                onPress={() => router.push({ pathname: `/fund/${id}/invite`, params: { tab: 'requests' } })}
              >
                <Ionicons name="mail-outline" size={24} color="#616161" style={styles.manageIcon} />
                <Text style={styles.manageText}>Duyệt yêu cầu tham gia quỹ</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Danh sách thành viên */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Danh sách ({members.length})</Text>
          <TouchableOpacity 
            style={styles.inviteBtn}
            onPress={() => router.push(`/fund/${id}/invite`)}
          >
            <Ionicons name="add" size={16} color="#E91E63" />
            <Text style={styles.inviteBtnText}>Mời thành viên</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : (
            members.map((member, index) => {
              const isFundOwner = member.role === 'owner';
              return (
                <View key={member.userId} style={[styles.memberRow, index === members.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.displayName?.substring(0, 2).toUpperCase() || 'U'}</Text>
                  </View>
                  
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.displayName}</Text>
                    {isFundOwner ? (
                      <View style={styles.roleBadge}>
                        <Ionicons name="star" size={10} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={styles.roleText}>Chủ quỹ</Text>
                      </View>
                    ) : member.role === 'admin' ? (
                      <View style={styles.roleBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#757575" style={{ marginRight: 4 }} />
                        <Text style={styles.roleText}>Phó quỹ</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.memberAmount}>Đã góp: 0đ</Text>
                </View>
              );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFF0F5', // Nền hồng nhạt
    borderBottomWidth: 1,
    borderBottomColor: '#FCE4EC',
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

  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#424242', marginBottom: spacing.sm },
  
  managementCard: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: spacing.xs,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  manageIcon: { marginRight: spacing.md },
  manageText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#424242' },
  badgeNew: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  badgeNewText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  manageDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: spacing.md,
    borderStyle: 'dashed', // Tuỳ platform hỗ trợ, mặc định solid
  },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  inviteBtnText: { color: '#E91E63', fontWeight: '600', fontSize: 13 },

  listContainer: { paddingBottom: spacing.md },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#E91E63' },
  
  memberInfo: { flex: 1, justifyContent: 'center' },
  memberName: { fontSize: 15, fontWeight: '600', color: '#212121', marginBottom: 4 },
  
  roleBadge: { flexDirection: 'row', alignItems: 'center' },
  roleText: { fontSize: 12, color: '#757575' },

  memberAmount: { fontSize: 14, fontWeight: '500', color: '#616161' },
});
