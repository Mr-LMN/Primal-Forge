import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, TIPS, XP_RULES, todayKey, todayDisplay, formatDateDisplay, round } from "../data";
import { styles } from "../styles";
import { haptic } from "../utils";
import type { Profile, Totals, WeightEntry } from "../types";

function MacroBar({
  label,
  unit,
  value,
  target,
  color,
}: {
  label: string;
  unit: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  return (
    <View style={styles.macroCard} testID={`macro-${label.toLowerCase()}`}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroValueRow}>
        <Text style={styles.macroValue}>{round(value, 1)}</Text>
        <Text style={styles.macroTarget}> / {round(target)} {unit}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CarbStatusCard({
  status,
  delta,
  target,
  consumed,
}: {
  status: "optimal" | "warning" | "penalty";
  delta: number;
  target: number;
  consumed: number;
}) {
  const color = status === "optimal" ? C.optimal : status === "warning" ? C.warning : C.penalty;
  const tag = status === "optimal" ? "OPTIMAL" : status === "warning" ? "WARNING" : "OVERFLOW";
  const detail =
    status === "optimal"
      ? `${round(target - consumed, 1)}g under target. Glycogen stable.`
      : status === "warning"
      ? `+${round(delta, 1)}g over. Within tolerance.`
      : `+${round(delta, 1)}g over. Penalty engaged.`;
  return (
    <View style={[styles.statusCard, { borderColor: color }]} testID="carb-status-card">
      <View style={styles.statusHeader}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.statusTag, { color }]}>CARB STATUS · {tag}</Text>
      </View>
      <Text style={styles.statusDetail}>{detail}</Text>
    </View>
  );
}

function BurpeePenalty({ burpees }: { burpees: number }) {
  const [siphon, setSiphon] = useState(false);
  const blocks = useMemo(() => {
    if (burpees <= 50) return [];
    const per = Math.ceil(burpees / 6);
    return Array.from({ length: 6 }, (_, i) => ({ idx: i + 1, offset: i * 30, reps: per }));
  }, [burpees]);
  return (
    <View style={styles.penaltyCard} testID="burpee-penalty">
      <Text style={styles.penaltyTag}>EXCESS CARB DEBT</Text>
      <Text style={styles.penaltyValue} testID="burpee-count">🔴 {burpees} BURPEES REQUIRED</Text>
      <Text style={styles.penaltyFormula}>
        ((excess × 4 kcal) ÷ 1.4) — repay glycogen surplus or store as adipose.
      </Text>
      {burpees > 50 && (
        <TouchableOpacity
          testID="siphon-alarm-btn"
          onPress={() => {
            haptic("warn");
            setSiphon(true);
          }}
          style={styles.siphonBtn}
        >
          <Ionicons name="alarm-outline" size={16} color={C.bg} />
          <Text style={styles.siphonBtnText}>INITIATE SIPHON ALARM</Text>
        </TouchableOpacity>
      )}
      <Modal visible={siphon} transparent animationType="fade" onRequestClose={() => setSiphon(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} testID="siphon-modal">
            <Text style={styles.modalTitle}>SIPHON PROTOCOL</Text>
            <Text style={styles.modalSub}>
              Burpees fragmented across 3 hours. Every 30 min. GLUT4 stays open.
            </Text>
            {blocks.map((b) => (
              <View key={b.idx} style={styles.block}>
                <Text style={styles.blockIdx}>0{b.idx}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockTime}>+{b.offset} MIN</Text>
                  <Text style={styles.blockReps}>{b.reps} BURPEES</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={() => setSiphon(false)} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStatBox}>
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

export function HUDView({
  profile,
  totals,
  waterMl,
  waterTarget,
  addWater,
  weights,
  tip,
  intelReadToday,
  onIntelTap,
}: {
  profile: Profile;
  totals: Totals;
  waterMl: number;
  waterTarget: number;
  addWater: (delta: number) => void;
  weights: WeightEntry[];
  tip: typeof TIPS[0];
  intelReadToday: boolean;
  onIntelTap: () => void;
}) {
  const carbDelta = totals.c - profile.carbs;
  let carbStatus: "optimal" | "warning" | "penalty" = "optimal";
  if (carbDelta > 20) carbStatus = "penalty";
  else if (carbDelta > 0) carbStatus = "warning";
  const burpees = carbDelta > 20 ? Math.ceil((Math.max(0, carbDelta) * 4) / 1.4) : 0;
  const lastWeight = weights[0];
  const trend =
    weights.length >= 2 ? weights[0].weight - weights[weights.length - 1].weight : 0;

  return (
    <ScrollView contentContainerStyle={styles.scrollPad} testID="hud-view">
      <Text style={styles.sectionKicker}>HUD · {todayDisplay()}</Text>

      <TouchableOpacity
        testID="daily-intel-card"
        onPress={onIntelTap}
        activeOpacity={0.85}
        style={[styles.intelCard, intelReadToday && styles.intelCardRead]}
      >
        <View style={styles.intelHeader}>
          <Text style={styles.intelKicker}>DAILY INTEL</Text>
          {!intelReadToday && (
            <View style={styles.intelXpBadge}>
              <Ionicons name="flash" size={10} color={C.gold} />
              <Text style={styles.intelXpBadgeText}>+{XP_RULES.intelRead} XP</Text>
            </View>
          )}
          {intelReadToday && (
            <View style={styles.intelXpBadge}>
              <Ionicons name="checkmark" size={10} color={C.optimal} />
              <Text style={[styles.intelXpBadgeText, { color: C.optimal }]}>CLAIMED</Text>
            </View>
          )}
        </View>
        <Text style={styles.intelTag}>{tip.tag}</Text>
        <Text style={styles.intelTitle}>{tip.title}</Text>
        <Text style={styles.intelTease} numberOfLines={2}>
          {tip.body}
        </Text>
        <Text style={styles.intelTapHint}>TAP TO READ →</Text>
      </TouchableOpacity>

      <View style={styles.macroGrid}>
        <MacroBar label="CALORIES" unit="kcal" value={totals.kcal} target={profile.calories} color={C.text} />
        <MacroBar label="PROTEIN" unit="g" value={totals.p} target={profile.protein} color={C.science} />
        <MacroBar label="FAT" unit="g" value={totals.f} target={profile.fat} color={C.warning} />
        <MacroBar
          label="CARBS"
          unit="g"
          value={totals.c}
          target={profile.carbs}
          color={
            carbStatus === "optimal" ? C.optimal : carbStatus === "warning" ? C.warning : C.penalty
          }
        />
      </View>

      <CarbStatusCard status={carbStatus} delta={carbDelta} target={profile.carbs} consumed={totals.c} />
      {burpees > 0 && <BurpeePenalty burpees={burpees} />}

      <View style={styles.waterCard} testID="water-card">
        <View style={styles.waterHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.waterLabel}>HYDRATION · WATER</Text>
            <Text style={styles.waterValue}>
              {waterMl} <Text style={styles.waterTarget}>/ {waterTarget} ml</Text>
            </Text>
          </View>
          <Ionicons name="water" size={28} color={C.science} />
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, (waterMl / waterTarget) * 100)}%`, backgroundColor: C.science },
            ]}
          />
        </View>
        <View style={styles.waterBtnRow}>
          <TouchableOpacity testID="water-minus-btn" onPress={() => addWater(-250)} style={styles.waterBtn}>
            <Ionicons name="remove" size={18} color={C.text} />
            <Text style={styles.waterBtnText}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-plus-btn" onPress={() => addWater(250)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} />
            <Text style={[styles.waterBtnText, { color: C.bg }]}>250ml</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="water-500-btn" onPress={() => addWater(500)} style={[styles.waterBtn, styles.waterBtnPrimary]}>
            <Ionicons name="add" size={18} color={C.bg} />
            <Text style={[styles.waterBtnText, { color: C.bg }]}>500ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.miniStats}>
        <MiniStat label="LBM" value={`${profile.lbm} kg`} />
        <MiniStat label="BMR" value={`${profile.bmr}`} />
        <MiniStat label="TDEE" value={`${profile.tdee}`} />
      </View>

      {lastWeight && (
        <View style={styles.weightTrendCard} testID="weight-trend">
          <View style={{ flex: 1 }}>
            <Text style={styles.weightTrendLabel}>LATEST WEIGH-IN</Text>
            <Text style={styles.weightTrendValue}>{lastWeight.weight} kg</Text>
            <Text style={styles.weightTrendDate}>{formatDateDisplay(lastWeight.date)}</Text>
          </View>
          {weights.length >= 2 && (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.weightTrendLabel}>TREND</Text>
              <Text
                style={[
                  styles.weightTrendDelta,
                  { color: trend < 0 ? C.optimal : trend > 0 ? C.warning : C.textDim },
                ]}
              >
                {trend > 0 ? "+" : ""}{round(trend, 1)} kg
              </Text>
              <Text style={styles.weightTrendDate}>over {weights.length} entries</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
