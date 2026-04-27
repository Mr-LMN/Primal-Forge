/**
 * PRIMALFORGE — MUSCLE MAP
 * SVG front/back body silhouette with highlighted muscle groups.
 * Primary muscles: fire/orange · Secondary: warning/amber · Inactive: dim border
 *
 * Usage:
 *   <MuscleMap primary={["chest","triceps"]} secondary={["shoulders"]} />
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Ellipse, Circle } from "react-native-svg";
import { useTheme } from "../theme";

export type MuscleId =
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms"
  | "abs" | "obliques" | "quads" | "hip_flexors"
  | "traps" | "lats" | "rhomboids" | "lower_back"
  | "glutes" | "hamstrings" | "calves";

interface MuscleMapProps {
  primary?: MuscleId[];
  secondary?: MuscleId[];
  size?: number;
}

function useColor(
  id: MuscleId,
  primary: MuscleId[],
  secondary: MuscleId[],
  C: any
): string {
  if (primary.includes(id)) return C.fire;
  if (secondary.includes(id)) return C.warning;
  return C.border;
}

export function MuscleMap({ primary = [], secondary = [], size = 160 }: MuscleMapProps) {
  const { C } = useTheme();
  const gc = (id: MuscleId) => useColor(id, primary, secondary, C); // eslint-disable-line

  // We derive colours for each muscle outside the JSX for hooks compliance
  const col: Record<MuscleId, string> = {
    chest:      primary.includes("chest")      ? C.fire : secondary.includes("chest")      ? C.warning : C.border,
    shoulders:  primary.includes("shoulders")  ? C.fire : secondary.includes("shoulders")  ? C.warning : C.border,
    biceps:     primary.includes("biceps")     ? C.fire : secondary.includes("biceps")     ? C.warning : C.border,
    triceps:    primary.includes("triceps")    ? C.fire : secondary.includes("triceps")    ? C.warning : C.border,
    forearms:   primary.includes("forearms")   ? C.fire : secondary.includes("forearms")   ? C.warning : C.border,
    abs:        primary.includes("abs")        ? C.fire : secondary.includes("abs")        ? C.warning : C.border,
    obliques:   primary.includes("obliques")   ? C.fire : secondary.includes("obliques")   ? C.warning : C.border,
    quads:      primary.includes("quads")      ? C.fire : secondary.includes("quads")      ? C.warning : C.border,
    hip_flexors:primary.includes("hip_flexors")? C.fire : secondary.includes("hip_flexors")? C.warning : C.border,
    traps:      primary.includes("traps")      ? C.fire : secondary.includes("traps")      ? C.warning : C.border,
    lats:       primary.includes("lats")       ? C.fire : secondary.includes("lats")       ? C.warning : C.border,
    rhomboids:  primary.includes("rhomboids")  ? C.fire : secondary.includes("rhomboids")  ? C.warning : C.border,
    lower_back: primary.includes("lower_back") ? C.fire : secondary.includes("lower_back") ? C.warning : C.border,
    glutes:     primary.includes("glutes")     ? C.fire : secondary.includes("glutes")     ? C.warning : C.border,
    hamstrings: primary.includes("hamstrings") ? C.fire : secondary.includes("hamstrings") ? C.warning : C.border,
    calves:     primary.includes("calves")     ? C.fire : secondary.includes("calves")     ? C.warning : C.border,
  };

  const h = size;
  const w = size * 0.9;
  const opacity = (id: MuscleId) => col[id] === C.border ? 0.3 : 0.85;

  return (
    <View style={styles.container}>
      {/* FRONT VIEW */}
      <View style={styles.half}>
        <Text style={[styles.label, { color: C.textMute }]}>FRONT</Text>
        <Svg width={w / 2} height={h} viewBox="0 0 60 120">
          {/* Body outline */}
          <Path d="M30 4 C24 4 20 8 20 14 C20 20 24 24 30 24 C36 24 40 20 40 14 C40 8 36 4 30 4Z"
            fill={C.card} stroke={C.borderHi} strokeWidth="0.8" /> {/* head */}
          {/* Neck */}
          <Path d="M27 24 L27 28 L33 28 L33 24Z" fill={C.card} stroke={C.borderHi} strokeWidth="0.5" />
          {/* Torso */}
          <Path d="M17 28 L14 60 L46 60 L43 28Z" fill={C.card} stroke={C.borderHi} strokeWidth="0.8" />
          {/* Shoulders */}
          <Ellipse cx="14" cy="31" rx="6" ry="4" fill={col.shoulders} opacity={opacity("shoulders")} />
          <Ellipse cx="46" cy="31" rx="6" ry="4" fill={col.shoulders} opacity={opacity("shoulders")} />
          {/* Chest */}
          <Path d="M19 30 L28 30 L28 42 L20 44 Z" fill={col.chest} opacity={opacity("chest")} />
          <Path d="M32 30 L41 30 L40 44 L32 42 Z" fill={col.chest} opacity={opacity("chest")} />
          {/* Abs */}
          <Path d="M24 43 L28 43 L28 48 L24 48Z" fill={col.abs} opacity={opacity("abs")} />
          <Path d="M32 43 L36 43 L36 48 L32 48Z" fill={col.abs} opacity={opacity("abs")} />
          <Path d="M24 49 L28 49 L28 54 L24 54Z" fill={col.abs} opacity={opacity("abs")} />
          <Path d="M32 49 L36 49 L36 54 L32 54Z" fill={col.abs} opacity={opacity("abs")} />
          {/* Obliques */}
          <Path d="M19 42 L23 42 L22 56 L18 56Z" fill={col.obliques} opacity={opacity("obliques")} />
          <Path d="M37 42 L41 42 L42 56 L38 56Z" fill={col.obliques} opacity={opacity("obliques")} />
          {/* Biceps (L & R) */}
          <Path d="M9 33 L12 33 L13 48 L9 46Z" fill={col.biceps} opacity={opacity("biceps")} />
          <Path d="M51 33 L48 33 L47 48 L51 46Z" fill={col.biceps} opacity={opacity("biceps")} />
          {/* Forearms */}
          <Path d="M8 48 L12 47 L12 60 L8 60Z" fill={col.forearms} opacity={opacity("forearms")} />
          <Path d="M52 48 L48 47 L48 60 L52 60Z" fill={col.forearms} opacity={opacity("forearms")} />
          {/* Quads */}
          <Path d="M17 62 L25 62 L24 85 L16 84Z" fill={col.quads} opacity={opacity("quads")} />
          <Path d="M35 62 L43 62 L44 84 L36 85Z" fill={col.quads} opacity={opacity("quads")} />
          {/* Hip flexors */}
          <Path d="M20 58 L28 58 L27 63 L19 63Z" fill={col.hip_flexors} opacity={opacity("hip_flexors")} />
          <Path d="M32 58 L40 58 L41 63 L33 63Z" fill={col.hip_flexors} opacity={opacity("hip_flexors")} />
          {/* Calves front */}
          <Path d="M17 87 L23 87 L22 105 L16 104Z" fill={col.calves} opacity={opacity("calves")} />
          <Path d="M37 87 L43 87 L44 104 L38 105Z" fill={col.calves} opacity={opacity("calves")} />
        </Svg>
      </View>

      {/* BACK VIEW */}
      <View style={styles.half}>
        <Text style={[styles.label, { color: C.textMute }]}>BACK</Text>
        <Svg width={w / 2} height={h} viewBox="0 0 60 120">
          {/* Head */}
          <Path d="M30 4 C24 4 20 8 20 14 C20 20 24 24 30 24 C36 24 40 20 40 14 C40 8 36 4 30 4Z"
            fill={C.card} stroke={C.borderHi} strokeWidth="0.8" />
          {/* Neck */}
          <Path d="M27 24 L27 28 L33 28 L33 24Z" fill={C.card} stroke={C.borderHi} strokeWidth="0.5" />
          {/* Torso */}
          <Path d="M17 28 L14 60 L46 60 L43 28Z" fill={C.card} stroke={C.borderHi} strokeWidth="0.8" />
          {/* Traps */}
          <Path d="M20 28 L30 32 L40 28 L43 28 L30 36 L17 28Z" fill={col.traps} opacity={opacity("traps")} />
          {/* Rear Shoulders */}
          <Ellipse cx="13" cy="31" rx="6" ry="4" fill={col.shoulders} opacity={opacity("shoulders")} />
          <Ellipse cx="47" cy="31" rx="6" ry="4" fill={col.shoulders} opacity={opacity("shoulders")} />
          {/* Lats */}
          <Path d="M17 33 L23 33 L22 52 L15 56Z" fill={col.lats} opacity={opacity("lats")} />
          <Path d="M43 33 L37 33 L38 52 L45 56Z" fill={col.lats} opacity={opacity("lats")} />
          {/* Rhomboids */}
          <Path d="M24 30 L36 30 L35 42 L25 42Z" fill={col.rhomboids} opacity={opacity("rhomboids")} />
          {/* Lower back */}
          <Path d="M23 44 L37 44 L38 57 L22 57Z" fill={col.lower_back} opacity={opacity("lower_back")} />
          {/* Triceps */}
          <Path d="M9 33 L12 33 L13 48 L9 46Z" fill={col.triceps} opacity={opacity("triceps")} />
          <Path d="M51 33 L48 33 L47 48 L51 46Z" fill={col.triceps} opacity={opacity("triceps")} />
          {/* Glutes */}
          <Path d="M17 60 L28 60 L27 70 L16 70Z" fill={col.glutes} opacity={opacity("glutes")} />
          <Path d="M32 60 L43 60 L44 70 L33 70Z" fill={col.glutes} opacity={opacity("glutes")} />
          {/* Hamstrings */}
          <Path d="M17 72 L25 72 L24 88 L16 87Z" fill={col.hamstrings} opacity={opacity("hamstrings")} />
          <Path d="M35 72 L43 72 L44 87 L36 88Z" fill={col.hamstrings} opacity={opacity("hamstrings")} />
          {/* Calves back */}
          <Path d="M17 90 L23 90 L22 106 L16 105Z" fill={col.calves} opacity={opacity("calves")} />
          <Path d="M37 90 L43 90 L44 105 L38 106Z" fill={col.calves} opacity={opacity("calves")} />
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {primary.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.fire }]} />
            <Text style={[styles.legendText, { color: C.textDim }]}>PRIMARY</Text>
          </View>
        )}
        {secondary.length > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.warning }]} />
            <Text style={[styles.legendText, { color: C.textDim }]}>SECONDARY</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  half:      { alignItems: "center", marginHorizontal: 4 },
  label:     { fontSize: 8, fontWeight: "900", letterSpacing: 2, marginBottom: 4 },
  legend:    { flexDirection: "row", gap: 16, marginTop: 8 },
  legendItem:{ flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText:{ fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
});

// Wrap in a flex row for front+back side by side
export function MuscleMapRow({ primary = [], secondary = [], size = 120 }: MuscleMapProps) {
  const { C } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
      <MuscleMap primary={primary} secondary={secondary} size={size} />
    </View>
  );
}
