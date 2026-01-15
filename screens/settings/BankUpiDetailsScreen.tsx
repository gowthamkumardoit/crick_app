import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';

export default function BankUpiDetailsScreen() {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiQr, setUpiQr] = useState<string | null>(null);

  const pickQrImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUpiQr(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!upiId && !upiQr) {
      alert('Please add UPI ID or upload QR code');
      return;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="BANK & UPI DETAILS" showBack />

      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* BANK SECTION */}
        <SectionHeader title="Bank Account" />

        <Input label="Bank Name" value={bankName} onChangeText={setBankName} />
        <Input
          label="Account Number"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="number-pad"
        />
        <Input label="IFSC Code" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" />

        {/* UPI SECTION */}
        <SectionHeader title="UPI Details" />

        <Input
          label="UPI ID"
          value={upiId}
          onChangeText={setUpiId}
          placeholder="example@upi"
          autoCapitalize="none"
        />

        <TouchableOpacity onPress={pickQrImage} className="mt-5 rounded-xl bg-zinc-900 py-4">
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="qr-code-outline" size={18} color="#22C55E" />
            <Text className="font-semibold text-white">
              {upiQr ? 'Change QR Code' : 'Upload QR Code'}
            </Text>
          </View>
        </TouchableOpacity>

        {upiQr && (
          <View className="mt-4 items-center">
            <Image source={{ uri: upiQr }} className="h-36 w-36 rounded-xl" />
            <Text className="mt-2 text-xs text-slate-400">QR should be clear and readable</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View className="absolute right-0 bottom-0 left-0 bg-black px-5 py-4">
        <TouchableOpacity onPress={handleSave} className="rounded-xl bg-green-600 py-4">
          <Text className="text-center font-bold text-black">SAVE DETAILS</Text>
        </TouchableOpacity>

        <Text className="mt-2 text-center text-xs text-slate-500">Required for withdrawals</Text>
      </View>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SectionHeader({ title }: { title: string }) {
  return <Text className="mt-6 mb-3 text-sm font-semibold text-slate-300">{title}</Text>;
}

function Card({ children }: { children: React.ReactNode }) {
  return <View className="rounded-2xl bg-[#121823] px-4 py-2">{children}</View>;
}

function Input({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize }: any) {
  return (
    <View className="py-3">
      <Text className="mb-1 text-xs text-slate-500">{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="border-b border-white/15 pb-2 text-base text-white"
      />
    </View>
  );
}
