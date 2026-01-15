import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppHeader from 'components/AppHeader';
import { BackendKycStatus, useAuthStore } from 'store/authStore';
import { httpsCallable } from 'firebase/functions';
import { functions, storage } from 'lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
type KycStatusUI = 'NOT_VERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

const mapKycStatus = (status?: BackendKycStatus): KycStatusUI => {
  switch (status) {
    case 'PENDING':
      return 'PENDING';
    case 'VERIFIED':
      return 'APPROVED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'NOT_VERIFIED';
  }
};

const AADHAAR_REGEX = /^[2-9]{1}[0-9]{11}$/;

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const safeContentType = (mime?: string) => {
  if (mime === 'image/png') return 'image/png';
  return 'image/jpeg'; // fallback ALWAYS
};

export default function KycVerificationScreen() {
  const { user, profile, setProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.name ?? '');
  const [dob, setDob] = useState('');
  const [dobDate, setDobDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [aadhaar, setAadhaar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documentImage, setDocumentImage] = useState<{
    uri: string;
    mimeType?: string;
  } | null>(null);

  const [selfieImage, setSelfieImage] = useState<{
    uri: string;
    mimeType?: string;
  } | null>(null);

  const kycStatus = mapKycStatus(profile?.verification?.kycStatus);

  /* ---------------- IMAGE PICKERS ---------------- */

  const pickDocument = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!res.canceled) {
      const asset = res.assets[0];
      setDocumentImage({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };
  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission denied');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      quality: 0.7,
    });

    if (!res.canceled) {
      const asset = res.assets[0];
      setSelfieImage({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const uploadImageToStorage = async (uri: string, path: string): Promise<string> => {
    // 1. Read image as base64 (works for content:// and file://)
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // 2. Convert base64 → Uint8Array
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    // 3. Upload to Firebase Storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, uint8Array, {
      contentType: 'image/jpeg',
    });

    // 4. Get public URL
    return await getDownloadURL(storageRef);
  };

  /* ---------------- SUBMIT ---------------- */
  const submitKyc = async () => {
    setError(null);

    if (kycStatus === 'PENDING') {
      setError('Your KYC is already under review');
      return;
    }

    if (!fullName || !dob || !aadhaar || !documentImage || !selfieImage) {
      setError('All fields are required');
      return;
    }

    if (!AADHAAR_REGEX.test(aadhaar)) {
      setError('Invalid Aadhaar number');
      return;
    }

    if (!user) return;

    try {
      setSubmitting(true);

      const extFromMime = (mime?: string) => {
        if (mime === 'image/png') return 'png';
        return 'jpg';
      };

      /* ---------- UPLOAD IMAGES ---------- */

      const basePath = `kyc/${user.uid}`;

      const docImage = documentImage;
      const selfieImg = selfieImage;

      const documentPath = `${basePath}/aadhaar_${Date.now()}.${extFromMime(docImage.mimeType)}`;
      const selfiePath = `${basePath}/selfie_${Date.now()}.${extFromMime(selfieImg.mimeType)}`;

      const documentUrl = await uploadImageToStorage(docImage.uri, documentPath);

      const selfieUrl = await uploadImageToStorage(selfieImg.uri, selfiePath);

      /* ---------- CALL CLOUD FUNCTION ---------- */

      const submitKycRequest = httpsCallable(functions, 'submitKycRequestFn');

      await submitKycRequest({
        fullName,
        dob, // DD-MM-YYYY
        documentNumberMasked: `XXXXXXXX${aadhaar.slice(-4)}`,
        documentUrl,
        selfieUrl,
      });

      /* ---------- OPTIMISTIC UI UPDATE ---------- */

      setProfile({
        ...(profile ?? {}),
        verification: {
          ...(profile?.verification ?? {}),
          kycStatus: 'PENDING',
        },
      });
    } catch (e: any) {
      console.error(e);

      const msg = e?.message?.includes('already submitted')
        ? 'KYC already submitted and under review'
        : e?.message?.includes('already verified')
          ? 'KYC already verified'
          : 'Something went wrong. Try again.';

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="KYC VERIFICATION" showBack />

      <ScrollView className="flex-1 px-4 pt-6 pb-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* STATUS */}
        <View className="mb-6 rounded-xl bg-[#121823] p-4">
          <Text className="text-sm text-slate-400">KYC Status</Text>
          <Text className="mt-1 font-semibold text-red-400">
            {kycStatus === 'NOT_VERIFIED' && 'Not Verified'}
            {kycStatus === 'PENDING' && 'Pending Verification'}
            {kycStatus === 'APPROVED' && 'Verified ✔'}
            {kycStatus === 'REJECTED' && 'Rejected ❌'}
          </Text>
        </View>

        {(kycStatus === 'NOT_VERIFIED' || kycStatus === 'REJECTED') && (
          <>
            {/* FULL NAME */}
            <Text className="mb-2 text-sm text-slate-400">Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              className="mb-4 rounded-xl bg-zinc-900 px-4 py-4 text-white"
            />

            {/* DOB */}
            <Text className="mb-2 text-sm text-slate-400">Date of Birth</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="mb-4 rounded-xl bg-zinc-900 px-4 py-4">
              <Text className={dob ? 'text-white' : 'text-slate-500'}>
                {dob || 'Select date (DD-MM-YYYY)'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dobDate ?? new Date(1995, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setDobDate(date);
                    setDob(formatDate(date));
                  }
                }}
              />
            )}

            {/* AADHAAR */}
            <Text className="mb-2 text-sm text-slate-400">Aadhaar Number</Text>
            <TextInput
              value={aadhaar}
              onChangeText={(t) => setAadhaar(t.replace(/\D/g, ''))}
              keyboardType="number-pad"
              maxLength={12}
              className="mb-4 rounded-xl bg-zinc-900 px-4 py-4 text-white"
            />

            {/* ID PROOF */}
            <TouchableOpacity onPress={pickDocument} className="mb-3 rounded-xl bg-zinc-800 py-4">
              <Text className="text-center font-semibold text-white">
                {documentImage ? 'Change ID Proof' : 'Upload Aadhaar'}
              </Text>
            </TouchableOpacity>

            {documentImage && (
              <Image source={{ uri: documentImage.uri }} className="mb-4 h-44 rounded-xl" />
            )}

            {/* SELFIE CAMERA */}
            <TouchableOpacity onPress={takeSelfie} className="mb-3 rounded-xl bg-zinc-800 py-4">
              <Text className="text-center font-semibold text-white">
                {selfieImage ? 'Retake Selfie' : 'Take Live Selfie'}
              </Text>
            </TouchableOpacity>

            {selfieImage && (
              <Image source={{ uri: selfieImage.uri }} className="mb-6 h-44 rounded-xl" />
            )}

            {error && <Text className="mb-3 text-sm text-red-400">{error}</Text>}

            {/* SUBMIT */}
            <TouchableOpacity
              onPress={submitKyc}
              disabled={submitting}
              className={`rounded-xl py-4 ${submitting ? 'bg-zinc-700' : 'bg-green-600'}`}>
              <Text className="text-center font-bold text-black">
                {submitting ? 'SUBMITTING…' : 'SUBMIT KYC'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {kycStatus === 'PENDING' && (
          <Text className="text-sm text-slate-400">
            Your documents are under review. This usually takes 24–48 hours.
          </Text>
        )}

        {kycStatus === 'APPROVED' && (
          <Text className="text-sm text-green-400">
            KYC verified successfully. Withdrawals are now enabled.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
