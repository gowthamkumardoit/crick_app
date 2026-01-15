import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { joinedMatches } from 'store/matchStore';
import { useNavigation } from '@react-navigation/native';
type Props = {
  entry: number;
  commissionPct: number;
  teamA: { name: string; logoUrl?: string };
  teamB: { name: string; logoUrl?: string };
};

export function H2HContestCard({ entry, commissionPct, teamA, teamB }: Props) {
  const prize = Math.floor(entry * 2 * (1 - commissionPct / 100));

  const joinedA = 0; // later from backend
  const joinedB = 0;
  const total = 2;

  const walletBalance = 300;
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasBalance = walletBalance >= entry;
  const navigation = useNavigation<any>();
  const confirmJoin = () => {
    if (!selectedTeam || !hasBalance) return;

    joinedMatches.push({
      matchId: `${teamA.name}-vs-${teamB.name}-${entry}`,
      selectedTeam,
      entry,
      prize,
      status: 'UPCOMING',
    });

    setConfirmOpen(false);
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <View className="mb-4 rounded-2xl border border-white/5 bg-[#111823] px-4 py-3">
        {/* TOP: PRIZE + ENTRY */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] tracking-wide text-slate-400 uppercase">Winner Takes</Text>
            <Text className="text-2xl font-extrabold text-emerald-400">₹{prize}</Text>
            <Text className="mt-0.5 text-[11px] text-slate-500">Head to Head • 2 Players</Text>
          </View>

          <View className="items-end">
            <View className="rounded-lg bg-white/10 px-3 py-1">
              <Text className="text-xs font-semibold text-white">Entry ₹{entry}</Text>
            </View>
            <Text className="mt-1 text-[10px] text-slate-500">One-time entry</Text>
          </View>
        </View>

        {/* DIVIDER */}
        <View className="my-3 flex-row items-center">
          <View className="h-[1px] flex-1 bg-white/5" />
          <Text className="mx-2 text-[11px] text-slate-500">Pick your team</Text>
          <View className="h-[1px] flex-1 bg-white/5" />
        </View>

        {/* TEAM SELECTION */}
        <View className="flex-row gap-3">
          <TeamSelectCard
            team={teamA}
            selected={selectedTeam === 'A'}
            disabled={joinedA === 1}
            label="Back"
            selectedText="You’re backing"
            onPress={() => {
              setSelectedTeam('A');
              setConfirmOpen(true);
            }}
          />

          <TeamSelectCard
            team={teamB}
            selected={selectedTeam === 'B'}
            disabled={joinedB === 1}
            label="Back"
            selectedText="You’re backing"
            onPress={() => {
              setSelectedTeam('B');
              setConfirmOpen(true);
            }}
          />
        </View>
      </View>

      {/* ================= CONFIRM MODAL ================= */}
      <Modal visible={confirmOpen} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/80">
          <View className="rounded-t-3xl bg-[#121823] p-6">
            <Text className="text-center text-lg font-bold text-white">Confirm Your Team</Text>

            <View className="my-4 flex-row items-center justify-center gap-3">
              <Image
                source={{ uri: selectedTeam === 'A' ? teamA.logoUrl : teamB.logoUrl }}
                className="h-14 w-14 rounded-full bg-zinc-800"
                resizeMode="contain"
              />
              <Text className="text-lg font-semibold text-white">
                {selectedTeam === 'A' ? teamA.name : teamB.name}
              </Text>
            </View>

            <View className="mb-4 rounded-xl bg-black/40 p-4">
              <Row label="Wallet Balance" value={`₹${walletBalance}`} />
              <Row label="Entry Fee" value={`₹${entry}`} />
              <Row label="Winning Amount" value={`₹${prize}`} />
            </View>

            {!hasBalance && (
              <Text className="mb-3 text-center text-sm text-red-400">
                Insufficient wallet balance
              </Text>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-white/10 py-3">
                <Text className="text-center font-semibold text-white">Cancel</Text>
              </TouchableOpacity>

              {hasBalance ? (
                <TouchableOpacity
                  onPress={confirmJoin}
                  className="flex-1 rounded-xl bg-emerald-500 py-3">
                  <Text className="text-center font-bold text-black">CONFIRM</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setConfirmOpen(false);

                    // 👇 navigate to Wallet tab
                    navigation.navigate('WalletTab', {
                      screen: 'WalletHome', // or AddCash
                    });
                  }}
                  className="flex-1 rounded-xl bg-yellow-500 py-3">
                  <Text className="text-center font-bold text-black">ADD CASH</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ================= TEAM CARD ================= */

function TeamSelectCard({
  team,
  selected,
  disabled,
  onPress,
  label,
  selectedText,
}: {
  team: { name: string; logoUrl?: string };
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
  label: string;
  selectedText: string;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`flex-1 rounded-2xl border p-3 ${
        selected ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-black/30'
      } ${disabled ? 'opacity-50' : ''}`}>
      {/* ACTION TEXT */}
      <Text className="text-center text-[10px] text-slate-400">
        {selected ? selectedText : label}
      </Text>

      {/* LOGO */}
      <View className="mt-2 items-center">
        <Image
          source={{ uri: team.logoUrl }}
          className="h-12 w-12 rounded-full bg-zinc-800"
          resizeMode="contain"
        />
      </View>

      {/* TEAM NAME */}
      <Text className="mt-2 text-center text-xs font-semibold text-white">{team.name}</Text>

      {/* SELECTION STATE */}
      {selected && (
        <Text className="mt-1 text-center text-[11px] font-semibold text-emerald-400">
          Selected
        </Text>
      )}
    </TouchableOpacity>
  );
}

/* ================= ROW ================= */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className="text-sm font-semibold text-white">{value}</Text>
    </View>
  );
}
