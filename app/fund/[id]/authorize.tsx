import { FundPageHeader } from '@/components/common/FundPageHeader';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { FundMember } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useGlobalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function FundAuthorizeScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { user } = useAuth();
  const { fund } = useFund(id);
  const [members, setMembers] = useState<FundMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleToggleRole = async (member: FundMember) => {
    if (!id || !user) return;
    if (member.role === 'owner') return;

    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const actionText = newRole === 'admin' ? 'thăng cấp thành Phó quỹ' : 'hủy quyền Phó quỹ của';

    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${actionText} ${member.displayName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: newRole === 'admin' ? 'default' : 'destructive',
          onPress: async () => {
            setProcessingId(member.userId);
            try {
              await memberService.updateRole(id, member.userId, newRole);
              Alert.alert('Thành công', 'Đã cập nhật quyền thành viên');
              loadMembers();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể cập nhật quyền');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const isOwner = user?.uid === fund?.ownerId;

  if (!isOwner && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <FundPageHeader title="Ủy quyền thành viên" showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>Chỉ chủ quỹ mới có quyền truy cập</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lọc ra các thành viên không phải là chủ quỹ
  const eligibleMembers = members.filter(m => m.role !== 'owner');

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Ủy quyền thành viên" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Bạn có thể ủy quyền Phó quỹ cho các thành viên. Phó quỹ có thể duyệt yêu cầu tham gia và yêu cầu rút tiền.
        </Text>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
          ) : eligibleMembers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có thành viên nào để ủy quyền</Text>
            </View>
          ) : (
            eligibleMembers.map((member, index) => {
              const isAdmin = member.role === 'admin';
              const isProcessing = processingId === member.userId;

              return (
                <View key={member.userId} style={[styles.memberRow, index === eligibleMembers.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{member.displayName?.substring(0, 2).toUpperCase() || 'U'}</Text>
                  </View>
                  
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.displayName}</Text>
                    {isAdmin && (
                      <View style={styles.roleBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#4CAF50" style={{ marginRight: 4 }} />
                        <Text style={styles.roleText}>Phó quỹ</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={[styles.actionBtn, isAdmin ? styles.actionBtnRevoke : styles.actionBtnGrant]}
                    onPress={() => handleToggleRole(member)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator size="small" color={isAdmin ? '#F44336' : colors.primary} />
                    ) : (
                      <Text style={[styles.actionBtnText, isAdmin ? styles.actionBtnTextRevoke : styles.actionBtnTextGrant]}>
                        {isAdmin ? 'Hủy quyền' : 'Thêm phó quỹ'}
                      </Text>
                    )}
                  </TouchableOpacity>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#F44336' },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },
  description: { fontSize: 14, color: '#616161', marginBottom: spacing.lg, lineHeight: 20 },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: spacing.md,
  },
  emptyContainer: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#9E9E9E' },
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
  roleText: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnGrant: {
    backgroundColor: '#FFF0F5',
    borderColor: 'transparent',
  },
  actionBtnRevoke: {
    backgroundColor: '#FFEBEE',
    borderColor: 'transparent',
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  actionBtnTextGrant: { color: '#E91E63' },
  actionBtnTextRevoke: { color: '#F44336' },
});
