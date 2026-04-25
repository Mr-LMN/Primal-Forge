import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, GOALS } from "../data";
import { styles } from "../styles";
import { confirmAction } from "../utils";
import type { Profile } from "../types";

export function Header({
  profile,
  streak,
  credits,
  onReset,
  onWeight,
}: {
  profile: Profile;
  streak: number;
  credits: number;
  onReset: () => void;
  onWeight: () => void;
}) {
  const goalLabel = GOALS.find((g) => g.id === profile.goal)?.label || "—";
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.brand}>PRIMALFORGE</Text>
        <Text style={styles.brandSub}>{goalLabel} · {profile.calories} kcal</Text>
      </View>
      {streak > 0 && (
        <View style={styles.streakChip} testID="streak-chip">
          <Ionicons name="flame" size={13} color={C.fire} />
          <Text style={styles.streakChipText}>{streak}</Text>
        </View>
      )}
      {credits > 0 && (
        <View style={styles.xpChip} testID="credits-chip">
          <Ionicons name="diamond" size={11} color={C.gold} />
          <Text style={styles.xpChipText}>{credits}</Text>
        </View>
      )}
      <TouchableOpacity
        testID="header-weight-btn"
        onPress={onWeight}
        style={[styles.iconBtn, { marginRight: 8 }]}
      >
        <Ionicons name="trending-down" size={18} color={C.textDim} />
      </TouchableOpacity>
      <TouchableOpacity
        testID="header-reset-btn"
        onPress={() => confirmAction("WIPE PROTOCOL", "Reset profile, logs, bank, XP?", onReset)}
        style={styles.iconBtn}
      >
        <Ionicons name="power" size={18} color={C.textDim} />
      </TouchableOpacity>
    </View>
  );
}
