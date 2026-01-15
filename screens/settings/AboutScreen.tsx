import { View, Text, ScrollView } from 'react-native';
import AppHeader from 'components/AppHeader';

export default function AboutScreen() {
  return (
    <View className="flex-1 bg-black">
      <AppHeader title="ABOUT" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* APP INFO */}
        <View className="mt-6 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="text-lg font-bold text-white">Predict Guru</Text>

          <Text className="mt-2 text-sm text-slate-400">
            Predict Guru is a skill-based prediction platform where users can participate in
            contests and win rewards based on their knowledge.
          </Text>
        </View>

        {/* DETAILS */}
        <View className="mt-6 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Row label="Version" value="1.0.0" />
          <Row label="Platform" value="Android / iOS" />
          <Row label="Made in" value="India 🇮🇳" />
        </View>

        {/* FOOTER */}
        <Text className="mt-6 text-center text-xs text-slate-500">
          © 2026 Predict Guru. All rights reserved.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-white/5 py-3 last:border-b-0">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="text-sm text-white">{value}</Text>
    </View>
  );
}
