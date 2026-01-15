import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type Props = {
  title: string;
  showBack?: boolean;
};

export default function AppHeader({ title, showBack = false }: Props) {
  const navigation = useNavigation();

  return (
    <View
      className={`flex-row items-center bg-green-500 px-4 ${
        Platform.OS === 'ios' ? 'h-24 pt-12' : 'h-20 pt-8'
      }`}>
      {/* LEFT */}
      <View className="w-8">
        {showBack ? (
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}>
            <Ionicons name="arrow-back" size={22} color="#000" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* TITLE */}
      <Text className="flex-1 text-center text-base font-extrabold text-black">{title}</Text>

      {/* RIGHT */}
      <TouchableOpacity className="w-8 items-end">
        <Ionicons name="notifications-outline" size={22} color="#000" />
      </TouchableOpacity>
    </View>
  );
}
