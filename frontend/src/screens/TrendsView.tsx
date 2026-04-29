import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Animated,
  Easing,
} from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, type Palette } from "../theme";
import { radii, shadow } from "../styles";
import type { LogEntry, Profile } from "../types";
import { HealthData } from "../healthKit";

type Period = "today" | "7d" | "30d";

type DaySummary = {
  dateKey: string;
  label: string;
  kcal: number;
  p: number;
  f: number;
  c: number;
  hasData: boolean;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function getPastDateKeys(n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function shortLabel(dateKey: string, period: "7d" | "30d"): string {
  const d = new Date(dateKey + "T12:00:00");
  if (period === "7d") return d.toLocaleDateString("en-GB", { weekday: "short" }).slice(0, 2).toUpperCase();
  return String(d.getDate());
}

function buildSummaries(log: LogEntry[], dateKeys: string[], period: "7d" | "30d"): DaySummary[] {
  return dateKeys.map((dk) => {
    const entries = log.filter((e) => e.dateKey === dk);
    const tot = entries.reduce(
      (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
      { kcal: 0, p: 0, f: 0, c: 0 }
    );
    return { dateKey: dk, label: shortLabel(dk, period), ...tot, hasData: entries.length > 0 };
  });
}

// ─── DonutChart ───────────────────────────────────────────────────────────────

function DonutChart({ p, f, c, kcal, target }: { p: number; f: number; c: number; kcal: number; target: number }) {
  const { C } = useTheme();
  const SIZE = 190;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 66;
  const SW = 20;
  const circ = 2 * Math.PI * R;

  const pKcal = p * 4;
  const cKcal = c * 4;
  const fKcal = f * 9;
  const total = pKcal + cKcal + fKcal;
  const hasData = total > 0;
  const pctTarget = target > 0 ? Math.round((kcal / target) * 100) : 0;

  const segs = hasData
    ? [
        { frac: pKcal / total, color: C.science, start: 0 },
        { frac: cKcal / total, color: C.gold,    start: pKcal / total },
        { frac: fKcal / total, color: C.fire,    start: (pKcal + cKcal) / total },
      ].map((s) => ({ ...s, frac: Math.max(0, s.frac - 0.018) }))
    : [];

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track ring */}
        <Circle cx={cx} cy={cy} r={R} fill="none" stroke={C.border} strokeWidth={SW} />

        {segs.map((s, i) => {
          if (s.frac <= 0) return null;
          const len = circ * s.frac;
          return (
            <Circle
              key={i}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={SW}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-circ * s.start}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            />
          );
        })}

        {/* Centre labels */}
        <SvgText x={cx} y={cy - 10} textAnchor="middle" fill={hasData ? C.text : C.textMute} fontSize={26} fontWeight="700">
          {Math.round(kcal)}
        </SvgText>
        <SvgText x={cx} y={cy + 8} textAnchor="middle" fill={C.textDim} fontSize={10} fontWeight="600">
          KCAL
        </SvgText>
        <SvgText x={cx} y={cy + 24} textAnchor="middle" fill={hasData ? C.optimal : C.textMute} fontSize={10}>
          {hasData ? `${pctTarget}% OF TARGET` : "NO DATA YET"}
        </SvgText>
      </Svg>

      {/* Legend row */}
      <View style={{ flexDirection: "row", gap: 24, marginTop: 6 }}>
        {[
          { label: "PROTEIN", color: C.science, g: p, kc: pKcal },
          { label: "CARBS",   color: C.gold,    g: c, kc: cKcal },
          { label: "FAT",     color: C.fire,    g: f, kc: fKcal },
        ].map((m) => (
          <View key={m.label} style={{ alignItems: "center", gap: 2 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color }} />
            <Text style={{ color: m.color, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 }}>{m.label}</Text>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700" }}>{Math.round(m.g)}g</Text>
            <Text style={{ color: C.textDim, fontSize: 10 }}>{pct(m.kc)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── MacroCards ───────────────────────────────────────────────────────────────

function MacroCards({ p, f, c, profile }: { p: number; f: number; c: number; profile: Profile }) {
  const { C, isDark } = useTheme();
  const items = [
    { label: "PROTEIN", val: p, target: profile.protein, color: C.science, unit: "g" },
    { label: "CARBS",   val: c, target: profile.carbs,   color: C.gold,    unit: "g" },
    { label: "FAT",     val: f, target: profile.fat,     color: C.fire,    unit: "g" },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
      {items.map((m) => {
        const pct = m.target > 0 ? Math.min(1, m.val / m.target) : 0;
        return (
          <View key={m.label} style={[{ flex: 1, backgroundColor: C.card, borderRadius: radii.md, padding: 10, borderWidth: 1, borderColor: C.border }, shadow(isDark, 1)]}>
            <Text style={{ color: m.color, fontSize: 9, fontWeight: "700", letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</Text>
            <Text style={{ color: C.text, fontSize: 16, fontWeight: "700" }}>{Math.round(m.val)}{m.unit}</Text>
            <Text style={{ color: C.textMute, fontSize: 10 }}>/ {Math.round(m.target)}{m.unit}</Text>
            <View style={{ height: 2, backgroundColor: C.border, borderRadius: 1, marginTop: 6 }}>
              <View style={{ height: 2, width: `${pct * 100}%`, backgroundColor: m.color, borderRadius: 1 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── BarChart ─────────────────────────────────────────────────────────────────

function BarChart({ summaries, target }: { summaries: DaySummary[]; target: number }) {
  const { C } = useTheme();
  const BAR_H = 100;
  const maxKcal = Math.max(target * 1.2, ...summaries.map((d) => d.kcal), 100);
  const targetY = (target / maxKcal) * BAR_H;

  return (
    <View>
      <View style={{ height: BAR_H + 4, position: "relative" }}>
        {/* Target dashed line */}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 4 + targetY, height: 1, backgroundColor: C.borderHi }} />

        <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_H, gap: 3 }}>
          {summaries.map((d) => {
            const h = d.hasData ? Math.max(2, Math.round((d.kcal / maxKcal) * BAR_H)) : 2;
            const over = target > 0 ? (d.kcal - target) / target : 0;
            const color = !d.hasData ? C.border
              : over > 0.1  ? C.penalty
              : over >= -0.1 ? C.optimal
              : C.science;
            return (
              <View key={d.dateKey} style={{ flex: 1, height: h, backgroundColor: color, borderRadius: 2 }} />
            );
          })}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={{ flexDirection: "row", gap: 3, marginTop: 5 }}>
        {summaries.map((d) => (
          <Text key={d.dateKey} style={{ flex: 1, textAlign: "center", color: C.textMute, fontSize: 9 }} numberOfLines={1}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── AveragesCard ─────────────────────────────────────────────────────────────

function AveragesCard({ summaries, profile }: { summaries: DaySummary[]; profile: Profile }) {
  const { C, isDark } = useTheme();
  const active = summaries.filter((d) => d.hasData);
  if (active.length === 0) return null;

  const n = active.length;
  const avg = active.reduce(
    (a, d) => ({ kcal: a.kcal + d.kcal / n, p: a.p + d.p / n, f: a.f + d.f / n, c: a.c + d.c / n }),
    { kcal: 0, p: 0, f: 0, c: 0 }
  );

  const row = (label: string, val: number, target: number, color: string, unit: string) => {
    const barW = target > 0 ? Math.min(1, val / target) : 0;
    return (
      <View key={label} style={{ marginBottom: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={{ color: C.textDim, fontSize: 11, fontWeight: "600" }}>{label}</Text>
          <Text style={{ color: C.text, fontSize: 11 }}>
            {Math.round(val)}{unit}{" "}
            <Text style={{ color: C.textMute }}>/ {Math.round(target)}{unit}</Text>
          </Text>
        </View>
        <View style={{ height: 3, backgroundColor: C.border, borderRadius: 2 }}>
          <View style={{ height: 3, width: `${barW * 100}%`, backgroundColor: color, borderRadius: 2 }} />
        </View>
      </View>
    );
  };

  return (
    <View style={[{ backgroundColor: C.card, borderRadius: radii.md, padding: 14, borderWidth: 1, borderColor: C.border, marginTop: 16 }, shadow(isDark, 1)]}>
      <Text style={{ color: C.textDim, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 12 }}>
        DAILY AVERAGE · {n} DAY{n !== 1 ? "S" : ""} LOGGED
      </Text>
      {row("CALORIES", avg.kcal, profile.calories, C.optimal,  " kcal")}
      {row("PROTEIN",  avg.p,    profile.protein,  C.science,  "g")}
      {row("CARBS",    avg.c,    profile.carbs,    C.gold,     "g")}
      {row("FAT",      avg.f,    profile.fat,      C.fire,     "g")}
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function ChartLegend() {
  const { C } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
      {[
        { color: C.optimal, label: "On target" },
        { color: C.science, label: "Under target" },
        { color: C.penalty, label: "Over target" },
      ].map((l) => (
        <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: l.color }} />
          <Text style={{ color: C.textDim, fontSize: 10 }}>{l.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const { C } = useTheme();
  return (
    <Text style={{ color: C.textDim, fontSize: 10, fontWeight: "700", letterSpacing: 1, marginBottom: 12 }}>
      {title}
    </Text>
  );
}

// ─── TrendsView ───────────────────────────────────────────────────────────────

export function TrendsView({ log, profile, healthData }: { log: LogEntry[]; profile: Profile; healthData?: HealthData | null; }) {
  const { C, isDark } = useTheme();
  const [period, setPeriod] = useState<Period>("today");

  // Entry animation
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  const todayDateKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayTotals = useMemo(() => {
    const entries = log.filter((e) => e.dateKey === todayDateKey);
    return entries.reduce(
      (a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }),
      { kcal: 0, p: 0, f: 0, c: 0 }
    );
  }, [log, todayDateKey]);

  const summaries7  = useMemo(() => buildSummaries(log, getPastDateKeys(7),  "7d"),  [log]);
  const summaries30 = useMemo(() => buildSummaries(log, getPastDateKeys(30), "30d"), [log]);

  const exportCSV = async () => {
    const rows = ["Date,Calories (kcal),Protein (g),Carbs (g),Fat (g)"];
    summaries30
      .filter((d) => d.hasData)
      .forEach((d) => rows.push(`${d.dateKey},${Math.round(d.kcal)},${Math.round(d.p)},${Math.round(d.c)},${Math.round(d.f)}`));
    await Share.share({ message: rows.join("\n"), title: "PrimalForge Nutrition Export" });
  };

  const PERIODS: { id: Period; label: string }[] = [
    { id: "today", label: "TODAY" },
    { id: "7d",    label: "7 DAYS" },
    { id: "30d",   label: "30 DAYS" },
  ];

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ translateY }] }}>
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Period toggle */}
      <View style={[{ flexDirection: "row", backgroundColor: C.card, borderRadius: radii.sm, padding: 3, marginBottom: 20, borderWidth: 1, borderColor: C.border }, shadow(isDark, 1)]}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setPeriod(p.id)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: period === p.id ? C.cardHi : "transparent", alignItems: "center" }}
          >
            <Text style={{ color: period === p.id ? C.text : C.textMute, fontSize: 12, fontWeight: "700", letterSpacing: 0.5 }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TODAY ── */}
      {period === "today" && (
        <View style={{ alignItems: "center" }}>
          <SectionHeader title="MACRO SPLIT · TODAY" />
          <DonutChart
            p={todayTotals.p}
            f={todayTotals.f}
            c={todayTotals.c}
            kcal={todayTotals.kcal}
            target={profile.calories}
          />

          {/* Active Calories Deficit View */}
          {healthData && healthData.activeCalories > 0 && (
            <View style={[{ width: '100%', backgroundColor: C.card, borderRadius: radii.md, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 16 }, shadow(isDark, 1)]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                 <Text style={{ color: C.textDim, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>CALORIES IN</Text>
                 <Text style={{ color: C.textDim, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>CALORIES OUT</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                 <Text style={{ color: C.text, fontSize: 16, fontWeight: "900" }}>{Math.round(todayTotals.kcal)} kcal</Text>
                 <View style={{ alignItems: "center" }}>
                    <Ionicons name="flame" size={20} color={C.fire} />
                    <Text style={{ color: C.fire, fontSize: 10, fontWeight: "800", marginTop: 2 }}>{Math.round(healthData.activeCalories)} ACTIVE</Text>
                 </View>
                 <Text style={{ color: C.optimal, fontSize: 16, fontWeight: "900" }}>{Math.round(profile.bmr + healthData.activeCalories)} kcal</Text>
              </View>
              <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 12, overflow: "hidden", flexDirection: "row" }}>
                 <View style={{ flex: todayTotals.kcal, backgroundColor: C.penalty }} />
                 <View style={{ flex: Math.max(0, (profile.bmr + healthData.activeCalories) - todayTotals.kcal), backgroundColor: C.optimal }} />
              </View>
            </View>
          )}

          <MacroCards p={todayTotals.p} f={todayTotals.f} c={todayTotals.c} profile={profile} />
        </View>
      )}

      {/* ── 7 DAYS ── */}
      {period === "7d" && (
        <View>
          <SectionHeader title="CALORIES · LAST 7 DAYS" />
          <View style={[{ backgroundColor: C.card, borderRadius: radii.md, padding: 14, borderWidth: 1, borderColor: C.border }, shadow(isDark, 1)]}>
            <BarChart summaries={summaries7} target={profile.calories} />
            <ChartLegend />
          </View>
          <AveragesCard summaries={summaries7} profile={profile} />
        </View>
      )}

      {/* ── 30 DAYS ── */}
      {period === "30d" && (
        <View>
          <SectionHeader title="CALORIES · LAST 30 DAYS" />
          <View style={[{ backgroundColor: C.card, borderRadius: radii.md, padding: 14, borderWidth: 1, borderColor: C.border }, shadow(isDark, 1)]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ width: 30 * 18 }}>
                <BarChart summaries={summaries30} target={profile.calories} />
              </View>
            </ScrollView>
            <ChartLegend />
          </View>
          <AveragesCard summaries={summaries30} profile={profile} />
        </View>
      )}

      {/* Export */}
      <TouchableOpacity
        onPress={exportCSV}
        activeOpacity={0.85}
        style={[
          {
            marginTop: 24,
            paddingVertical: 14,
            backgroundColor: C.card,
            borderRadius: radii.sm,
            borderWidth: 1,
            borderColor: C.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          },
          shadow(isDark, 1),
        ]}
      >
        <Ionicons name="download-outline" size={16} color={C.textDim} />
        <Text style={{ color: C.textDim, fontSize: 12, fontWeight: "700", letterSpacing: 1 }}>
          EXPORT 30-DAY CSV
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </Animated.View>
  );
}
