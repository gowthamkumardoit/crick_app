import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCountdown } from 'hooks/useCountdown';
import { Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';

type Props = {
  league: string;
  teamA: string;
  teamB: string;
  teamALogo?: string;
  teamBLogo?: string;
  startTime?: number;
};

export default function DreamMatchCard({
  league,
  teamA,
  teamB,
  teamALogo,
  teamBLogo,
  startTime,
}: Props) {
  const navigation = useNavigation<any>();
  const countdown = useCountdown(startTime);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() =>
          navigation.navigate('ContestList', {
            match: { league, teamA, teamB, teamALogo, teamBLogo },
          })
        }
        className="mb-4 rounded-3xl border border-emerald-500/20 bg-[#0f1520] px-4 py-4">
        {/* ───────── HEADER ───────── */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-medium text-slate-400">{league}</Text>

          {/* STATUS BADGE */}
          <View className="rounded-full bg-emerald-500/20 px-3 py-1">
            <Text className="text-[11px] font-bold text-emerald-400">UPCOMING</Text>
          </View>
        </View>

        {/* ───────── TEAMS ───────── */}
        <View className="mt-5 flex-row items-center justify-between">
          <TeamBlock name={teamA} logo={teamALogo} />

          {/* CENTER */}
          <View className="items-center">
            <Text className="text-xs font-semibold text-slate-500">Match Starts In</Text>

            {/* TIMER BELOW VS */}
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="mt-1 rounded-full bg-black/40 px-3 py-1">
              <Text className="text-[12px] font-semibold text-emerald-400"> {countdown}</Text>
            </Animated.View>
          </View>

          <TeamBlock name={teamB} logo={teamBLogo} />
        </View>

        {/* ───────── FOOTER ───────── */}
        <View className="mt-4 rounded-xl bg-emerald-500/10 py-2">
          <Text className="text-center text-xs font-semibold text-emerald-400">Contests Open</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ---------------- TEAM BLOCK ---------------- */

function TeamBlock({ name, logo }: { name: string; logo?: string }) {
  return (
    <View className="items-center">
      <View className="mb-1 h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-zinc-800">
        {logo ? (
          <Image source={{ uri: logo }} className="h-full w-full" resizeMode="contain" />
        ) : (
          <Text className="text-sm font-extrabold text-white">
            {name.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>

      <Text className="mt-1 text-xs font-semibold text-white">{name}</Text>
    </View>
  );
}
