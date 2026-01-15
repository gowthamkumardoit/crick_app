import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';

export default function HelpSupportScreen() {
  return (
    <View className="flex-1 bg-black">
      <AppHeader title="HELP & SUPPORT" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {/* QUICK HELP */}
        <Section title="Quick Help">
          <Item icon="wallet-outline" text="Add cash not credited?" />
          <Item icon="cash-outline" text="Withdrawal delayed?" />
          <Item icon="shield-checkmark-outline" text="KYC verification issues?" />
          <Item icon="trophy-outline" text="Contest or match related issue?" />
        </Section>

        {/* CONTACT */}
        <Section title="Contact Us">
          <Text className="text-sm text-slate-400">Email us at</Text>
          <Text className="mt-1 font-semibold text-green-500">support@predictguru.in</Text>

          <Text className="mt-3 text-xs text-slate-500">Support hours: 10 AM – 7 PM (IST)</Text>
        </Section>

        {/* NOTE */}
        <Text className="mt-6 text-center text-xs text-slate-500">
          We usually respond within 24 hours.
        </Text>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6 rounded-xl border border-white/5 bg-[#121823] p-4">
      <Text className="mb-3 font-semibold text-white">{title}</Text>
      {children}
    </View>
  );
}

function Item({ icon, text }: { icon: any; text: string }) {
  return (
    <View className="mb-3 flex-row items-center">
      <Ionicons name={icon} size={18} color="#94A3B8" />
      <Text className="ml-3 text-sm text-slate-400">{text}</Text>
    </View>
  );
}
