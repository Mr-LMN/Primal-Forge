/**
 * PRIMALFORGE — HEADER (Redesigned)
 *
 * ┌─────────────────────────────────────────────┐
 * │  [LOGO placeholder]  PRIMAL·FORGE           │
 * │  Goal · kcal chip        🔥 streak  💎 XP  │
 * │                        [☀/🌙] [📉] [⚡]   │
 * └─────────────────────────────────────────────┘
 *
 * To swap in the real logo: replace the wordmark View with:
 *   <Image source={require("../../assets/logo.png")} style={{ width:120, height:32 }} />
 * and remove the text-based wordmark below.
 */
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GOALS } from "../data";
import { useTheme } from "../theme";
import { confirmAction } from "../utils";
import type { Profile } from "../types";

interface HeaderProps {
  profile: Profile;
  streak: number;
  credits: number;
  onReset: () => void;
  onWeight: () => void;
  onThemeToggle: () => void;
  isDark: boolean;
  /** Pass a fresh XP value each time XP is earned to trigger the pulse animation */
  xpTotal?: number;
}

export function Header({
  profile,
  streak,
  credits,
  onReset,
  onWeight,
  onThemeToggle,
  isDark,
  xpTotal = 0,
}: HeaderProps) {
  const { C } = useTheme();
  const goalLabel = GOALS.find((g) => g.id === profile.goal)?.label || "—";
  const s = makeStyles(C, isDark);

  // Pulse animation when credits change
  const pulseScale = useRef(new Animated.Value(1)).current;
  const prevXp = useRef(xpTotal);
  useEffect(() => {
    if (xpTotal !== prevXp.current && xpTotal > prevXp.current) {
      prevXp.current = xpTotal;
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.25, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1,    duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [xpTotal]);

  return (
    <LinearGradient
      colors={isDark ? ["#0a0a0a", "#141414"] : ["#ffffff", "#f5f5f3"]}
      style={s.gradient}
    >
      {/* ── Left: Wordmark ── */}
      <View style={s.left}>
        {/* ▼▼▼ LOGO PLACEHOLDER — swap this View with an <Image> when logo is ready ▼▼▼ */}
        <View style={s.wordmark}>
          <Text style={s.wordmarkPrimal}>PRIMAL</Text>
          <Text style={s.wordmarkForge}>FORGE</Text>
        </View>
        {/* ▲▲▲ END LOGO PLACEHOLDER ▲▲▲ */}
        <View style={s.subtitleRow}>
          <View style={[s.goalChip, { borderColor: C.borderHi }]}>
            <Text style={[s.goalChipText, { color: C.textDim }]}>{goalLabel}</Text>
          </View>
          <Text style={s.kcalText}>{profile.calories} kcal</Text>
        </View>
      </View>

      {/* ── Right: Chips + Actions ── */}
      <View style={s.right}>
        {/* Streak */}
        {streak > 0 && (
          <View style={[s.chip, { borderColor: C.fire + "44", backgroundColor: C.fire + "18" }]} testID="streak-chip">
            <Text style={{ fontSize: 11 }}>🔥</Text>
            <Text style={[s.chipText, { color: C.fire }]}>{streak}</Text>
          </View>
        )}

        {/* XP Credits */}
        {credits > 0 && (
          <Animated.View
            testID="credits-chip"
            style={[
              s.chip,
              { borderColor: C.gold + "55", backgroundColor: C.gold + "15" },
              { transform: [{ scale: pulseScale }] },
            ]}
          >
            <Ionicons name="diamond" size={10} color={C.gold} />
            <Text style={[s.chipText, { color: C.gold }]}>{credits}</Text>
          </Animated.View>
        )}

        {/* Theme toggle */}
        <TouchableOpacity
          testID="header-theme-btn"
          onPress={onThemeToggle}
          style={s.iconBtn}
        >
          <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={17} color={C.textDim} />
        </TouchableOpacity>

        {/* Weight check-in */}
        <TouchableOpacity
          testID="header-weight-btn"
          onPress={onWeight}
          style={s.iconBtn}
        >
          <Ionicons name="trending-down" size={17} color={C.textDim} />
        </TouchableOpacity>

        {/* Reset */}
        <TouchableOpacity
          testID="header-reset-btn"
          onPress={() =>
            confirmAction("WIPE PROTOCOL", "Reset profile, logs, bank, XP?", onReset)
          }
          style={s.iconBtn}
        >
          <Ionicons name="power" size={17} color={C.textDim} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function makeStyles(C: any, isDark: boolean) {
  return StyleSheet.create({
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.borderHi,
      // Subtle shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    left: {
      flex: 1,
    },
    wordmark: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 1,
    },
    wordmarkPrimal: {
      color: C.text,
      fontSize: 18,
      fontWeight: "300",
      letterSpacing: 3,
    },
    wordmarkForge: {
      color: C.fire,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: 3,
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 3,
    },
    goalChip: {
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    goalChipText: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.5,
    },
    kcalText: {
      color: C.textMute,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    chipText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
