import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing, radius, fontSize } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // Alert.alert không hoạt động trên web — dùng window.confirm thay thế
    if (Platform.OS === 'web') {
      if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
        logout();
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]);
    }
  };

  const initial = user?.displayName?.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Info rows */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Họ và tên</Text>
            <Text style={styles.rowValue}>{user?.displayName}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>User ID</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{user?.uid}</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  rowValue: { fontSize: fontSize.sm, fontWeight: '600', color: colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginTop: spacing.lg, backgroundColor: '#FFF1F0',
    borderRadius: radius.md, paddingVertical: 14,
    borderWidth: 1.5, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: fontSize.md, fontWeight: '600', color: colors.error },
});
