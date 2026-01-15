import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AppHeader from 'components/AppHeader';
import { H2HContestCard } from 'components/H2HContestCard';

import { useStakes } from 'hooks/useStakes';

export default function ContestListScreen() {
  const route = useRoute<any>();
  const { match } = route.params;
  const { stakes, loading } = useStakes();

  return (
    <View className="flex-1 bg-black">
      <AppHeader title={`${match.teamA} vs ${match.teamB}`} showBack />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ================= MATCH SUMMARY ================= */}
        <View className="mt-4 rounded-3xl border border-white/5 bg-[#121823] p-4">
          {/* LEAGUE */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-slate-400">{match.league}</Text>

            <View className="rounded-full bg-emerald-500/15 px-3 py-1">
              <Text className="text-[11px] font-semibold text-emerald-400">H2H</Text>
            </View>
          </View>

          {/* TEAMS */}
          <View className="mt-4 flex-row items-center justify-between">
            {/* TEAM A */}
            <View className="flex-1 items-center">
              {match.teamALogo ? (
                <Image
                  source={{ uri: match.teamALogo }}
                  style={{ width: 46, height: 46 }}
                  resizeMode="contain"
                />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                  <Text className="font-bold text-white">
                    {match.teamA.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="mt-2 text-sm font-semibold text-white">{match.teamA}</Text>
            </View>

            {/* VS */}
            <View className="mx-2 items-center">
              <Text className="text-xs font-bold text-slate-500">VS</Text>
            </View>

            {/* TEAM B */}
            <View className="flex-1 items-center">
              {match.teamBLogo ? (
                <Image
                  source={{ uri: match.teamBLogo }}
                  style={{ width: 46, height: 46 }}
                  resizeMode="contain"
                />
              ) : (
                <View className="h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                  <Text className="font-bold text-white">
                    {match.teamB.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text className="mt-2 text-sm font-semibold text-white">{match.teamB}</Text>
            </View>
          </View>

          {/* META */}
          <View className="mt-4 items-center">
            <View className="rounded-full bg-white/10 px-4 py-1">
              <Text className="text-xs font-semibold text-slate-300">Head-to-Head • 2 Players</Text>
            </View>
          </View>
        </View>

        {/* ================= H2H SECTION ================= */}
        <View className="mt-8 flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-slate-400">HEAD TO HEAD</Text>

          <Text className="text-xs text-slate-500">Choose your team</Text>
        </View>

        {/* CONTEST LIST */}
        {!loading ? (
          <View className="mt-3">
            {stakes.map((stake) => (
              <H2HContestCard
                key={stake.id}
                entry={stake.amount}
                commissionPct={stake.commissionPct}
                teamA={{
                  name: match.teamA,
                  logoUrl: match.teamALogo,
                }}
                teamB={{
                  name: match.teamB,
                  logoUrl: match.teamBLogo,
                }}
              />
            ))}
          </View>
        ) : (
          /* LOADING STATE */
          <View className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-28 rounded-2xl bg-white/5" />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
