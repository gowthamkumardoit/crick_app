import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppHeader from 'components/AppHeader';

export default function KycSuccessScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="KYC SUBMITTED" />

      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-600/20">
          <Text className="text-4xl">🪪</Text>
        </View>

        <Text className="mb-2 text-center text-xl font-bold text-white">KYC Submitted</Text>

        <Text className="mb-6 text-center text-sm text-slate-400">
          Your KYC details have been submitted successfully. Verification is in progress.
        </Text>

        <View className="mb-8 w-full rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="text-sm text-slate-400">⏱ Verification time: 24–48 hours</Text>
          <Text className="mt-2 text-sm text-slate-400">
            💳 Withdrawals will be enabled after approval
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          className="w-full rounded-xl bg-green-600 py-4">
          <Text className="text-center font-bold text-black">BACK TO SETTINGS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
