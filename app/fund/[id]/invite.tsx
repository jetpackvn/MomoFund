import Button from '@/components/ui/Button';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { memberService } from '@/services/memberService';
import { JoinRequest } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TabKey = 'create' | 'manage' | 'requests';

export default function FundInviteScreen() {
  const { id: paramId, tab } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  
  const { user } = useAuth();
  const { fund } = useFund(id);
  const [activeTab, setActiveTab] = useState<TabKey>('create');
  
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab && ['create', 'manage', 'requests'].includes(tab as string)) {
      setActiveTab(tab as TabKey);
    }
  }, [tab]);

  const loadRequests = useCallback(async () => {
    if (!id || activeTab !== 'requests') return;
    setLoadingRequests(true);
    try {
      const data = await memberService.getPendingJoinRequests(id);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  }, [id, activeTab]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleCopy = () => {
    if (fund?.code) {
      Clipboard.setString(fund.code);
      Alert.alert('Thành công', 'Đã sao chép mã quỹ!');
    }
  };

  const handleApprove = async (reqId: string) => {
    if (!user) return;
    setProcessingId(reqId);
    try {
      await memberService.approveJoinRequest(reqId, user.uid);
      Alert.alert('Thành công', 'Đã duyệt yêu cầu');
      loadRequests();
    } catch (error: any) {
      console.error('approveJoinRequest error', error);
      router.replace('/error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reqId: string) => {
    if (!user) return;
    setProcessingId(reqId);
    try {
      await memberService.rejectJoinRequest(reqId, user.uid);
      Alert.alert('Thành công', 'Đã từ chối yêu cầu');
      loadRequests();
    } catch (error: any) {
      console.error('rejectJoinRequest error', error);
      router.replace('/error');
    } finally {
      setProcessingId(null);
    }
  };

  const renderTabHeader = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'create' && styles.tabBtnActive]}
        onPress={() => setActiveTab('create')}
      >
        <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Tạo lời mời</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'manage' && styles.tabBtnActive]}
        onPress={() => setActiveTab('manage')}
      >
        <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>Quản lý</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabBtn, activeTab === 'requests' && styles.tabBtnActive]}
        onPress={() => setActiveTab('requests')}
      >
        <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>Duyệt ({requests.length})</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateTab = () => (
    <View style={styles.contentArea}>
      <View style={styles.qrContainer}>
        <Ionicons name="qr-code-outline" size={150} color={colors.text} />
      </View>
      <Text style={styles.instruction}>Cho bạn bè quét mã QR này để tham gia quỹ</Text>
      
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Hoặc chia sẻ mã quỹ:</Text>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>{fund?.code || '------'}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Button label="Chia sẻ lời mời" onPress={handleCopy} style={{ marginTop: spacing.xl }} />
    </View>
  );

  const renderManageTab = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>Tính năng quản lý link đang phát triển</Text>
      <View style={styles.linkCard}>
        <View style={styles.linkInfo}>
          <Text style={styles.linkName}>Link mời mặc định</Text>
          <Text style={styles.linkStats}>Sử dụng mã quỹ: {fund?.code}</Text>
        </View>
      </View>
    </View>
  );

  const renderRequestsTab = () => (
    <View style={styles.contentArea}>
      <Text style={styles.sectionTitle}>Yêu cầu đang chờ duyệt ({requests.length})</Text>
      
      {loadingRequests ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-open-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>Không có yêu cầu tham gia nào</Text>
        </View>
      ) : (
        requests.map(req => {
          const isProcessing = processingId === req.id;
          return (
            <View key={req.id} style={styles.requestCard}>
              <View style={styles.requestUser}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{req.userName?.substring(0, 1).toUpperCase() || 'U'}</Text>
                </View>
                <View>
                  <Text style={styles.requestName}>{req.userName}</Text>
                  <Text style={styles.requestTime}>Chờ duyệt</Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <Button 
                  label="Từ chối" 
                  variant="outline" 
                  fullWidth={false} 
                  style={{ flex: 1, marginRight: 8 }} 
                  onPress={() => handleReject(req.id)}
                  disabled={isProcessing}
                />
                <Button 
                  label="Phê duyệt" 
                  fullWidth={false} 
                  style={{ flex: 1 }} 
                  onPress={() => handleApprove(req.id)}
                  disabled={isProcessing}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderTabHeader()}
      <ScrollView>
        {activeTab === 'create' && renderCreateTab()}
        {activeTab === 'manage' && renderManageTab()}
        {activeTab === 'requests' && renderRequestsTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.md, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.primary },

  contentArea: { padding: spacing.lg },
  
  // Create Tab
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    marginVertical: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  instruction: { textAlign: 'center', fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  codeBox: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg },
  codeLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeText: { fontSize: 24, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  copyBtn: { padding: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: radius.sm },

  // Manage Tab
  sectionTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  linkCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkInfo: { flex: 1 },
  linkName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text, marginBottom: 4 },
  linkStats: { fontSize: fontSize.sm, color: colors.textSecondary },

  // Requests Tab
  emptyContainer: { alignItems: 'center', marginTop: spacing.xxl, opacity: 0.7 },
  emptyText: { marginTop: spacing.md, color: colors.textSecondary },
  requestCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  requestUser: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.primaryDark },
  requestName: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  requestTime: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  requestActions: { flexDirection: 'row', justifyContent: 'space-between' },
});
