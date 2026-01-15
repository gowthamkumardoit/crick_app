import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import AppHeader from 'components/AppHeader';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isValid =
    currentPassword.length >= 6 && newPassword.length >= 6 && newPassword === confirmPassword;

  const handleChangePassword = () => {
    if (!isValid) return;

    // 🔥 Later:
    // - reauthenticate user
    // - update password via Firebase Auth
    console.log({
      currentPassword,
      newPassword,
    });
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="CHANGE PASSWORD" />

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* CURRENT PASSWORD */}
        <Text className="mb-2 text-sm text-slate-400">Current Password</Text>
        <TextInput
          secureTextEntry
          placeholder="Enter current password"
          placeholderTextColor="#64748B"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          className="mb-5 rounded-xl bg-zinc-900 px-4 py-4 text-white"
        />

        {/* NEW PASSWORD */}
        <Text className="mb-2 text-sm text-slate-400">New Password</Text>
        <TextInput
          secureTextEntry
          placeholder="Enter new password"
          placeholderTextColor="#64748B"
          value={newPassword}
          onChangeText={setNewPassword}
          className="mb-5 rounded-xl bg-zinc-900 px-4 py-4 text-white"
        />

        {/* CONFIRM PASSWORD */}
        <Text className="mb-2 text-sm text-slate-400">Confirm New Password</Text>
        <TextInput
          secureTextEntry
          placeholder="Confirm new password"
          placeholderTextColor="#64748B"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          className="mb-6 rounded-xl bg-zinc-900 px-4 py-4 text-white"
        />

        {/* RULES */}
        <View className="mb-6 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="mb-2 font-semibold text-white">Password Rules</Text>
          <Text className="text-xs text-slate-400">
            • Minimum 6 characters{'\n'}• Use a strong, unique password{'\n'}• Do not share your
            password with anyone
          </Text>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={!isValid}
          className={`rounded-xl py-4 ${isValid ? 'bg-green-600' : 'bg-zinc-700'}`}>
          <Text className="text-center font-bold text-black">UPDATE PASSWORD</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
