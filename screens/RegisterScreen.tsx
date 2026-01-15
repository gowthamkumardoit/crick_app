import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#209d4e' }}>
      <View style={{ flex: 1 }}>
        {/* ===== TOP BRAND AREA ===== */}
        <View
          style={{
            flex: 1.1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingTop: 40,
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 36,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}>
            PREDICT GURU
          </Text>

          <View
            style={{
              width: 48,
              height: 3,
              backgroundColor: '#16A34A',
              borderRadius: 2,
              marginTop: 2,
            }}
          />

          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              marginTop: 6,
              fontSize: 16,
              lineHeight: 22,
              maxWidth: '85%',
            }}>
            Create your account to get started
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
            Register
          </Text>

          {/* FULL NAME */}
          <View style={inputStyle}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Full name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              style={inputTextStyle}
            />
          </View>

          {/* EMAIL */}
          <View style={inputStyle}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputTextStyle}
            />
          </View>

          {/* PASSWORD */}
          <View style={inputStyle}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={inputTextStyle}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={inputStyle}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={inputTextStyle}
            />
          </View>

          {/* REGISTER CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={{
              backgroundColor: '#209d4e',
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 8,
              marginBottom: 22,
              shadowColor: '#209d4e',
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 10,
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 17,
                fontWeight: '700',
              }}>
              Create Account
            </Text>
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 13, color: '#6B7280' }}>Already have an account?</Text>
            <TouchableOpacity>
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#209d4e',
                }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ===== SHARED STYLES ===== */

const inputStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  backgroundColor: '#F9FAFB',
  borderRadius: 14,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingHorizontal: 14,
  height: 56,
  marginBottom: 16,
};

const inputTextStyle = {
  flex: 1,
  marginLeft: 10,
  fontSize: 16,
  color: '#111827',
};
