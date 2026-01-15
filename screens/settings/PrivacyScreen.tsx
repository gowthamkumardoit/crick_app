import { View, Text, ScrollView } from 'react-native';
import AppHeader from 'components/AppHeader';

export default function PrivacyScreen() {
  return (
    <View className="flex-1 bg-black">
      <AppHeader title="PRIVACY" />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* INTRO */}
        <View className="mt-4 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="text-sm text-slate-400">
            Your privacy is important to us. This page explains how Predict Guru collects, uses, and
            protects your information.
          </Text>
        </View>

        {/* DATA COLLECTION */}
        <Section title="Information We Collect">
          <Bullet text="Basic profile information (name, phone, email)" />
          <Bullet text="Wallet & transaction details" />
          <Bullet text="KYC documents for verification" />
          <Bullet text="App usage data for improving experience" />
        </Section>

        {/* DATA USAGE */}
        <Section title="How We Use Your Information">
          <Bullet text="To process deposits and withdrawals" />
          <Bullet text="To verify identity and prevent fraud" />
          <Bullet text="To provide customer support" />
          <Bullet text="To improve app performance and features" />
        </Section>

        {/* DATA SHARING */}
        <Section title="Data Sharing">
          <Bullet text="We do not sell your personal data" />
          <Bullet text="Data is shared only with trusted services for payments & verification" />
          <Bullet text="Information may be shared if required by law" />
        </Section>

        {/* SECURITY */}
        <Section title="Security">
          <Bullet text="All sensitive data is securely stored" />
          <Bullet text="Access is restricted to authorized personnel only" />
          <Bullet text="We regularly review security practices" />
        </Section>

        {/* USER RIGHTS */}
        <Section title="Your Rights">
          <Bullet text="You can update your profile information anytime" />
          <Bullet text="You can request account deletion via support" />
          <Bullet text="You control notification preferences" />
        </Section>

        {/* FOOTER */}
        <View className="mt-6">
          <Text className="text-center text-xs text-slate-500">Last updated: Jan 2026</Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6 rounded-xl border border-white/5 bg-[#121823] p-4">
      <Text className="mb-2 font-semibold text-white">{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return <Text className="mb-1 text-sm text-slate-400">• {text}</Text>;
}
