import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AppHeader from 'components/AppHeader';

type WithdrawMethod = 'UPI' | 'BANK' | null;

export default function WithdrawAmountScreen() {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<WithdrawMethod>(null);

  const numericAmount = Number(amount);
  const isValid = numericAmount >= 100 && method !== null;

  const submitWithdraw = () => {
    if (!isValid) return;

    // 🔥 Firebase withdraw request (later)
    console.log({
      withdrawAmount: numericAmount,
      withdrawMethod: method,
    });

    navigation.navigate('WithdrawSuccess');
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="WITHDRAW MONEY" />

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* BALANCE INFO */}
        <View className="mb-6 rounded-2xl border border-white/5 bg-[#121823] p-5">
          <Text className="text-sm text-slate-400">Available to Withdraw</Text>
          <Text className="mt-2 text-3xl font-bold text-white">₹0</Text>
          <Text className="mt-1 text-xs text-slate-500">Only winnings can be withdrawn</Text>
        </View>

        {/* AMOUNT INPUT */}
        <Text className="mb-2 text-sm text-slate-400">Withdraw Amount</Text>
        <TextInput
          placeholder="Enter amount"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          className="mb-6 rounded-xl bg-zinc-900 px-4 py-4 text-lg text-white"
        />

        {/* METHOD SELECTION */}
        <Text className="mb-3 text-sm text-slate-400">Select Withdrawal Method</Text>

        <View className="mb-6 flex-row gap-3">
          <MethodCard
            label="UPI"
            description="Instant UPI transfer"
            selected={method === 'UPI'}
            onPress={() => setMethod('UPI')}
          />

          <MethodCard
            label="Bank"
            description="NEFT / IMPS"
            selected={method === 'BANK'}
            onPress={() => setMethod('BANK')}
          />
        </View>

        {/* RULES */}
        <View className="mb-6 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="mb-2 font-semibold text-white">Withdrawal Rules</Text>
          <Text className="text-xs text-slate-400">
            • Minimum withdrawal ₹100{'\n'}• Withdrawals are processed manually{'\n'}• Amount will
            be sent to your selected method{'\n'}• Processing time: up to 24 hours
          </Text>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={submitWithdraw}
          disabled={!isValid}
          className={`rounded-xl py-4 ${isValid ? 'bg-green-600' : 'bg-zinc-700'}`}>
          <Text className="text-center font-bold text-black">REQUEST WITHDRAWAL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------- METHOD CARD ---------- */

function MethodCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 rounded-xl border p-4 ${
        selected ? 'border-green-500 bg-green-500/10' : 'border-white/10 bg-zinc-900'
      }`}>
      <Text className={`text-lg font-bold ${selected ? 'text-green-500' : 'text-white'}`}>
        {label}
      </Text>
      <Text className="mt-1 text-xs text-slate-400">{description}</Text>
    </TouchableOpacity>
  );
}
