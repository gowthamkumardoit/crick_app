import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "components/AppHeader";

export default function WithdrawSuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="WITHDRAW REQUESTED" />

      <View className="flex-1 items-center justify-center px-6">
        {/* ICON */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-600/20">
          <Text className="text-4xl">💸</Text>
        </View>

        <Text className="mb-2 text-xl font-bold text-white text-center">
          Withdrawal Requested
        </Text>

        <Text className="mb-6 text-center text-sm text-slate-400">
          Your withdrawal request has been submitted successfully.
          It will be processed after verification.
        </Text>

        {/* INFO */}
        <View className="mb-8 w-full rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="text-sm text-slate-400">
            ⏱ Processing time: up to 24 hours
          </Text>
          <Text className="mt-2 text-sm text-slate-400">
            💳 Amount will be sent to your verified payment method
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate("WalletHome")}
          className="w-full rounded-xl bg-green-600 py-4"
        >
          <Text className="text-center font-bold text-black">
            GO TO WALLET
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
