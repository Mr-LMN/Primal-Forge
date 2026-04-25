import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../data";
import { styles } from "../styles";
import type { Tab } from "../types";

export function TabBar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "hud", label: "HUD", icon: "pulse" },
    { id: "fuel", label: "FUEL", icon: "flame" },
    { id: "forge", label: "FORGE", icon: "fitness" },
    { id: "scan", label: "SCAN", icon: "scan-outline" },
    { id: "vault", label: "VAULT", icon: "trophy" },
  ];
  return (
    <View style={styles.tabBar}>
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <TouchableOpacity key={it.id} testID={`tab-${it.id}`} onPress={() => setTab(it.id)} style={styles.tabBtn}>
            <Ionicons name={it.icon} size={20} color={active ? C.text : C.textMute} />
            <Text style={[styles.tabLabel, active && { color: C.text }]}>{it.label}</Text>
            {active && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
