import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppHeader from 'components/AppHeader';

export default function AddCashUploadScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>(); // ✅ THIS LINE FIXES THE ERROR

  const { amount } = route.params;

  const [utr, setUtr] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const isValid = utr.trim().length >= 6 && !!image;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const submitRequest = () => {
    if (!isValid) return;

    // 🔥 create Firebase request here

    navigation.navigate('AddCashSuccess');
  };

  return (
    <View className="flex-1 bg-black">
      {/* HEADER */}
      <AppHeader title="UPLOAD PROOF" />

      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* AMOUNT SUMMARY */}
        <View className="mb-6 rounded-2xl border border-white/5 bg-[#121823] p-5">
          <Text className="text-xs tracking-wider text-slate-400 uppercase">Amount Paid</Text>

          <Text className="mt-2 text-3xl font-extrabold text-white">₹{amount}</Text>

          <Text className="mt-1 text-xs text-slate-500">This amount cannot be changed</Text>
        </View>

        {/* UTR INPUT */}
        <Text className="mb-2 text-sm text-slate-400">UTR / Transaction ID</Text>

        <TextInput
          placeholder="Enter UTR number"
          placeholderTextColor="#64748B"
          value={utr}
          onChangeText={setUtr}
          className="mb-5 rounded-xl bg-zinc-900 px-4 py-4 text-white"
        />

        {/* UPLOAD SCREENSHOT */}
        <TouchableOpacity
          onPress={pickImage}
          className="mb-4 rounded-xl border border-white/10 bg-zinc-800 py-4">
          <Text className="text-center font-semibold text-white">
            {image ? 'Change Screenshot' : 'Upload Payment Screenshot'}
          </Text>
        </TouchableOpacity>

        {/* PREVIEW */}
        {image && <Image source={{ uri: image }} className="mb-4 h-52 w-full rounded-xl" />}

        {/* INFO */}
        <Text className="mb-6 text-xs text-slate-400">
          Your request will be verified manually by the admin. Approval usually takes 10–30 minutes.
        </Text>

        {/* SUBMIT */}
        <TouchableOpacity
          onPress={submitRequest}
          disabled={!isValid}
          className={`rounded-xl py-4 ${isValid ? 'bg-green-600' : 'bg-zinc-700'}`}>
          <Text className="text-center font-bold text-black">SUBMIT REQUEST</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
