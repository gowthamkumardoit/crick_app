import { View, Text, ScrollView } from 'react-native';
import AppHeader from 'components/AppHeader';

export default function TermsConditionsScreen() {
  return (
    <View className="flex-1 bg-black">
      <AppHeader title="TERMS & CONDITIONS" />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <Section title="Acceptance of Terms">
          <Text className="text-sm text-slate-400">
            By using Predict Guru, you agree to comply with these terms and all applicable laws and
            regulations.
          </Text>
        </Section>

        <Section title="Eligibility">
          <Text className="text-sm text-slate-400">
            Users must be 18 years or older to participate. KYC verification is mandatory for
            withdrawals.
          </Text>
        </Section>

        <Section title="Wallet & Transactions">
          <Text className="text-sm text-slate-400">
            All wallet transactions are subject to verification. Predict Guru reserves the right to
            hold or reject transactions if suspicious activity is detected.
          </Text>
        </Section>

        <Section title="Fair Play">
          <Text className="text-sm text-slate-400">
            Any form of cheating, exploitation, or abuse will result in account suspension or
            termination.
          </Text>
        </Section>

        <Section title="Limitation of Liability">
          <Text className="text-sm text-slate-400">
            Predict Guru is not responsible for losses due to technical failures, delays, or
            external factors.
          </Text>
        </Section>

        <Text className="mt-6 text-center text-xs text-slate-500">Last updated: Jan 2026</Text>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6 rounded-xl border border-white/5 bg-[#121823] p-4">
      <Text className="mb-2 font-semibold text-white">{title}</Text>
      {children}
    </View>
  );
}
