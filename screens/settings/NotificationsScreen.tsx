import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import AppHeader from 'components/AppHeader';

type NotificationType = 'WALLET' | 'KYC' | 'MATCH' | 'SYSTEM';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  unread?: boolean;
};

/* 🔹 TEMP DATA */
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Add Cash Pending',
    message: 'Your add cash request is under verification.',
    time: '5 mins ago',
    type: 'WALLET',
    unread: true,
  },
  {
    id: '2',
    title: 'KYC Submitted',
    message: 'Your KYC is under review. Verification may take 24–48 hours.',
    time: '2 hours ago',
    type: 'KYC',
  },
  {
    id: '3',
    title: 'Welcome to Predict Guru',
    message: 'Start predicting and winning today!',
    time: '1 day ago',
    type: 'SYSTEM',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="NOTIFICATIONS" />

      {/* 🔹 ACTION BAR */}
      <View className="mt-3 flex-row justify-between px-4">
        <TouchableOpacity onPress={markAllRead}>
          <Text className="text-sm font-semibold text-green-500">
            Mark all read
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearAll}>
          <Text className="text-sm font-semibold text-red-400">
            Clear all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 100 }}
      >
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

/* ---------- COMPONENTS ---------- */

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <View
      className={`mb-3 rounded-xl border p-4 ${
        item.unread
          ? 'border-green-500/30 bg-green-500/10'
          : 'border-white/5 bg-[#121823]'
      }`}
    >
      <View className="flex-row items-start gap-3">
        <Ionicons
          name={getIcon(item.type)}
          size={22}
          color={getColor(item.type)}
        />

        <View className="flex-1">
          <Text className="font-semibold text-white">
            {item.title}
          </Text>

          <Text className="mt-1 text-sm text-slate-400">
            {item.message}
          </Text>

          <Text className="mt-2 text-xs text-slate-500">
            {item.time}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="mt-24 items-center px-6">
      <Ionicons
        name="notifications-off-outline"
        size={48}
        color="#64748B"
      />
      <Text className="mt-4 text-lg font-semibold text-white">
        No Notifications
      </Text>
      <Text className="mt-1 text-center text-sm text-slate-400">
        You’re all caught up 🎉
      </Text>
    </View>
  );
}

/* ---------- HELPERS ---------- */

function getIcon(type: NotificationType) {
  switch (type) {
    case 'WALLET':
      return 'wallet-outline';
    case 'KYC':
      return 'shield-checkmark-outline';
    case 'MATCH':
      return 'trophy-outline';
    default:
      return 'notifications-outline';
  }
}

function getColor(type: NotificationType) {
  switch (type) {
    case 'WALLET':
      return '#22C55E';
    case 'KYC':
      return '#38BDF8';
    case 'MATCH':
      return '#FACC15';
    default:
      return '#94A3B8';
  }
}
