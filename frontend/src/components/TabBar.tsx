/**
 * PRIMALFORGE — TAB BAR (Redesigned)
 * Active tab: filled pill with tinted background + label.
 * Inactive: icon only, dimmed.
 * Frosted glass container via expo-blur (falls back to solid bg on Android).
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import type { Tab } from "../types";

const ITEMS: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { id: "hud",    label: "HUD",    icon: "pulse-outline",     iconActive: "pulse" },
  { id: "fuel",   label: "FUEL",   icon: "flame-outline",     iconActive: "flame" },
  { id: "forge",  label: "FORGE",  icon: "fitness-outline",   iconActive: "fitness" },
  { id: "scan",   label: "SCAN",   icon: "scan-outline",      iconActive: "scan" },
  { id: "vault",  label: "VAULT",  icon: "trophy-outline",    iconActive: "trophy" },
  { id: "trends", label: "TRENDS", icon: "analytics-outline", iconActive: "analytics" },
];

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { C, isDark } = useTheme();
  const s = makeStyles(C);

  const inner = (
    <View style={s.row}>
      {ITEMS.map((it) => {
        const active = tab === it.id;
        return (
          <TouchableOpacity
            key={it.id}
            testID={`tab-${it.id}`}
            onPress={() => setTab(it.id)}
            style={[s.btn, active && s.btnActive]}
            activeOpacity={0.75}
          >
            <Ionicons
              name={active ? it.iconActive : it.icon}
              size={active ? 18 : 20}
              color={active ? C.bg : C.textMute}
            />
            {active && (
              <Text style={s.label}>{it.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? "dark" : "light"}
        style={s.blurContainer}
      >
        {inner}
      </BlurView>
    );
  }

  // Android / web — solid background
  return (
    <View style={[s.blurContainer, { backgroundColor: C.bg2 }]}>
      {inner}
    </View>
  );
}

function makeStyles(C: any) {
  return StyleSheet.create({
    blurContainer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.borderHi,
    },
    row: {
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 8,
      paddingBottom: Platform.OS === "ios" ? 4 : 8,
      gap: 4,
    },
    btn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      borderRadius: 10,
      minHeight: 44,
    },
    btnActive: {
      backgroundColor: C.text,
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 4,
    },
    label: {
      color: C.bg,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1.5,
    },
  });
}
