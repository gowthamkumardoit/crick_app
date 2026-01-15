import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from 'components/AppHeader';

import { useNavigation } from '@react-navigation/native';
import { useUser } from 'hooks/useUser';
import { useHomeMatches } from 'hooks/useHomeMatches';
import DreamMatchCard from 'components/DreamMatchCard';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const user = useUser('CURRENT_USER_ID'); // replace with auth uid
  const { upcoming } = useHomeMatches();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="PREDICT GURU" />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}>
        {/* 👋 GREETING */}
        {/* <Text className="mt-2 text-sm text-slate-400">Welcome back,</Text>
        <Text className="text-lg font-bold text-white">{user?.name ?? 'Player'} 👋</Text> */}

        {/* 🔥 HERO */}
        <View className="mt-4 rounded-2xl border border-green-500/30 bg-[#0F1F16] p-6">
          <Text className="text-xs font-semibold text-green-400">LIVE PREDICTIONS</Text>

          <Text className="mt-2 text-2xl font-extrabold text-white">
            Predict Matches.{'\n'}Win Real Cash.
          </Text>

          <Text className="mt-2 text-sm text-slate-400">
            Use your skills, join contests, and win instantly.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Matches')}
            className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-green-500 py-4">
            <Ionicons name="flash" size={18} color="#000" />
            <Text className="font-bold text-black">PLAY NOW</Text>
          </TouchableOpacity>
        </View>

        {/* 💰 WALLET */}
        <View className="mt-5 flex-row items-center justify-between rounded-xl border border-white/5 bg-[#121823] p-5">
          <View>
            <Text className="text-sm text-slate-400">Wallet Balance</Text>
            <Text className="mt-1 text-2xl font-bold text-green-500">
              ₹{user?.wallet?.balance ?? 0}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('WalletTab')}
            className="flex-row items-center gap-1 rounded-lg bg-green-500 px-4 py-2">
            <Ionicons name="add" size={18} color="#000" />
            <Text className="text-xs font-bold text-black">ADD CASH</Text>
          </TouchableOpacity>
        </View>

        {/* ⏳ UPCOMING MATCHES */}
        {/* ⏳ UPCOMING MATCHES */}
        {upcoming.length > 0 && (
          <>
            <View className="mt-7 mb-3 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">Upcoming Matches</Text>

              <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
                <Text className="text-xs font-semibold text-emerald-400">View All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={296} // 👈 CARD WIDTH + GAP
              decelerationRate="fast"
              contentContainerStyle={{ paddingRight: 16 }}>
              {upcoming.map((m) => (
                <View key={m.id} className="mr-4 w-[280px]">
                  <DreamMatchCard
                    league={m.league.shortName}
                    teamA={m.teamA.shortName}
                    teamB={m.teamB.shortName}
                    teamALogo={m.teamA.logoUrl}
                    teamBLogo={m.teamB.logoUrl}
                    startTime={m.startTime}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* 🛡 TRUST */}
        <View className="mt-7 flex-row items-center gap-2 rounded-lg border border-white/5 bg-[#121823] p-4">
          <Ionicons name="shield-checkmark-outline" size={18} color="#22C55E" />
          <Text className="text-sm text-slate-400">
            Secure payments • Verified withdrawals • Fair play
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
