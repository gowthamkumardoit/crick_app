import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "components/AppHeader";

const QUICK_AMOUNTS = [100, 500, 1000, 2000];

export default function AddCashAmountScreen() {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState("");

  const numericAmount = Number(amount);
  const isValid = numericAmount >= 10;

  const handleContinue = () => {
    if (!isValid) return;
    navigation.navigate("AddCashMethods", { amount: numericAmount });
  };

  return (
    <View className="flex-1 bg-black">
      {/* HEADER */}
      <AppHeader title="ADD CASH" />

      <View className="flex-1 p-4">
        {/* AMOUNT INPUT */}
        <Text className="mb-2 text-sm text-slate-400">
          Enter Amount
        </Text>

        <TextInput
          placeholder="₹ Amount"
          placeholderTextColor="#64748B"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          className="mb-4 rounded-xl bg-zinc-900 px-4 py-4 text-lg font-bold text-white"
        />

        {/* QUICK AMOUNTS */}
        <View className="mb-6 flex-row flex-wrap gap-3">
          {QUICK_AMOUNTS.map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setAmount(String(value))}
              className="rounded-lg border border-white/10 px-4 py-2"
            >
              <Text className="font-semibold text-white">
                ₹{value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO */}
        <Text className="mb-6 text-xs text-slate-400">
          Minimum add cash amount is ₹10.  
          Money will be credited after admin verification.
        </Text>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isValid}
          className={`rounded-xl py-4 ${
            isValid ? "bg-green-600" : "bg-zinc-700"
          }`}
        >
          <Text className="text-center font-bold text-black">
            CONTINUE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
