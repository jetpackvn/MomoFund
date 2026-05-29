import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { TabPageHeader } from '@/components/common/TabPageHeader';
import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, loading } = useNotifications();

  const handleMarkAllRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead(user.uid);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
    }
  };

  const handlePressNotification = async (item: Notification) => {
    if (!item.read) {
      await notificationService.markAsRead(item.id);
    }
    if (item.fundId) {
      router.push(`/fund/${item.fundId}`);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const isUnread = !item.read;
    return (
      <TouchableOpacity 
        style={[styles.card, isUnread && styles.cardUnread]} 
        onPress={() => handlePressNotification(item)}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={item.type === 'contribution' ? 'arrow-down-circle' : item.type === 'join' ? 'person-add' : 'notifications'} 
            size={24} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, isUnread && styles.textUnread]}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>
            {item.createdAt ? new Date((item.createdAt as any).seconds * 1000).toLocaleString('vi-VN') : 'Vừa xong'}
          </Text>
        </View>
        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <TabPageHeader title="Thông báo" />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState 
            iconName="notifications-off-outline"
            title="Không có thông báo"
            description="Bạn chưa có thông báo nào mới."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.sm },
  emptyContainer: { flex: 1 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BFE4FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: { flex: 1 },
  title: { fontSize: fontSize.md, color: colors.text, marginBottom: 4 },
  textUnread: { fontWeight: '700' },
  body: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  time: { fontSize: fontSize.xs, color: colors.textSecondary },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: spacing.sm,
  }
});
