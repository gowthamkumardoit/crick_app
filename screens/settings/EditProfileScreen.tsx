import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';
import { useEffect, useState } from 'react';
import { useAuthStore } from 'store/authStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from 'lib/firebase';
import * as ImagePicker from 'expo-image-picker';

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,14}$/;

function validateUsername(username: string) {
  if (username.length < 3 || username.length > 15) {
    return 'Username must be 3–15 characters';
  }

  if (!USERNAME_REGEX.test(username)) {
    return 'Username must start with a letter and contain only letters, numbers, or _';
  }

  if (/^\d+$/.test(username)) {
    return 'Username cannot contain only numbers';
  }

  return null;
}

export default function EditProfileScreen() {
  const { profile, setProfile } = useAuthStore();

  const [fullName, setFullName] = useState(profile?.name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [photo, setPhoto] = useState<string | undefined>(profile?.photoURL);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const isDirty =
    fullName !== (profile?.name ?? '') ||
    username !== (profile?.username ?? '') ||
    photo !== profile?.photoURL;

  /* ---------------- PICK IMAGE ---------------- */

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setMessage({ type: 'error', text: 'Permission denied' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName || !trimmedUsername) {
      setMessage({ type: 'error', text: 'Name and username are required' });
      return;
    }

    const usernameError = validateUsername(trimmedUsername);
    if (usernameError) {
      setMessage({ type: 'error', text: usernameError });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const updateProfile = httpsCallable(functions, 'mobileUpdateProfile');

      const result = await updateProfile({
        name: trimmedName,
        username: trimmedUsername,
        photoURL: photo,
      });

      // ✅ BACKEND IS AUTHORITY
      setProfile({
        ...(profile ?? {}),
        ...(result.data as any),
      });

      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (e: any) {
      console.error(e);

      // 🔥 surface backend rule errors cleanly
      const msg = e?.message?.includes('30 days')
        ? 'Username can be changed only once every 30 days'
        : e?.message?.includes('already')
          ? 'Username already taken'
          : 'Update failed. Try again.';

      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.name ?? '');
    setUsername(profile.username ?? '');
    setPhoto(profile.photoURL);
  }, [profile]);

  /* ---------------- UI ---------------- */

  return (
    <View className="flex-1 bg-black pb-10">
      <AppHeader title="EDIT PROFILE" showBack  />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* AVATAR */}
        <TouchableOpacity onPress={pickImage} activeOpacity={0.8} className="mt-6 items-center">
          <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-[#121823]">
            {photo ? (
              <Image source={{ uri: photo }} className="h-full w-full" />
            ) : (
              <Ionicons name="person-outline" size={42} color="#22C55E" />
            )}
          </View>

          <Text className="mt-3 text-sm text-green-400">Change profile photo</Text>
        </TouchableOpacity>

        {message && (
          <Text
            className={`mt-3 text-sm ${
              message.type === 'error' ? 'text-red-400' : 'text-green-400'
            }`}>
            {message.text}
          </Text>
        )}

        {/* FORM */}
        <View className="mt-8 rounded-xl border border-white/5 bg-[#121823]">
          <Input label="Full Name" value={fullName} editable onChangeText={setFullName} />
          <Input label="Username" value={username} editable onChangeText={setUsername} />
          <Text className="mt-2 px-6 text-xs text-slate-400">
            Username rules:
            {'\n'}• Cant be changed more than once in 30 days
            {'\n'}• 3–15 characters
            {'\n'}• Letters, numbers, underscore only
            {'\n'}• Cannot be only numbers
          </Text>
          <Input label="Email" value={profile?.email ?? ''} />
          <Input label="Mobile Number" value={profile?.phone ?? ''} />
        </View>

        {/* INFO */}
        <View className="mt-4 flex-row items-start gap-2">
          <Ionicons name="information-circle-outline" size={18} color="#64748B" />
          <Text className="flex-1 text-xs text-slate-400">
            Email and mobile number cannot be changed for security reasons.
          </Text>
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={!isDirty || loading}
          className={`mt-8 h-14 flex-row items-center justify-center rounded-xl ${
            !isDirty || loading ? 'bg-slate-600' : 'bg-green-500'
          }`}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-bold text-black">SAVE CHANGES</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ---------- INPUT ---------- */

function Input({
  label,
  value,
  editable = false,
  onChangeText,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
}) {
  return (
    <View className="border-b border-white/5 px-4 py-4 last:border-b-0">
      <Text className="mb-1 text-xs text-slate-400">{label}</Text>

      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        placeholderTextColor="#64748B"
        className={`text-sm text-white ${editable ? '' : 'opacity-60'}`}
      />
    </View>
  );
}
