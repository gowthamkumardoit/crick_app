import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WalletStackParamList } from 'navigation/types';
import AppHeader from 'components/AppHeader';

type WalletNav = NativeStackNavigationProp<WalletStackParamList>;

export default function WalletScreen() {
  const navigation = useNavigation<WalletNav>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="WALLET" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* BALANCE CARD */}
        <View className="mb-4 rounded-2xl border border-white/5 bg-[#121823] p-5">
          <Text className="text-sm text-slate-400">Total Balance</Text>

          <Text className="mt-1 text-3xl font-bold text-white">₹0</Text>

          <Text className="mt-1 text-xs text-slate-500">
            Withdrawable balance may vary based on winnings & verification
          </Text>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('AddCashAmount')}
              className="flex-1 rounded-xl bg-green-600 py-4">
              <Text className="text-center font-bold text-black">ADD CASH</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('WithdrawAmount')}
              className="flex-1 rounded-xl bg-zinc-800 py-4">
              <Text className="text-center font-bold text-white">WITHDRAW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PENDING STATUS */}
        <View className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <Text className="font-semibold text-yellow-400">⏳ Add Cash Pending</Text>
          <Text className="mt-1 text-xs text-slate-400">
            Your add cash request is under review and will be credited after admin approval.
          </Text>
        </View>

        {/* BALANCE BREAKDOWN */}
        <View className="mb-6 rounded-2xl border border-white/5 bg-[#121823]">
          <Row label="Deposited" value="₹0" />
          <Row label="Winnings" value="₹0" highlight />
          <Row label="Bonus" value="₹0" muted />
        </View>

        {/* QUICK ACTIONS */}
        <View className="rounded-2xl border border-white/5 bg-[#121823]">
          <TouchableOpacity
            onPress={() => navigation.navigate('WalletPayments')}
            className="flex-row items-center justify-between border-b border-white/5 px-4 py-5">
            <Text className="font-semibold text-white">Wallet & Payments</Text>
            <Text className="text-slate-500">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('WithdrawAmount')}
            className="flex-row items-center justify-between px-4 py-5">
            <Text className="font-semibold text-white">Withdraw Money</Text>
            <Text className="text-slate-500">›</Text>
          </TouchableOpacity>
        </View>

        {/* INFO */}
        <Text className="mt-6 text-center text-xs text-slate-500">
          Add cash & withdrawals are processed manually after verification.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Row({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <View className="flex-row justify-between border-b border-white/5 px-4 py-4 last:border-b-0">
      <Text className={`text-sm ${muted ? 'text-slate-500' : 'text-white'}`}>{label}</Text>
      <Text
        className={`text-sm font-semibold ${
          highlight ? 'text-green-500' : muted ? 'text-slate-400' : 'text-white'
        }`}>
        {value}
      </Text>
    </View>
  );
}
