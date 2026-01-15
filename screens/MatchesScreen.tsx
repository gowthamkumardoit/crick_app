import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import AppHeader from 'components/AppHeader';
import { joinedMatches } from 'store/matchStore';
import { useMatches } from 'hooks/useMatches';
import { mapMatchToCard } from 'utlis/mapMatch';
import DreamMatchCard from 'components/DreamMatchCard';

type TabType = 'MATCHES' | 'MY_MATCHES';

export default function MatchesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('MATCHES');

  return (
    <View className="flex-1 bg-black">
      <AppHeader title="MATCHES" showBack />

      {/* 🔘 TABS */}
      <View className="mx-4 mt-4 flex-row rounded-xl bg-[#121823] p-1">
        <TabButton
          label="Matches"
          active={activeTab === 'MATCHES'}
          onPress={() => setActiveTab('MATCHES')}
        />
        <TabButton
          label="My Matches"
          active={activeTab === 'MY_MATCHES'}
          onPress={() => setActiveTab('MY_MATCHES')}
        />
      </View>

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'MATCHES' ? <MatchesList /> : <MyMatchesList />}
      </ScrollView>
    </View>
  );
}

/* ---------- TABS ---------- */

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 rounded-lg py-3 ${active ? 'bg-green-600' : ''}`}>
      <Text className={`text-center font-semibold ${active ? 'text-black' : 'text-slate-400'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- MATCHES TAB ---------- */

function MatchesList() {
  const { matches, loading } = useMatches();

  if (loading) {
    return (
      <View className="mt-10 items-center">
        <ActivityIndicator />
      </View>
    );
  }

  const upcomingMatches = matches.filter((m: any) => m.status === 'UPCOMING');

  return (
    <>
      {upcomingMatches.length > 0 && (
        <>
          <Text className="mt-8 mb-3 text-sm font-semibold text-slate-400">UPCOMING MATCHES</Text>

          {upcomingMatches.map((m: any) => {
            const card = mapMatchToCard(m);

            return (
              <DreamMatchCard
                key={card.id}
                league={card.league}
                teamA={card.teamA}
                teamB={card.teamB}
                teamALogo={m.teamA?.logoUrl}
                teamBLogo={m.teamB?.logoUrl}
                startTime={card.startTime} // 👈 IMPORTANT
              />
            );
          })}
        </>
      )}
    </>
  );
}

/* ---------- MY MATCHES TAB ---------- */
function MyMatchesList() {
  if (joinedMatches.length === 0) {
    return (
      <View className="mt-24 items-center">
        <Text className="text-lg font-semibold text-white">No Matches Joined</Text>
        <Text className="mt-1 text-sm text-slate-400">Join a contest to see it here</Text>
      </View>
    );
  }

  return (
    <>
      <Text className="mt-6 mb-3 text-sm font-semibold text-slate-400">MY MATCHES</Text>

      {joinedMatches.map((m) => (
        <View key={m.matchId} className="mb-4 rounded-2xl border border-white/5 bg-[#121823] p-4">
          {/* TOP ROW */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-white">{m.teams}</Text>

            <StatusBadge status={m.status} />
          </View>

          {/* DETAILS */}
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-xs text-slate-400">Entry ₹{m.entry}</Text>
            <Text className="text-xs text-slate-400">Prize ₹{m.prize}</Text>
          </View>

          {/* SELECTED TEAM */}
          {m.selectedTeam && (
            <View className="mt-3">
              <Text className="text-xs text-slate-500">Selected Team</Text>
              <Text className="text-sm font-semibold text-emerald-400">Team {m.selectedTeam}</Text>
            </View>
          )}
        </View>
      ))}
    </>
  );
}

/* ---------- CARDS ---------- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    UPCOMING: 'bg-emerald-500/15 text-emerald-400',
    LIVE: 'bg-red-500/15 text-red-400',
    WON: 'bg-green-500/15 text-green-400',
    LOST: 'bg-zinc-500/15 text-zinc-400',
  };

  return (
    <View className={`rounded-full px-3 py-1 ${map[status]}`}>
      <Text className="text-[11px] font-semibold">{status}</Text>
    </View>
  );
}
