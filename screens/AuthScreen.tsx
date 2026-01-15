import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList, RootStackParamList } from 'navigation/types';
import { loginUser } from 'services/authservice';
type AuthNav = CompositeNavigationProp<
  NativeStackNavigationProp<AuthStackParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation<AuthNav>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#209d4e' }}>
      <View style={{ flex: 1 }}>
        {/* ===== TOP BRAND AREA ===== */}
        <View
          style={{
            flex: 1.1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 20, // optical centering
          }}>
          {/* Brand */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 36, // slightly bigger
              fontWeight: '800',
              letterSpacing: 0.5, // subtle premium feel
            }}>
            Sign in to your Account
          </Text>

          {/* Accent line (very subtle but powerful) */}
          <View
            style={{
              width: 48,
              height: 3,
              backgroundColor: '#16A34A',
              borderRadius: 2,
              marginTop: 2,
            }}
          />

          {/* Subtitle */}
          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              marginTop: 4,
              fontSize: 16,
              lineHeight: 22,
              maxWidth: '85%', // prevents wide flat text
            }}>
            Welcome back, let’s win today
          </Text>
        </View>

        {/* ===== BOTTOM SHEET ===== */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 32,
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 30,
          }}>
          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#111827',
              marginBottom: 20,
            }}>
            Login
          </Text>

          {/* EMAIL */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 14,
              height: 56,
              marginBottom: 16,
            }}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: '#111827',
              }}
            />
          </View>

          {/* PASSWORD */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              paddingHorizontal: 14,
              height: 56,
              marginBottom: 10,
            }}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 16,
                color: '#111827',
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* FORGOT PASSWORD */}
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 22 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#16A34A',
              }}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* LOGIN CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              backgroundColor: '#209d4e',
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
              shadowColor: '#209d4e',
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 10,
            }}
            onPress={async () => {
              try {
                await loginUser(email, password);

                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Tabs' }],
                });
              } catch (e: any) {
                alert('Invalid email or password');
              }
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: '700',
              }}>
              Login
            </Text>
          </TouchableOpacity>

          {/* OR */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            <Text
              style={{
                marginHorizontal: 10,
                color: '#9CA3AF',
                fontSize: 12,
              }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
          </View>

          {/* GOOGLE LOGIN */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              height: 52,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
            <AntDesign name="google" size={18} color="#111827" />
            <Text
              style={{
                marginLeft: 10,
                fontSize: 15,
                fontWeight: '600',
                color: '#111827',
              }}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          {/* REGISTER LINK */}
          <View
            style={{
              marginTop: 18,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#6B7280',
              }}>
              Don’t have an account?
            </Text>

            <TouchableOpacity>
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#209d4e',
                }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* LEGAL */}
          <Text
            style={{
              marginTop: 22,
              fontSize: 12,
              textAlign: 'center',
              color: '#9CA3AF',
              lineHeight: 18,
            }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
