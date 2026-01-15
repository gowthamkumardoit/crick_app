import './global.css';
import { Platform, StatusBar, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
/* ---------- FIREBASE ---------- */
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from 'store/authStore';

/* ---------- SCREENS ---------- */
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import EditProfileScreen from './screens/settings/EditProfileScreen';

/* ---------- STACKS ---------- */
import WalletStack from './navigation/WalletStack';
import { RootStackParamList } from 'navigation/types';
import KycVerificationScreen from 'screens/settings/KycVerificationScreen';
import KycSuccessScreen from 'screens/settings/KycSuccessScreen';
import NotificationsScreen from 'screens/settings/NotificationsScreen';
import ChangePasswordScreen from 'screens/settings/ChangePasswordScreen';
import PrivacyScreen from 'screens/settings/PrivacyScreen';
import HelpSupportScreen from 'screens/settings/HelpSupportScreen';
import AboutScreen from 'screens/settings/AboutScreen';
import TermsConditionsScreen from 'screens/settings/TermsConditionsScreen';
import ContestListScreen from 'screens/ContestListScreen';
import AuthStack from 'navigation/AuthStack';
import { getUserProfile } from 'services/profileService';
import BankUpiDetailsScreen from 'screens/settings/BankUpiDetailsScreen';

/* ---------- NAVIGATORS ---------- */
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

/* ---------- TABS ---------- */
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B0F14',
          borderTopColor: 'rgba(255,255,255,0.05)',
          height: 90,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        tabBarItemStyle: { paddingBottom: 10 },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
        }}
      />

      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="trophy-outline" size={22} color={color} />,
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={WalletStack}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="wallet-outline" size={22} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

/* ---------- MAIN APP STACK ---------- */
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ContestList" component={ContestListScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      <Stack.Screen name="BankUpiDetails" component={BankUpiDetailsScreen} />
      <Stack.Screen name="KycVerification" component={KycVerificationScreen} />
      <Stack.Screen name="KycSuccess" component={KycSuccessScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

/* ---------- APP ROOT ---------- */
export default function App() {
  const { isLoggedIn } = useAuthStore();

  /* ✅ LOAD ICON FONTS (CRITICAL) */
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    ...AntDesign.font,
  });

  /* 🔐 Sync Firebase → Auth Store */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const { setUser, setProfile, clearAuth } = useAuthStore.getState();

      if (!user) {
        clearAuth();
        return;
      }

      setUser(user);
      const profile = await getUserProfile();
      setProfile(profile ?? undefined);
    });

    return unsub;
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#0B0F14' }} />;
  }

  if (Platform.OS === 'android') {
    StatusBar.setTranslucent(false);
    StatusBar.setBackgroundColor('#22C55E');
    StatusBar.setBarStyle('dark-content');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F14' }}>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: '#0B0F14',
          },
        }}>
        {isLoggedIn ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </View>
  );
}
