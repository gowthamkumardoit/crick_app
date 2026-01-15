import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types';

export default function SettingsScreen() {
  type NavProp = NativeStackNavigationProp<RootStackParamList>;

  const navigation = useNavigation<NavProp>();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="SETTINGS" />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ACCOUNT */}
        <Section title="Account">
          <SettingsRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />

          {/* <SettingsRow
            icon="wallet-outline"
            label="Wallet & Payments"
            onPress={() =>
              navigation.navigate('Tabs', {
                screen: 'Wallet',
                params: {
                  screen: 'WalletPayments',
                },
              })
            }
          /> */}

          <SettingsRow
            icon="card-outline"
            label="Bank & UPI"
            onPress={() => navigation.navigate('BankUpiDetails')}
          />

          <SettingsRow
            icon="shield-checkmark-outline"
            label="KYC Verification"
            value="Verified"
            onPress={() => navigation.navigate('KycVerification')}
          />
        </Section>

        {/* PREFERENCES */}
        <Section title="Preferences">
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
          />

          <SettingsRow
            icon="eye-outline"
            label="Privacy"
            onPress={() => navigation.navigate('Privacy')}
          />
        </Section>

        {/* SUPPORT */}
        <Section title="Support">
          <SettingsRow
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => navigation.navigate('HelpSupport')}
          />

          <SettingsRow
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => navigation.navigate('TermsConditions')}
          />

          <SettingsRow
            icon="information-circle-outline"
            label="About"
            onPress={() => navigation.navigate('About')}
          />
        </Section>

        {/* LOGOUT */}
        <TouchableOpacity className="mt-6 items-center rounded-xl border border-red-500/40 py-4">
          <Text className="font-semibold text-red-500">Logout</Text>
        </TouchableOpacity>

        {/* APP VERSION */}
        <Text className="mt-6 text-center text-xs text-slate-500">App Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <Text className="mb-3 text-sm font-semibold text-slate-400">{title}</Text>
      <View className="rounded-xl border border-white/5 bg-[#121823]">{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  highlight,
  onPress,
}: {
  icon: any;
  label: string;
  value?: string;
  highlight?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center border-b border-white/5 px-4 py-4 last:border-b-0">
      <Ionicons name={icon} size={20} color={highlight ? '#22C55E' : '#94A3B8'} />

      <Text className="ml-3 flex-1 text-white">{label}</Text>

      <Ionicons name="chevron-forward" size={18} color="#64748B" />
    </TouchableOpacity>
  );
}
