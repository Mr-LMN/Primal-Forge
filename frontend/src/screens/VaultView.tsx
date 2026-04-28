import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TIPS, XP_RULES, CREDIT_PER_XP, PERKS, todayKey, formatDateDisplay, round } from "../data";
import { useStyles } from "../styles";
import { useTheme } from "../theme";
import { confirmAction } from "../utils";
import type { Profile, XPState, BankHistoryEntry, WeightEntry, WorkoutLogged } from "../types";

export function VaultView({
  profile,
  xp,
  credits,
  bank,
  bankHistory,
  consumedCarbs,
  weights,
  workoutsLogged,
  onBank,
  onResetBank,
  onSpendCredit,
}: {
  profile: Profile;
  xp: XPState;
  credits: number;
  bank: number;
  bankHistory: BankHistoryEntry[];
  consumedCarbs: number;
  weights: WeightEntry[];
  workoutsLogged: WorkoutLogged[];
  onBank: () => void;
  onResetBank: () => void;
  onSpendCredit: (cost: number) => void;
}) {
  const { C } = useTheme();
  const styles = useStyles();
  const today = todayKey();
  const todayXP = xp.daily[today] || {};
  const todayDeficit = profile.carbs - consumedCarbs;
  const alreadyBanked = bankHistory.some((h) => h.date === today);
  const todayWorkouts = workoutsLogged.filter((w) => w.date === today);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const earnList = [
    { label: "Daily Intel Read", got: !!todayXP.intelRead, xp: XP_RULES.intelRead },
    {
      label: `Meals Logged (cap ${XP_RULES.mealCap})`,
      got: (todayXP.mealsXP || 0) > 0,
      xp: todayXP.mealsXP || 0,
      capXp: XP_RULES.mealCap * XP_RULES.mealLogged,
    },
    {
      label: `Workouts Done (cap ${XP_RULES.workoutCap})`,
      got: (todayXP.workoutsXP || 0) > 0,
      xp: todayXP.workoutsXP || 0,
      capXp: XP_RULES.workoutCap * XP_RULES.workoutLogged,
    },
    { label: "Macros Hit", got: !!todayXP.macrosHit, xp: XP_RULES.macrosHit },
    { label: "Daily Weigh-in", got: !!todayXP.weighIn, xp: XP_RULES.weighIn },
  ];

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
    <ScrollView contentContainerStyle={styles.scrollPad} testID="vault-view">
      <Text style={styles.sectionKicker}>VAULT · YOUR FORGE</Text>

      <View style={styles.vaultHero}>
        <Text style={styles.vaultLabel}>TOTAL XP</Text>
        <Text style={styles.vaultXp} testID="vault-xp">{xp.total.toLocaleString()}</Text>
        <Text style={styles.vaultXpSub}>{CREDIT_PER_XP - (xp.total % CREDIT_PER_XP)} XP to next credit</Text>
      </View>

      <View style={styles.vaultSplit}>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>STREAK</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="flame" size={20} color={C.fire} />
            <Text style={styles.vaultStatValue} testID="vault-streak">{xp.streak}</Text>
          </View>
        </View>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>CREDITS</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="diamond" size={18} color={C.gold} />
            <Text style={[styles.vaultStatValue, { color: C.gold }]} testID="vault-credits">{credits}</Text>
          </View>
        </View>
        <View style={styles.vaultStat}>
          <Text style={styles.vaultStatLabel}>WORKOUTS</Text>
          <Text style={styles.vaultStatValue}>{todayWorkouts.length}/{workoutsLogged.length}</Text>
        </View>
      </View>

      <Text style={styles.subKicker}>TODAY'S EARNINGS</Text>
      <View style={styles.todayEarn}>
        {earnList.map((row, i) => (
          <View key={i} style={[styles.earnRow, i === earnList.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={row.got ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={row.got ? C.optimal : C.textMute}
              />
              <Text style={styles.earnLabel}>{row.label}</Text>
            </View>
            <Text style={row.got ? styles.earnXp : styles.earnXpDim}>
              {row.got ? `+${row.xp}` : row.capXp ? `0 / ${row.capXp}` : `+${row.xp}`}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.subKicker}>UNLOCKS &amp; PERKS</Text>
      {PERKS.map((p) => {
        const canAfford = credits >= p.cost;
        return (
          <View key={p.id} style={[styles.perkCard, !canAfford && styles.perkCardLocked]} testID={`perk-${p.id}`}>
            <View style={styles.perkHead}>
              <Text style={styles.perkPartner}>{p.partner.toUpperCase()}</Text>
              <View style={styles.perkCost}>
                <Ionicons name="diamond" size={10} color={C.gold} />
                <Text style={styles.perkCostText}>{p.cost}</Text>
              </View>
            </View>
            <Text style={styles.perkTitle}>{p.title}</Text>
            <Text style={styles.perkDesc}>{p.description}</Text>
            <TouchableOpacity
              testID={`redeem-${p.id}`}
              disabled={!canAfford}
              onPress={() => {
                confirmAction(
                  "REDEEM",
                  `Spend ${p.cost} credit${p.cost > 1 ? "s" : ""} on ${p.title}?`,
                  () => onSpendCredit(p.cost)
                );
              }}
              style={[styles.perkRedeem, !canAfford && styles.perkRedeemDisabled]}
            >
              <Ionicons name={canAfford ? "gift" : "lock-closed"} size={12} color={canAfford ? C.bg : C.textMute} />
              <Text style={canAfford ? styles.perkRedeemText : styles.perkRedeemTextDisabled}>
                {canAfford ? "REDEEM" : `NEED ${p.cost - credits} MORE`}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={[styles.subKicker, { marginTop: 24 }]}>CARB BANK · LEDGER</Text>
      <View style={styles.bankCard}>
        <Text style={styles.bankLabel}>BANKED SURPLUS</Text>
        <Text style={styles.bankValue} testID="bank-value">{round(bank, 1)}g</Text>
        <Text style={styles.bankSub}>Glycogen reserves accumulated. Spend on weekend supercompensation.</Text>
      </View>
      <View style={styles.todayDeficitCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>TODAY'S DEFICIT</Text>
          <Text style={[styles.deficitValue, { color: todayDeficit > 0 ? C.optimal : C.penalty }]}>
            {todayDeficit > 0 ? "+" : ""}{round(todayDeficit, 1)}g
          </Text>
          <Text style={styles.hint}>Target {profile.carbs}g · Consumed {round(consumedCarbs, 1)}g</Text>
        </View>
        <TouchableOpacity
          testID="bank-deficit-btn"
          onPress={onBank}
          disabled={todayDeficit <= 0 || alreadyBanked}
          style={[styles.bankBtn, (todayDeficit <= 0 || alreadyBanked) && styles.bankBtnDisabled]}
        >
          <Text style={styles.bankBtnText}>{alreadyBanked ? "BANKED" : "BANK IT"}</Text>
        </TouchableOpacity>
      </View>
      {bankHistory.length > 0 && (
        <View style={[styles.todayLogHeader, { marginTop: 16 }]}>
          <Text style={styles.subKicker}>HISTORY · {bankHistory.length}</Text>
          <TouchableOpacity
            testID="reset-bank-btn"
            onPress={() => confirmAction("RESET BANK", "Clear all banked surplus and history?", onResetBank)}
          >
            <Text style={styles.wipeText}>RESET</Text>
          </TouchableOpacity>
        </View>
      )}
      {bankHistory.map((h) => (
        <View key={h.date} style={styles.historyRow}>
          <Text style={styles.historyDate}>{formatDateDisplay(h.date)}</Text>
          <Text style={styles.historyDeficit}>+{h.deficit}g</Text>
        </View>
      ))}

      <Text style={[styles.subKicker, { marginTop: 24 }]}>ARSENAL ARCHIVE · {TIPS.length} CARDS</Text>
      {TIPS.map((t, i) => (
        <View key={i} style={styles.archiveCard} testID={`archive-${i}`}>
          <View style={styles.archiveHead}>
            <Text style={styles.archiveIdx}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={styles.archiveTag}>{t.tag}</Text>
          </View>
          <Text style={styles.archiveTitle}>{t.title}</Text>
          <Text style={styles.archiveBody}>{t.body}</Text>
          <Text style={styles.archiveCitation}>{t.citation}</Text>
        </View>
      ))}
    </ScrollView>
    </Animated.View>
  );
}
