import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import AppHeader from 'components/AppHeader';

const { width } = Dimensions.get('window');

/* 🔹 ADMIN QR DATA (later load from Firestore) */
const QR_LIST = [
  {
    upi: 'admin@upi',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=admin@upi',
  },
  {
    upi: 'admin2@upi',
    qr: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=admin2@upi',
  },
];

export default function AddCashMethodsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { amount } = route.params;

  const copy = (value: string) => {
    Clipboard.setStringAsync(value);
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="PAY VIA UPI / BANK" />

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120, // 🔥 IMPORTANT
        }}>
        {/* AMOUNT */}
        <View className="mb-6 rounded-2xl border border-white/5 bg-[#121823] p-5">
          <Text className="text-xs tracking-wider text-slate-400 uppercase">Amount to Pay</Text>

          <View className="mt-2 flex-row items-end">
            <Text className="text-4xl font-extrabold text-white">₹{amount}</Text>
            <Text className="mb-1 ml-2 text-sm text-slate-400">INR</Text>
          </View>

          <Text className="mt-2 text-xs text-slate-500">
            Complete the payment using any method below
          </Text>
        </View>

        {/* BANK DETAILS */}
        <View className="mb-5 rounded-xl border border-white/5 bg-[#121823] p-4">
          <Text className="mb-2 font-bold text-white">Bank Account</Text>
          <Row label="Bank" value="HDFC Bank" />
          <Row label="A/C No" value="1234567890" copy />
          <Row label="IFSC" value="HDFC0000123" copy />
          <Row label="Name" value="Company Pvt Ltd" />
        </View>

        {/* 🔥 QR CAROUSEL */}
        <View className="mb-6 rounded-xl border border-white/5 bg-[#121823] py-4">
          <Text className="mb-3 px-4 font-bold text-white">Scan QR to Pay</Text>

          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {QR_LIST.map((item, index) => (
              <View key={index} style={{ width }} className="items-center">
                <Image source={{ uri: item.qr }} className="h-48 w-48 rounded-xl bg-white" />

                <TouchableOpacity
                  onPress={() => copy(item.upi)}
                  className="mt-3 rounded-lg border border-white/10 px-4 py-2">
                  <Text className="font-semibold text-white">{item.upi}</Text>
                  <Text className="mt-1 text-center text-xs text-green-500">TAP TO COPY</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <Text className="mt-3 text-center text-xs text-slate-400">
            Swipe to view more QR codes
          </Text>
        </View>

        {/* INFO */}
        <Text className="mb-4 text-xs text-slate-400">
          After completing payment, click <Text className="font-bold text-white">I HAVE PAID</Text>{' '}
          and upload the UTR & screenshot.
        </Text>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCashUpload', { amount })}
          className="rounded-xl bg-green-600 py-4">
          <Text className="text-center font-bold text-black">I HAVE PAID</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------- SMALL COMPONENT ---------- */

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-slate-400">{label}</Text>
      <TouchableOpacity disabled={!copy} onPress={() => copy && Clipboard.setStringAsync(value)}>
        <Text className="font-semibold text-white">{value}</Text>
      </TouchableOpacity>
    </View>
  );
}
