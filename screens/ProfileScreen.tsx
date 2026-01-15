import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="PROFILE" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}>
        {/* PROFILE HEADER */}
        <View className="mt-6 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full border border-white/5 bg-slate-900">
            <Ionicons name="person-outline" size={40} color="#22C55E" />
          </View>

          <Text className="mt-3 text-lg font-bold text-white">Gowtham Kumar</Text>

          <Text className="mt-1 text-sm text-slate-400">Joined • Jan 2026</Text>
        </View>

        {/* PERFORMANCE STATS */}
        <View className="mt-6 flex-row gap-3">
          <StatCard label="Matches" value="42" />
          <StatCard label="Wins" value="18" />
          <StatCard label="Win %" value="43%" />
        </View>

        {/* ACCOUNT INFO */}
        <View className="mt-6 rounded-xl border border-white/5 bg-slate-900">
          <InfoRow icon="shield-checkmark-outline" label="KYC Status" value="Verified" highlight />

          <InfoRow icon="calendar-outline" label="Member Since" value="Jan 2026" />
        </View>

        {/* SETTINGS ENTRY */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          className="mt-6 flex-row items-center justify-between rounded-xl border border-white/5 bg-slate-900 px-4 py-4">
          <View className="flex-row items-center">
            <Ionicons name="settings-outline" size={20} color="#94A3B8" />
            <Text className="ml-3 font-semibold text-white">Settings</Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#64748B" />
        </TouchableOpacity>

        {/* LOGOUT */}
       
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-xl border border-white/5 bg-slate-900 p-4">
      <Text className="text-lg font-bold text-white">{value}</Text>
      <Text className="mt-1 text-xs text-slate-400">{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center border-b border-white/5 px-4 py-4 last:border-b-0">
      <Ionicons name={icon} size={20} color={highlight ? '#22C55E' : '#94A3B8'} />
      <Text className="ml-3 flex-1 text-white">{label}</Text>
      <Text className={`text-sm ${highlight ? 'font-semibold text-green-500' : 'text-slate-400'}`}>
        {value}
      </Text>
    </View>
  );
}
