/**
 * PRIMALFORGE — HUD VIEW (Phase 2 Refresh)
 *
 *   • Theme-aware via useTheme() + useStyles()
 *   • Animated SVG macro rings replace flat progress bars
 *   • Daily Intel card uses gradient border + bolder typography
 *   • Burpee Penalty modal redesigned to match new design language
 *   • Subtle entry animation on mount (fade + slide)
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  StyleSheet,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  TIPS,
  XP_RULES,
  todayDisplay,
  formatDateDisplay,
  round,
} from "../data";
import { useStyles, radii, shadow } from "../styles";
import { useTheme } from "../theme";
import { haptic } from "../utils";
import { MacroRing } from "../components/MacroRing";
import type { Profile, Totals, WeightEntry } from "../types";

/* ─── Daily Intel card with gradient border ────────────────────────── */
function DailyIntel({
  tip,
  read,
  onTap,
}: {
  tip: typeof TIPS[0];
  read: boolean;
  onTap: () => void;
}) {
  const { C, isDark } = useTheme();
  const gradColors = read
    ? [C.border, C.border]
    : isDark
      ? ([C.science, C.fire] as [string, string])
      : ([C.science, C.gold] as [string, string]);

  return (
    <TouchableOpacity
      testID="daily-intel-card"
      onPress={onTap}
      activeOpacity={0.85}
      style={[
        intelS.wrap,
        { borderRadius: radii.lg },
        shadow(isDark, read ? 1 : 2),
        read && { opacity: 0.72 },
      ]}
    >
      <LinearGradient
        colors={gradColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[intelS.gradBorder, { borderRadius: radii.lg }]}
      >
        <View
          style={[
            intelS.inner,
            {
              backgroundColor: C.card,
              borderRadius: radii.lg - 1,
            },
          ]}
        >
          <View style={intelS.header}>
            <View style={intelS.kickerRow}>
              <View style={[intelS.dot, { backgroundColor: read ? C.optimal : C.science }]} />
              <Text style={[intelS.kicker, { color: read ? C.optimal : C.science }]}>
                DAILY INTEL
              </Text>
            </View>
            {!read ? (
              <View
                style={[
                  intelS.xpBadge,
                  {
                    backgroundColor: isDark ? "rgba(245,180,0,0.18)" : "rgba(245,180,0,0.14)",
                  },
                ]}
              >
                <Ionicons name="flash" size={11} color={C.gold} />
                <Text style={[intelS.xpText, { color: C.gold }]}>+{XP_RULES.intelRead} XP</Text>
              </View>
            ) : (
              <View
                style={[
                  intelS.xpBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(34,197,94,0.18)"
                      : "rgba(22,163,74,0.14)",
                  },
                ]}
              >
                <Ionicons name="checkmark" size={11} color={C.optimal} />
                <Text style={[intelS.xpText, { color: C.optimal }]}>CLAIMED</Text>
              </View>
            )}
          </View>

          <Text
            style={[
              intelS.tag,
              {
                color: C.science,
                backgroundColor: isDark
                  ? "rgba(14,165,233,0.12)"
                  : "rgba(2,132,199,0.08)",
              },
            ]}
          >
            {tip.tag}
          </Text>
          <Text style={[intelS.title, { color: C.text }]}>{tip.title}</Text>
          <Text style={[intelS.tease, { color: C.textDim }]} numberOfLines={2}>
            {tip.body}
          </Text>

          <View style={intelS.footer}>
            <Text style={[intelS.tap, { color: C.science }]}>TAP TO READ</Text>
            <Ionicons name="arrow-forward" size={12} color={C.science} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ─── Carb Status pill card ─────────────────────────────────────────── */
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
  const { C, isDark } = useTheme();
  const color = status === "optimal" ? C.optimal : status === "warning" ? C.warning : C.penalty;
  const tag = status === "optimal" ? "OPTIMAL" : status === "warning" ? "WARNING" : "OVERFLOW";
  const detail =
    status === "optimal"
      ? `${round(target - consumed, 1)}g under target. Glycogen stable.`
      : status === "warning"
        ? `+${round(delta, 1)}g over. Within tolerance.`
        : `+${round(delta, 1)}g over. Penalty engaged.`;

  return (
    <View
      style={[
        statusS.card,
        {
          borderColor: color,
          backgroundColor: C.card,
          borderRadius: radii.lg,
          ...shadow(isDark, 1),
        },
      ]}
      testID="carb-status-card"
    >
      <View style={statusS.head}>
        <View style={[statusS.dot, { backgroundColor: color }]} />
        <Text style={[statusS.tag, { color }]}>CARB STATUS · {tag}</Text>
      </View>
      <Text style={[statusS.detail, { color: C.text }]}>{detail}</Text>
    </View>
  );
}

/* ─── Burpee Penalty (redesigned) ───────────────────────────────────── */
function BurpeePenalty({ burpees }: { burpees: number }) {
  const { C, isDark } = useTheme();
  const [siphon, setSiphon] = useState(false);

  const blocks = useMemo(() => {
    if (burpees <= 50) return [];
    const per = Math.ceil(burpees / 6);
    return Array.from({ length: 6 }, (_, i) => ({ idx: i + 1, offset: i * 30, reps: per }));
  }, [burpees]);

  return (
    <LinearGradient
      colors={isDark ? ["#280a0a", "#160505"] : ["#fde7e7", "#fff5f5"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        penaltyS.wrap,
        {
          borderColor: C.penalty,
          borderRadius: radii.lg,
          ...shadow(isDark, 2),
        },
      ]}
    >
      <View testID="burpee-penalty">
        <View style={penaltyS.headRow}>
          <Ionicons name="flame" size={16} color={C.penalty} />
          <Text style={[penaltyS.tag, { color: C.penalty }]}>EXCESS CARB DEBT</Text>
        </View>
        <Text style={[penaltyS.value, { color: isDark ? C.text : C.penalty }]} testID="burpee-count">
          {burpees} BURPEES
        </Text>
        <Text style={[penaltyS.formula, { color: C.textDim }]}>
          ((excess × 4 kcal) ÷ 1.4) — repay glycogen surplus or store as adipose.
        </Text>

        {burpees > 50 && (
          <TouchableOpacity
            testID="siphon-alarm-btn"
            onPress={() => {
              haptic("warn");
              setSiphon(true);
            }}
            style={[
              penaltyS.siphonBtn,
              { backgroundColor: C.penalty, ...shadow(isDark, 2) },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="alarm-outline" size={16} color="#fff" />
            <Text style={penaltyS.siphonText}>INITIATE SIPHON ALARM</Text>
          </TouchableOpacity>
        )}

        <Modal
          visible={siphon}
          transparent
          animationType="fade"
          onRequestClose={() => setSiphon(false)}
        >
          <Pressable
            style={[modalS.overlay, { backgroundColor: "rgba(0,0,0,0.78)" }]}
            onPress={() => setSiphon(false)}
          >
            <Pressable
              style={[
                modalS.card,
                {
                  backgroundColor: C.card,
                  borderColor: C.penalty,
                  borderRadius: radii.xl,
                  ...shadow(isDark, 3),
                },
              ]}
              onPress={(e) => e.stopPropagation()}
              testID="siphon-modal"
            >
              <View style={modalS.headRow}>
                <View style={modalS.headLeft}>
                  <View style={[modalS.dot, { backgroundColor: C.penalty }]} />
                  <Text style={[modalS.title, { color: C.penalty }]}>SIPHON PROTOCOL</Text>
                </View>
                <TouchableOpacity onPress={() => setSiphon(false)}>
                  <Ionicons name="close" size={22} color={C.textDim} />
                </TouchableOpacity>
              </View>
              <Text style={[modalS.sub, { color: C.textDim }]}>
                Burpees fragmented across 3 hours. Every 30 min. GLUT4 stays open.
              </Text>
              {blocks.map((b) => (
                <View
                  key={b.idx}
                  style={[
                    modalS.block,
                    {
                      backgroundColor: C.bg2,
                      borderColor: C.border,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <Text style={[modalS.blockIdx, { color: C.penalty }]}>
                    {String(b.idx).padStart(2, "0")}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[modalS.blockTime, { color: C.textDim }]}>
                      +{b.offset} MIN
                    </Text>
                    <Text style={[modalS.blockReps, { color: C.text }]}>
                      {b.reps} BURPEES
                    </Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setSiphon(false)}
                style={[
                  modalS.ack,
                  {
                    backgroundColor: C.text,
                    borderRadius: radii.md,
                    ...shadow(isDark, 2),
                  },
                ]}
                activeOpacity={0.85}
              >
                <Text style={[modalS.ackText, { color: C.bg }]}>ACKNOWLEDGE</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </LinearGradient>
  );
}

/* ─── Mini stat box ─────────────────────────────────────────────────── */
function MiniStat({ label, value }: { label: string; value: string }) {
  const { C, isDark } = useTheme();
  return (
    <View
      style={[
        miniS.box,
        {
          backgroundColor: C.card,
          borderColor: C.border,
          borderRadius: radii.md,
          ...shadow(isDark, 1),
        },
      ]}
    >
      <Text style={[miniS.label, { color: C.textMute }]}>{label}</Text>
      <Text style={[miniS.value, { color: C.text }]}>{value}</Text>
    </View>
  );
}

/* ─── HUDView ───────────────────────────────────────────────────────── */
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
  const { C, isDark } = useTheme();
  const styles = useStyles();

  const carbDelta = totals.c - profile.carbs;
  let carbStatus: "optimal" | "warning" | "penalty" = "optimal";
  if (carbDelta > 20) carbStatus = "penalty";
  else if (carbDelta > 0) carbStatus = "warning";
  const burpees = carbDelta > 20 ? Math.ceil((Math.max(0, carbDelta) * 4) / 1.4) : 0;
  const lastWeight = weights[0];
  const trend =
    weights.length >= 2 ? weights[0].weight - weights[weights.length - 1].weight : 0;

  /* Entry animation: fade + subtle slide-up on mount */
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  const carbColor =
    carbStatus === "optimal" ? C.optimal : carbStatus === "warning" ? C.warning : C.penalty;

  const waterPct = Math.min(100, (waterMl / Math.max(1, waterTarget)) * 100);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
      <ScrollView contentContainerStyle={styles.scrollPad} testID="hud-view">
        <Text style={styles.sectionKicker}>HUD · {todayDisplay()}</Text>

        <DailyIntel tip={tip} read={intelReadToday} onTap={onIntelTap} />

        {/* Macro rings (animated) */}
        <View style={hudS.ringGrid}>
          <MacroRing
            label="CALORIES"
            unit="kcal"
            value={totals.kcal}
            target={profile.calories}
            color={C.text}
            colorAccent={C.gold}
            hero
          />
          <MacroRing
            label="PROTEIN"
            unit="g"
            value={totals.p}
            target={profile.protein}
            color={C.science}
          />
          <MacroRing
            label="FAT"
            unit="g"
            value={totals.f}
            target={profile.fat}
            color={C.warning}
          />
          <MacroRing
            label="CARBS"
            unit="g"
            value={totals.c}
            target={profile.carbs}
            color={carbColor}
          />
        </View>

        <CarbStatusCard
          status={carbStatus}
          delta={carbDelta}
          target={profile.carbs}
          consumed={totals.c}
        />
        {burpees > 0 && <BurpeePenalty burpees={burpees} />}

        {/* Hydration */}
        <View
          style={[
            hudS.water,
            {
              backgroundColor: C.card,
              borderColor: C.border,
              borderRadius: radii.lg,
              ...shadow(isDark, 1),
            },
          ]}
          testID="water-card"
        >
          <View style={hudS.waterHead}>
            <View style={{ flex: 1 }}>
              <Text style={[hudS.waterLabel, { color: C.textDim }]}>HYDRATION · WATER</Text>
              <Text style={[hudS.waterValue, { color: C.text }]}>
                {waterMl}{" "}
                <Text style={[hudS.waterTarget, { color: C.textMute }]}>
                  / {waterTarget} ml
                </Text>
              </Text>
            </View>
            <Ionicons name="water" size={28} color={C.science} />
          </View>
          <View style={[hudS.bar, { backgroundColor: C.border }]}>
            <View
              style={{
                height: 4,
                width: `${waterPct}%`,
                backgroundColor: C.science,
                borderRadius: 2,
              }}
            />
          </View>
          <View style={hudS.waterBtnRow}>
            <TouchableOpacity
              testID="water-minus-btn"
              onPress={() => addWater(-250)}
              style={[
                hudS.waterBtn,
                {
                  backgroundColor: C.bg2,
                  borderColor: C.border,
                  borderRadius: radii.sm,
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="remove" size={18} color={C.text} />
              <Text style={[hudS.waterBtnText, { color: C.text }]}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="water-plus-btn"
              onPress={() => addWater(250)}
              style={[
                hudS.waterBtn,
                {
                  backgroundColor: C.science,
                  borderColor: C.science,
                  borderRadius: radii.sm,
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={[hudS.waterBtnText, { color: "#fff" }]}>250ml</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="water-500-btn"
              onPress={() => addWater(500)}
              style={[
                hudS.waterBtn,
                {
                  backgroundColor: C.science,
                  borderColor: C.science,
                  borderRadius: radii.sm,
                },
              ]}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={[hudS.waterBtnText, { color: "#fff" }]}>500ml</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={hudS.miniStats}>
          <MiniStat label="LBM" value={`${profile.lbm} kg`} />
          <MiniStat label="BMR" value={`${profile.bmr}`} />
          <MiniStat label="TDEE" value={`${profile.tdee}`} />
        </View>

        {lastWeight && (
          <View
            style={[
              hudS.weightCard,
              {
                backgroundColor: C.card,
                borderColor: C.border,
                borderRadius: radii.lg,
                ...shadow(isDark, 1),
              },
            ]}
            testID="weight-trend"
          >
            <View style={{ flex: 1 }}>
              <Text style={[hudS.weightLabel, { color: C.textMute }]}>LATEST WEIGH-IN</Text>
              <Text style={[hudS.weightValue, { color: C.text }]}>{lastWeight.weight} kg</Text>
              <Text style={[hudS.weightDate, { color: C.textMute }]}>
                {formatDateDisplay(lastWeight.date)}
              </Text>
            </View>
            {weights.length >= 2 && (
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[hudS.weightLabel, { color: C.textMute }]}>TREND</Text>
                <Text
                  style={[
                    hudS.weightDelta,
                    {
                      color: trend < 0 ? C.optimal : trend > 0 ? C.warning : C.textDim,
                    },
                  ]}
                >
                  {trend > 0 ? "+" : ""}
                  {round(trend, 1)} kg
                </Text>
                <Text style={[hudS.weightDate, { color: C.textMute }]}>
                  over {weights.length} entries
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

/* ─── Local style stacks ────────────────────────────────────────────── */
const intelS = StyleSheet.create({
  wrap: { marginBottom: 16 },
  gradBorder: { padding: 1.5 },
  inner: { padding: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  kicker: {
    letterSpacing: 3,
    fontSize: 10,
    fontWeight: "900",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.xs,
  },
  xpText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  tag: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.xs,
    alignSelf: "flex-start",
    marginBottom: 10,
    overflow: "hidden",
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  tease: { fontSize: 13, lineHeight: 19 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  tap: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
});

const statusS = StyleSheet.create({
  card: { borderWidth: 1.5, padding: 16, marginBottom: 14 },
  head: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  tag: { fontSize: 11, fontWeight: "900", letterSpacing: 3 },
  detail: { fontSize: 14, lineHeight: 20 },
});

const penaltyS = StyleSheet.create({
  wrap: {
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 14,
  },
  headRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  tag: { fontSize: 11, letterSpacing: 3, fontWeight: "900" },
  value: { fontSize: 26, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  formula: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  siphonBtn: {
    paddingVertical: 14,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  siphonText: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 12,
  },
});

const modalS = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", padding: 20 },
  card: { borderWidth: 1.5, padding: 22 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { letterSpacing: 4, fontWeight: "900", fontSize: 14 },
  sub: { fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  block: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  blockIdx: { fontWeight: "900", fontSize: 18, width: 40, letterSpacing: 1 },
  blockTime: { fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  blockReps: { fontWeight: "900", fontSize: 16, marginTop: 2 },
  ack: { paddingVertical: 16, alignItems: "center", marginTop: 4 },
  ackText: { fontWeight: "900", letterSpacing: 3, fontSize: 13 },
});

const miniS = StyleSheet.create({
  box: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    alignItems: "center",
  },
  label: { fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  value: { fontSize: 16, fontWeight: "900", marginTop: 4 },
});

const hudS = StyleSheet.create({
  ringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  water: { padding: 16, marginBottom: 14, borderWidth: StyleSheet.hairlineWidth },
  waterHead: { flexDirection: "row", alignItems: "center" },
  waterLabel: { fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  waterValue: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  waterTarget: { fontSize: 13, fontWeight: "700" },
  bar: { height: 4, borderRadius: 2, marginTop: 12, overflow: "hidden" },
  waterBtnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  waterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  waterBtnText: { fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  miniStats: { flexDirection: "row", gap: 10, marginTop: 4 },
  weightCard: {
    flexDirection: "row",
    padding: 16,
    marginTop: 14,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  weightLabel: { fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  weightValue: { fontSize: 22, fontWeight: "900", marginTop: 4 },
  weightDelta: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  weightDate: { fontSize: 11, marginTop: 2 },
});
