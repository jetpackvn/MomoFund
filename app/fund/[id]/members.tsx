import { FundPageHeader } from '@/components/common/FundPageHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { transactionService } from '@/services/transactionService';
import { FundMember } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FundMembersScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const router = useRouter();
  const { user } = useAuth();
  const { fund } = useFund(id);
  const [members, setMembers] = useState<(FundMember & { contributedAmount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [fundMembers, transactions] = await Promise.all([
        memberService.getFundMembers(id),
        transactionService.getTransactions(id),
      ]);

      const contributionMap: Record<string, number> = {};
      transactions.forEach((tx) => {
        if (tx.type === 'contribution') {
          contributionMap[tx.userId] = (contributionMap[tx.userId] ?? 0) + tx.amount;
        }
      });

      setMembers(
        fundMembers.map((member) => ({
          ...member,
          contributedAmount: contributionMap[member.userId] ?? 0,
        }))
      );
    } catch (error) {
      console.error(error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [loadMembers])
  );

  const isOwner = user?.uid === fund?.ownerId;

  const handleAuthorize = () => {
    if (!id) return;
    router.push({ pathname: '/fund/[id]/authorize', params: { id } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Thành viên" />

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
                onPress={() => {
                  if (!id) return;
                  router.push({ pathname: '/fund/[id]/invite', params: { id, tab: 'requests' } });
                }}
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
            onPress={() => {
              if (!id) return;
              router.push({ pathname: '/fund/[id]/invite', params: { id } });
            }}
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
                        <Ionicons name="shield-checkmark" size={10} color="#4CAF50" style={{ marginRight: 4 }} />
                        <Text style={[styles.roleText, { color: '#4CAF50' }]}>Phó quỹ</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.memberAmount}>
                    Đã góp: {member.contributedAmount.toLocaleString('vi-VN')} ₫
                  </Text>
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

  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

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
