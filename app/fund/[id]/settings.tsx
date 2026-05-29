import { FundPageHeader } from '@/components/common/FundPageHeader';
import Button from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useFund } from '@/hooks/useFund';
import { fundService } from '@/services/fundService';
import { memberService } from '@/services/memberService';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FundSettingsScreen() {
  const { id: paramId } = useGlobalSearchParams();
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  
  const router = useRouter();
  const { fund } = useFund(id);
  const { user } = useAuth();

  // Tính role dựa trên ownerId — không phụ thuộc virtual field
  const isOwner = !!fund && !!user && fund.ownerId === user.uid;
  const isMember = !!fund && !!user && fund.ownerId !== user.uid;

  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [receiveQr, setReceiveQr] = useState(false);
  const [fundType, setFundType] = useState<'saving' | 'spending'>('saving');

  // Modal Sửa thông tin
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Xóa quỹ
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisbanding, setIsDisbanding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handlePlaceholder = (feature: string) => {
    Alert.alert('Tính năng đang phát triển', `Chức năng "${feature}" sẽ sớm ra mắt.`);
  };

  const openEditModal = () => {
    if (fund) {
      setEditName(fund.name);
      setEditDesc(fund.description || '');
      setIsEditModalVisible(true);
    }
  };

  useEffect(() => {
    if (fund?.visibility) {
      setVisibility(fund.visibility);
    }
  }, [fund]);

  const handleSaveInfo = async () => {
    if (!id || !editName.trim()) return;
    setIsEditing(true);
    try {
      await fundService.updateFund(id, { name: editName.trim(), description: editDesc.trim() });
      Alert.alert('Thành công', 'Đã cập nhật thông tin quỹ!');
      setIsEditModalVisible(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteFund = () => {
    Alert.alert(
      'Cảnh báo nguy hiểm',
      'Bạn có chắc chắn muốn đóng và xóa quỹ này không? Toàn bộ giao dịch và thành viên sẽ bị xóa vĩnh viễn!',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa quỹ', 
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await fundService.deleteFund(id);
              Alert.alert('Thành công', 'Đã xóa quỹ!');
              router.replace('/(tabs)');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa quỹ');
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleLeaveFund = () => {
    Alert.alert(
      'Rời quỹ',
      `Bạn có chắc chắn muốn rời quỹ "${fund?.name}" không? Bạn có thể xin tham gia lại sau.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời quỹ',
          style: 'destructive',
          onPress: async () => {
            if (!id || !user) return;
            setIsLeaving(true);
            try {
              await memberService.leaveFund(user.uid, id);
              Alert.alert('Thành công', `Bạn đã rời quỹ "${fund?.name}".`, [
                { text: 'OK', onPress: () => router.replace('/(tabs)') },
              ]);
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể rời quỹ. Vui lòng thử lại.');
              setIsLeaving(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleVisibility = async () => {
    if (!id || !fund || !isOwner) return;
    const nextVisibility = visibility === 'private' ? 'public' : 'private';
    setIsUpdatingVisibility(true);

    try {
      await fundService.updateFund(id, { visibility: nextVisibility });
      setVisibility(nextVisibility);
      Alert.alert(
        'Thành công',
        `Đã chuyển trạng thái quỹ sang ${nextVisibility === 'private' ? 'Riêng tư' : 'Công khai'}`
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái quỹ');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleDissolveFund = () => {
    const balance = fund?.balance ?? 0;

    if (balance === 0) {
      // Số dư bằng 0 → giải tán luôn không cần chia
      Alert.alert(
        'Xác nhận giải tán',
        `Số dư quỹ là 0 ₫. Quỹ "${fund?.name}" sẽ bị giải tán ngay lập tức. Bạn có chắc chắn?`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Giải tán',
            style: 'destructive',
            onPress: async () => {
              if (!id) return;
              setIsDisbanding(true);
              try {
                await fundService.disbandFund(id, [], user?.uid);
                Alert.alert('Thành công', 'Quỹ đã được giải tán!', [
                  { text: 'OK', onPress: () => router.replace('/(tabs)') },
                ]);
              } catch (error: any) {
                Alert.alert('Lỗi', error.message || 'Không thể giải tán quỹ');
                setIsDisbanding(false);
              }
            },
          },
        ]
      );
    } else {
      // Số dư > 0 → chuyển sang màn hình chọn cách chia
      router.push(`/fund/${id}/dissolve`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FundPageHeader title="Cài đặt" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Trạng thái quỹ */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Trạng thái quỹ</Text>
            <TouchableOpacity
              style={[styles.dropdownBtn, isOwner ? undefined : styles.dropdownDisabled]}
              onPress={handleToggleVisibility}
              disabled={!isOwner || isUpdatingVisibility}
              activeOpacity={isOwner ? 0.7 : 1}
            >
              <Text style={styles.dropdownText}>{visibility === 'private' ? 'Riêng tư' : 'Công khai'}</Text>
              {isOwner && <Ionicons name="chevron-down" size={16} color={colors.text} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDesc}>
            {visibility === 'private'
              ? 'Thành viên mới cần bạn phê duyệt để tham gia quỹ.'
              : 'Bất kỳ ai có mã quỹ đều có thể tham gia ngay lập tức.'}
          </Text>
          {isOwner && (
            <Text style={styles.actionHint}>
              Nhấn vào đây để chuyển sang {visibility === 'private' ? 'Công khai' : 'Riêng tư'}.
            </Text>
          )}
        </View>

        {/* Nhận tiền quỹ qua mã QR */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Nhận tiền quỹ qua mã QR</Text>
            <Switch
              value={receiveQr}
              onValueChange={setReceiveQr}
              trackColor={{ false: '#E0E0E0', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <Text style={styles.cardDesc}>
            Cho phép nhận tiền từ cả MoMo và tài khoản ngân hàng
          </Text>
        </View>

        {/* Chọn loại quỹ */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Chọn loại quỹ</Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Tìm hiểu thêm <Ionicons name="chevron-forward" size={12} /></Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardDesc}>
            Thay đổi loại quỹ theo nhu cầu sử dụng bất cứ lúc nào
          </Text>

          <View style={styles.fundTypeOptions}>
            <TouchableOpacity 
              style={[styles.typeOption, fundType === 'saving' && styles.typeOptionActive]}
              onPress={() => setFundType('saving')}
            >
              <View style={[styles.typeIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="wallet" size={24} color="#FF9800" />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Tích lũy</Text>
                <Text style={styles.typeDesc}>Để số dư quỹ sinh lời mỗi ngày tới 4%/năm.</Text>
              </View>
              <View style={[styles.radioOuter, fundType === 'saving' && styles.radioOuterActive]}>
                {fundType === 'saving' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeOption, fundType === 'spending' && styles.typeOptionActive, { borderBottomWidth: 0 }]}
              onPress={() => setFundType('spending')}
            >
              <View style={[styles.typeIconBox, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="earth" size={24} color="#4CAF50" />
              </View>
              <View style={styles.typeInfo}>
                <Text style={styles.typeTitle}>Chi tiêu chung</Text>
                <Text style={styles.typeDesc}>Ủy quyền cho người yêu, bạn bè hoặc gia đình để chi tiêu trực tiếp từ quỹ.</Text>
              </View>
              <View style={[styles.radioOuter, fundType === 'spending' && styles.radioOuterActive]}>
                {fundType === 'spending' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.lockMessage}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
            <Text style={styles.lockMessageText}>Tạo quỹ để thiết lập loại quỹ theo đúng nhu cầu.</Text>
          </View>
        </View>

        {/* Thông tin quỹ */}
        <TouchableOpacity style={styles.card} onPress={openEditModal}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Thông tin quỹ</Text>
              <Text style={[styles.cardDesc, { marginTop: 4, marginBottom: 0 }]}>Cập nhật tên, mô tả quỹ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>

        {/* Đặt mục tiêu */}
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/fund/${id}/goal`)}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Đặt mục tiêu</Text>
              <Text style={[styles.cardDesc, { marginTop: 4, marginBottom: 0 }]}>Tạo mục tiêu và hiện thực ước mơ nhé</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>

        {/* Hướng dẫn sử dụng */}
        <TouchableOpacity style={styles.cardRow} onPress={() => router.push(`/fund/${id}/guide`)}>
          <Ionicons name="book-outline" size={24} color={colors.text} style={styles.cardRowIcon} />
          <Text style={styles.cardRowTitle}>Hướng dẫn sử dụng</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Chỉ chủ quỹ mới thấy các nút nguy hiểm */}
        {isOwner && (
          <>
            {/* "Đóng quỹ" đã bị gỡ bỏ — dùng Giải tán / Rời quỹ thay thế */}

            {/* Giải tán quỹ */}
            <TouchableOpacity style={[styles.cardRow, styles.disbandRow]} onPress={handleDissolveFund} disabled={isDisbanding}>
              <Ionicons name="nuclear-outline" size={24} color="#fff" style={styles.cardRowIcon} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardRowTitle, { color: '#fff' }]}>Giải tán quỹ</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Chia tiền và xóa quỹ vĩnh viễn</Text>
              </View>
              {isDisbanding ? <ActivityIndicator color="#fff" /> : <Ionicons name="chevron-forward" size={20} color="#fff" />}
            </TouchableOpacity>
          </>
        )}

        {/* Thành viên thường: nút Rời quỹ */}
        {isMember && (
          <TouchableOpacity
            style={[styles.cardRow, styles.leaveRow]}
            onPress={handleLeaveFund}
            disabled={isLeaving}
          >
            <Ionicons name="exit-outline" size={24} color={colors.error} style={styles.cardRowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardRowTitle, { color: colors.error }]}>Rời quỹ</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Thoát khỏi quỹ này</Text>
            </View>
            {isLeaving
              ? <ActivityIndicator color={colors.error} />
              : <Ionicons name="chevron-forward" size={20} color={colors.error} />}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal Sửa thông tin quỹ */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa thông tin quỹ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên quỹ</Text>
              <TextInput 
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập tên quỹ"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mô tả</Text>
              <TextInput 
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                value={editDesc}
                onChangeText={setEditDesc}
                placeholder="Nhập mô tả quỹ"
                multiline
              />
            </View>

            <View style={styles.modalActions}>
              <Button label="Hủy" variant="outline" fullWidth={false} style={{ flex: 1, marginRight: 8 }} onPress={() => setIsEditModalVisible(false)} />
              <Button label="Lưu" fullWidth={false} style={{ flex: 1 }} onPress={handleSaveInfo} disabled={isEditing || !editName.trim()} />
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#212121' },
  cardDesc: { fontSize: 13, color: '#757575', marginTop: spacing.sm, lineHeight: 20 },
  
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  dropdownDisabled: {
    opacity: 0.6,
  },
  dropdownText: { fontSize: 14, fontWeight: '600', color: '#424242' },
  actionHint: { marginTop: spacing.xs, color: colors.textSecondary, fontSize: 12 },

  linkText: { fontSize: 13, fontWeight: '700', color: '#E91E63' },

  fundTypeOptions: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  typeOptionActive: { backgroundColor: '#FAFAFA' },
  typeIconBox: {
    width: 44, height: 44,
    borderRadius: radius.md,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.md,
  },
  typeInfo: { flex: 1, paddingRight: spacing.sm },
  typeTitle: { fontSize: 14, fontWeight: '700', color: '#212121', marginBottom: 2 },
  typeDesc: { fontSize: 12, color: '#9E9E9E', lineHeight: 18 },
  
  radioOuter: {
    width: 24, height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: '#E91E63' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E91E63' },

  lockMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  lockMessageText: { flex: 1, fontSize: 13, color: '#424242', lineHeight: 20 },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  cardRowIcon: { marginRight: spacing.md },
  cardRowTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#212121' },

  disbandRow: {
    backgroundColor: '#B71C1C',
    borderWidth: 0,
  },

  leaveRow: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.lg },
  modalContent: { backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.xl },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontSize: 15, color: colors.text
  },
  modalActions: { flexDirection: 'row', marginTop: spacing.md }
});
