import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "components/AppHeader";

export default function WalletPaymentsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="WALLET & PAYMENTS" />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* BALANCE SUMMARY */}
        <View className="mt-6 rounded-xl bg-[#121823] border border-white/5 p-5">
          <Text className="text-sm text-slate-400">Total Balance</Text>
          <Text className="mt-1 text-2xl font-bold text-green-500">
            ₹1,250
          </Text>

          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              onPress={() => navigation.navigate("AddCashAmount")}
              className="flex-1 rounded-lg bg-green-500 py-3 items-center"
            >
              <Text className="font-bold text-black">
                ADD CASH
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("WithdrawAmount")}
              className="flex-1 rounded-lg border border-green-500 py-3 items-center"
            >
              <Text className="font-semibold text-green-500">
                WITHDRAW
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BALANCE BREAKDOWN */}
        <View className="mt-6 rounded-xl bg-[#121823] border border-white/5">
          <Row label="Deposited" value="₹900" />
          <Row label="Winnings" value="₹300" highlight />
          <Row label="Bonus" value="₹50" muted />
        </View>

        {/* PAYMENT METHODS */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-semibold text-slate-400">
            Payment Methods
          </Text>

          <View className="rounded-xl bg-[#121823] border border-white/5">
            <PaymentRow
              icon="card-outline"
              label="Bank Account"
              value="HDFC •••• 4321"
              onPress={() => navigation.navigate("ManageBankAccounts")}
            />
            <PaymentRow
              icon="logo-google"
              label="UPI"
              value="gow****@upi"
              onPress={() => navigation.navigate("ManageUpi")}
            />
          </View>
        </View>

        {/* INFO */}
        <View className="mt-4 flex-row gap-2 items-start">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#64748B"
          />
          <Text className="flex-1 text-xs text-slate-400">
            Withdrawals are processed within 24 hours after verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

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
    <View className="flex-row justify-between px-4 py-4 border-b border-white/5 last:border-b-0">
      <Text
        className={`text-sm ${
          muted ? "text-slate-500" : "text-white"
        }`}
      >
        {label}
      </Text>
      <Text
        className={`text-sm font-semibold ${
          highlight
            ? "text-green-500"
            : muted
            ? "text-slate-400"
            : "text-white"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

function PaymentRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: any;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4 border-b border-white/5 last:border-b-0"
    >
      <Ionicons
        name={icon}
        size={20}
        color="#94A3B8"
      />

      <View className="flex-1 ml-3">
        <Text className="text-white text-sm">
          {label}
        </Text>
        <Text className="text-xs text-slate-400 mt-1">
          {value}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#64748B"
      />
    </TouchableOpacity>
  );
}
