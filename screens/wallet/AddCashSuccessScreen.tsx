import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppHeader from 'components/AppHeader';

export default function AddCashSuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="REQUEST SUBMITTED" />

      <View className="flex-1 items-center justify-center px-6">
        {/* ICON */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-600/20">
          <Text className="text-4xl">✅</Text>
        </View>

        {/* TEXT */}
        <Text className="mb-2 text-center text-xl font-bold text-white">Request Submitted</Text>

        <Text className="mb-6 text-center text-sm text-slate-400">
          Your add cash request has been submitted successfully. It will be verified by the admin
          shortly.
        </Text>

        {/* INFO CARD */}
        <View className="mb-8 w-full rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="text-sm text-slate-400">⏱ Approval usually takes 10–30 minutes.</Text>
          <Text className="mt-2 text-sm text-slate-400">
            💰 Amount will be credited after verification.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate('WalletHome')}
          className="w-full rounded-xl bg-green-600 py-4">
          <Text className="text-center font-bold text-black">GO TO WALLET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
