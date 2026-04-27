import React, { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  C,
  WORKOUTS,
  FOCUS_META,
  XP_RULES,
  EQUIPMENT_META,
  workoutRequiredEquipment,
  canPerform,
  type Workout,
  type WorkoutFocus,
  type Equipment,
  type MuscleGroup,
} from "../data";
import { styles } from "../styles";
import { haptic, openYouTube } from "../utils";
import type { WorkoutLogged } from "../types";
import { WorkoutSessionView } from "./WorkoutSessionView";
import {
  searchWgerExercises,
  getWgerExerciseDetail,
  searchExerciseDb,
  wgerSuggestionId,
  ApiError,
  EXERCISEDB_AVAILABLE,
  type WgerSuggestion,
  type WgerExerciseDetail,
  type ExerciseDbEntry,
} from "../api";
import { useTheme } from "../theme";
import { ImageCard } from "../components/ImageCard";
import { MuscleMap } from "../components/MuscleMap";

function exerciseLookupErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) {
      return "Couldn't reach the exercise database. Check your connection and try again.";
    }
    if (err.status === 429) {
      return "Exercise database is rate-limited. Wait a moment and try again.";
    }
    if (err.status >= 500) {
      return "Exercise database is temporarily unavailable. Try again shortly.";
    }
    if (__DEV__) return `Lookup failed: ${err.message}`;
    return "Couldn't load exercise data. Try a different term.";
  }
  return "Couldn't reach the exercise database. Check your connection and try again.";
}

/* ── MET lookup table ──────────────────────────────────── */
function getMet(name: string): number {
  const n = name.toLowerCase();
  if (/running|run|sprint/.test(n)) return 9.5;
  if (/cycling|bike|bicycle/.test(n)) return 7.5;
  if (/burpee|hiit/.test(n)) return 8.0;
  if (/deadlift|squat|bench|row/.test(n)) return 6.0;
  if (/yoga|mobility|stretch|foam/.test(n)) return 2.5;
  if (/push.?up|pull.?up|dip|lunge|bodyweight/.test(n)) return 5.0;
  return 5.0;
}

function calcGlycogen(met: number, weightKg: number, durationMin: number): number {
  const cho = met < 6 ? 0.5 : met <= 8 ? 0.65 : 0.80;
  return (met * weightKg * (durationMin / 60) * 4) * cho / 4;
}

type BuilderExercise = {
  name: string;
  sets: number;
  reps: number;
  durationSec: number;
  useTime: boolean;
  met: number;
};

export function ForgeView({
  equipment,
  setEquipment,
  onLogWorkout,
  loggedToday,
  profile,
}: {
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  onLogWorkout: (w: Workout) => void;
  loggedToday: WorkoutLogged[];
  profile?: { weight: number } | null;
}) {
  const { C: themeC } = useTheme();
  const bodyWeight = profile?.weight ?? 80;
  const [filter, setFilter] = useState<WorkoutFocus | "all">("all");
  const [time, setTime] = useState<"all" | 15 | 30 | 60>("all");
  const [myKitOnly, setMyKitOnly] = useState(false);
  const [eqExpanded, setEqExpanded] = useState(false);
  const [open, setOpen] = useState<Workout | null>(null);
  const [showAlt, setShowAlt] = useState<Record<number, boolean>>({});
  const [inSession, setInSession] = useState(false);

  // Exercise lookup state
  const [lookupVisible, setLookupVisible] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<WgerSuggestion[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupDetailLoading, setLookupDetailLoading] = useState(false);
  const [lookupDetail, setLookupDetail] = useState<WgerExerciseDetail | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [lookupDbEntry, setLookupDbEntry] = useState<ExerciseDbEntry | null>(null);
  const lookupDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Custom workout builder state ──────────────────────────
  const [builderVisible, setBuilderVisible] = useState(false);
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3>(1);
  const [builderName, setBuilderName] = useState("");
  const [builderFocus, setBuilderFocus] = useState<WorkoutFocus>("strength");
  const [builderDuration, setBuilderDuration] = useState(30);
  const [builderExercises, setBuilderExercises] = useState<BuilderExercise[]>([]);
  const [bQuery, setBQuery] = useState("");
  const [bResults, setBResults] = useState<WgerSuggestion[]>([]);
  const [bLoading, setBLoading] = useState(false);
  const bDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openBuilder = () => {
    setBuilderStep(1);
    setBuilderName("");
    setBuilderFocus("strength");
    setBuilderDuration(30);
    setBuilderExercises([]);
    setBQuery("");
    setBResults([]);
    setBuilderVisible(true);
  };

  const handleBSearch = (text: string) => {
    setBQuery(text);
    if (bDebounce.current) clearTimeout(bDebounce.current);
    const term = text.trim();
    if (term.length < 2) { setBResults([]); return; }
    bDebounce.current = setTimeout(async () => {
      setBLoading(true);
      try {
        const res = await searchWgerExercises(term);
        setBResults(res);
      } catch { setBResults([]); }
      finally { setBLoading(false); }
    }, 400);
  };

  const addBuilderExercise = (s: WgerSuggestion) => {
    haptic("light");
    const met = getMet(s.data.name);
    setBuilderExercises((prev) => [
      ...prev,
      { name: s.data.name, sets: 3, reps: 10, durationSec: 60, useTime: false, met },
    ]);
    setBQuery("");
    setBResults([]);
  };

  const updateBuilderEx = (i: number, patch: Partial<BuilderExercise>) => {
    setBuilderExercises((prev) => prev.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  };

  const removeBuilderEx = (i: number) => {
    setBuilderExercises((prev) => prev.filter((_, idx) => idx !== i));
  };

  const totalGlycogen = builderExercises.reduce((sum, ex) => {
    const minPerEx = ex.useTime
      ? ex.durationSec / 60
      : (ex.sets * ex.reps * 3) / 60; // ~3s per rep
    return sum + calcGlycogen(ex.met, bodyWeight, minPerEx);
  }, 0);

  const saveBuilderWorkout = () => {
    if (!builderName.trim() || builderExercises.length === 0) return;
    haptic("success");
    const w: Workout = {
      id: `custom-${Date.now()}`,
      name: builderName.trim().toUpperCase(),
      time: builderDuration,
      focus: builderFocus,
      intensity: "med",
      description: `Custom workout · ${builderExercises.length} exercises · ~${builderDuration} min`,
      scienceNote: `Estimated glycogen cost: ${totalGlycogen.toFixed(1)} g CHO at ${bodyWeight} kg bodyweight.`,
      exercises: builderExercises.map((ex) => ({
        name: ex.name,
        setsReps: ex.useTime ? `${ex.sets} × ${ex.durationSec}s` : `${ex.sets} × ${ex.reps} reps`,
        equipment: ["bodyweight"],
        videoQuery: `${ex.name} exercise tutorial form`,
      })),
    };
    onLogWorkout(w);
    setBuilderVisible(false);
  };

  const filtered = useMemo(() => {
    let list = [...WORKOUTS];
    if (filter !== "all") list = list.filter((w) => w.focus === filter);
    if (time !== "all") list = list.filter((w) => w.time <= time);
    if (myKitOnly) list = list.filter((w) => canPerform(w, equipment));
    return list;
  }, [filter, time, myKitOnly, equipment]);

  const focuses: { id: WorkoutFocus | "all"; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "fatburn", label: "FAT BURN" },
    { id: "performance", label: "PERFORMANCE" },
    { id: "strength", label: "STRENGTH" },
    { id: "metcon", label: "METCON" },
    { id: "mobility", label: "MOBILITY" },
    { id: "recovery", label: "RECOVERY" },
  ];
  const times = [
    { id: "all" as const, label: "ANY" },
    { id: 15 as const, label: "≤ 15 MIN" },
    { id: 30 as const, label: "≤ 30 MIN" },
    { id: 60 as const, label: "≤ 60 MIN" },
  ];

  const allEq = Object.keys(EQUIPMENT_META) as Equipment[];

  const toggleEq = (e: Equipment) => {
    haptic("light");
    setEquipment(equipment.includes(e) ? equipment.filter((x) => x !== e) : [...equipment, e]);
  };

  const clearFilters = () => {
    haptic();
    setFilter("all");
    setTime("all");
    setMyKitOnly(false);
  };

  const filtersActive = filter !== "all" || time !== "all" || myKitOnly;

  const closeLookup = () => {
    if (lookupDebounce.current) clearTimeout(lookupDebounce.current);
    setLookupVisible(false);
    setLookupQuery("");
    setLookupResults([]);
    setLookupDetail(null);
    setLookupDbEntry(null);
    setLookupError("");
  };

  const runLookupSearch = async (term: string) => {
    setLookupLoading(true);
    setLookupError("");
    try {
      const results = await searchWgerExercises(term);
      setLookupResults(results);
    } catch (err) {
      console.warn("[exercise-lookup] search failed:", err);
      setLookupError(exerciseLookupErrorMessage(err));
      setLookupResults([]);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleLookupSearch = (text: string) => {
    setLookupQuery(text);
    setLookupDetail(null);
    setLookupError("");
    if (lookupDebounce.current) clearTimeout(lookupDebounce.current);
    const term = text.trim();
    if (term.length < 2) {
      setLookupResults([]);
      setLookupLoading(false);
      return;
    }
    lookupDebounce.current = setTimeout(() => {
      void runLookupSearch(term);
    }, 400);
  };

  const retryLookupSearch = () => {
    const term = lookupQuery.trim();
    if (term.length < 2) return;
    haptic();
    void runLookupSearch(term);
  };

  const LOCAL_ID_BASE = 100000;

  const openLookupDetail = async (s: WgerSuggestion) => {
    haptic();
    setLookupDetailLoading(true);
    setLookupDbEntry(null);
    setLookupError("");
    try {
      const id = wgerSuggestionId(s);
      const [detail, dbResults] = await Promise.all([
        getWgerExerciseDetail(id),
        EXERCISEDB_AVAILABLE
          ? searchExerciseDb(s.data.name).catch((err) => {
              console.warn("[exercise-lookup] ExerciseDB enrich failed:", err);
              return [] as ExerciseDbEntry[];
            })
          : Promise.resolve([] as ExerciseDbEntry[]),
      ]);
      setLookupDetail(detail);
      if (dbResults.length > 0) setLookupDbEntry(dbResults[0]);
    } catch (err) {
      console.warn("[exercise-lookup] detail failed:", err);
      const id = wgerSuggestionId(s);
      // For non-local exercises that fail to load, show basic info from search result
      if (id < LOCAL_ID_BASE) {
        setLookupDetail({
          baseId: id,
          name: s.data.name,
          category: s.data.category,
          description: "Full exercise data is unavailable offline. Search for this exercise on YouTube for form guides.",
          muscles: [],
          musclesSecondary: [],
          equipment: [],
        });
      } else {
        setLookupError(exerciseLookupErrorMessage(err));
      }
    } finally {
      setLookupDetailLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollPad} testID="forge-view">
        <Text style={styles.sectionKicker}>FORGE · TRAINING LIBRARY</Text>

        <View style={styles.equipmentSection} testID="equipment-section">
          <TouchableOpacity
            testID="equipment-toggle"
            onPress={() => { haptic(); setEqExpanded(!eqExpanded); }}
            style={styles.equipmentHeader}
            activeOpacity={0.7}
          >
            <Text style={styles.equipmentTitle}>MY KIT</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.equipmentCount}>{equipment.length} ITEMS</Text>
              <Ionicons name={eqExpanded ? "chevron-up" : "chevron-down"} size={14} color={C.textDim} />
            </View>
          </TouchableOpacity>
          {eqExpanded && (
            <View style={[styles.filterRow, { marginBottom: 8 }]}>
              {allEq.map((e) => {
                const active = equipment.includes(e);
                const meta = EQUIPMENT_META[e];
                return (
                  <TouchableOpacity
                    key={e}
                    testID={`eq-${e}`}
                    onPress={() => toggleEq(e)}
                    style={[styles.equipmentChip, active && styles.equipmentChipActive]}
                  >
                    <Ionicons name={meta.icon as any} size={11} color={active ? C.bg : C.textDim} />
                    <Text style={[styles.equipmentChipText, active && { color: C.bg }]}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <TouchableOpacity
            testID="my-kit-toggle"
            onPress={() => { haptic(); setMyKitOnly(!myKitOnly); }}
            style={[styles.filterChip, myKitOnly && styles.filterChipActive, { alignSelf: "flex-start", marginTop: 4 }]}
          >
            <Text style={[styles.filterChipText, myKitOnly && { color: C.bg }]}>
              {myKitOnly ? "✓ MATCHES MY KIT" : "FILTER TO MY KIT"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subKicker}>FOCUS</Text>
        <View style={styles.filterRow}>
          {focuses.map((f) => {
            const active = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                testID={`filter-focus-${f.id}`}
                onPress={() => { haptic("light"); setFilter(f.id); }}
                activeOpacity={0.7}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && { color: C.bg }]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subKicker}>MAX TIME</Text>
        <View style={styles.filterRow}>
          {times.map((t) => {
            const active = time === t.id;
            return (
              <TouchableOpacity
                key={String(t.id)}
                testID={`filter-time-${t.id}`}
                onPress={() => { haptic("light"); setTime(t.id); }}
                activeOpacity={0.7}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, active && { color: C.bg }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <TouchableOpacity
            testID="exercise-lookup-btn"
            onPress={() => { haptic(); setLookupVisible(true); }}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: "rgba(14,165,233,0.1)",
              borderWidth: 1, borderColor: C.science,
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
            }}
          >
            <Ionicons name="search" size={13} color={C.science} />
            <Text style={{ color: C.science, fontSize: 11, fontWeight: "900", letterSpacing: 2 }}>
              EXERCISE LOOKUP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="build-workout-btn"
            onPress={openBuilder}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: "rgba(255,106,0,0.1)",
              borderWidth: 1, borderColor: C.fire,
              paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
            }}
          >
            <Ionicons name="construct-outline" size={13} color={C.fire} />
            <Text style={{ color: C.fire, fontSize: 11, fontWeight: "900", letterSpacing: 2 }}>
              BUILD WORKOUT
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.forgeCount} testID="forge-count">
          <Text style={styles.forgeCountText}>{filtered.length} of {WORKOUTS.length} workouts</Text>
          {filtersActive && (
            <TouchableOpacity testID="clear-filters" onPress={clearFilters}>
              <Text style={styles.clearBtnText}>CLEAR ALL</Text>
            </TouchableOpacity>
          )}
        </View>

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No workouts match. Loosen the filter or add equipment to MY KIT.
            </Text>
          </View>
        )}

        {filtered.map((w) => {
          const meta = FOCUS_META[w.focus];
          const reqEq = workoutRequiredEquipment(w);
          const performable = canPerform(w, equipment);
          return (
            <TouchableOpacity
              key={w.id}
              testID={`workout-${w.id}`}
              onPress={() => { haptic(); setShowAlt({}); setOpen(w); }}
              activeOpacity={0.85}
              style={[styles.workoutCard, myKitOnly && !performable && styles.workoutCardLocked,
                { backgroundColor: themeC.card, borderColor: themeC.border }]}
            >
              {/* Workout hero image */}
              <ImageCard
                query={w.name}
                type="workout"
                focus={w.focus}
                height={100}
              />
              <View style={styles.workoutHeaderRow}>
                <View style={[styles.focusBadge, { backgroundColor: `${meta.color}22` }]}>
                  <Text style={[styles.focusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={11} color={C.textDim} />
                  <Text style={styles.timeBadgeText}>{w.time} MIN</Text>
                </View>
                {w.source && (
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceBadgeText}>{w.source}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workoutTitle}>{w.name}</Text>
              <Text style={styles.workoutDesc} numberOfLines={2}>{w.description}</Text>
              {reqEq.length > 0 && (
                <View style={styles.equipmentSummary}>
                  {reqEq.slice(0, 6).map((e) => {
                    const meta2 = EQUIPMENT_META[e];
                    const has = equipment.includes(e);
                    return (
                      <View key={e} style={[styles.equipmentTag, has && { borderWidth: 1, borderColor: C.optimal }]}>
                        <Ionicons name={meta2.icon as any} size={9} color={has ? C.optimal : C.textDim} />
                        <Text style={[styles.equipmentTagText, has && { color: C.optimal }]}>{meta2.label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              <View style={styles.workoutCardFooter}>
                <Text style={styles.workoutExCount}>{w.exercises.length} EXERCISES</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={styles.workoutOpenText}>OPEN</Text>
                  <Ionicons name="arrow-forward" size={14} color={C.text} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={open !== null} animationType="slide" onRequestClose={() => setOpen(null)}>
        {open && (
          <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
            <View style={styles.shell}>
              <View style={styles.pickerHeader}>
                <Text style={styles.brand}>WORKOUT</Text>
                <TouchableOpacity onPress={() => setOpen(null)} testID="close-workout">
                  <Ionicons name="close" size={26} color={C.text} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.detailScroll} testID="workout-detail">
                <View style={styles.detailHeader}>
                  <View style={styles.workoutHeaderRow}>
                    <View style={[styles.focusBadge, { backgroundColor: `${FOCUS_META[open.focus].color}22` }]}>
                      <Text style={[styles.focusBadgeText, { color: FOCUS_META[open.focus].color }]}>{FOCUS_META[open.focus].label}</Text>
                    </View>
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={11} color={C.textDim} />
                      <Text style={styles.timeBadgeText}>{open.time} MIN</Text>
                    </View>
                    {open.source && (
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceBadgeText}>{open.source}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.detailTitle}>{open.name}</Text>
                  <Text style={styles.detailDesc}>{open.description}</Text>
                </View>

                <View style={styles.scienceBox}>
                  <Text style={styles.scienceKicker}>WHY IT WORKS</Text>
                  <Text style={styles.scienceBody}>{open.scienceNote}</Text>
                  {open.citation && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}>
                      <View style={[styles.dot, { backgroundColor: C.science }]} />
                      <Text style={styles.scienceCitation}>{open.citation}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.subKicker}>EXERCISES</Text>
                {open.exercises.map((ex, i) => {
                  const exHas = ex.equipment.every((e) => e === "bodyweight" || equipment.includes(e));
                  const altsOpen = !!showAlt[i];
                  return (
                    <View key={i} style={[styles.exerciseCard, { backgroundColor: themeC.card, borderColor: themeC.border }]} testID={`exercise-${i}`}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseIdx}>{String(i + 1).padStart(2, "0")}</Text>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                      </View>
                      <Text style={styles.exerciseSets}>{ex.setsReps}</Text>
                      {ex.cue && <Text style={styles.exerciseCue}>↳ {ex.cue}</Text>}
                      {/* Muscle map if data available */}
                      {ex.muscles && (
                        <View style={{ marginTop: 12, marginLeft: 38 }}>
                          <Text style={[styles.subKicker, { marginBottom: 6 }]}>MUSCLES WORKED</Text>
                          <MuscleMap
                            primary={ex.muscles.primary as MuscleGroup[]}
                            secondary={ex.muscles.secondary as MuscleGroup[]}
                            size={120}
                          />
                        </View>
                      )}
                      <View style={{ flexDirection: "row", marginLeft: 38, marginTop: 8, flexWrap: "wrap", gap: 4 }}>
                        {ex.equipment.map((e) => {
                          const m2 = EQUIPMENT_META[e];
                          const ok = e === "bodyweight" || equipment.includes(e);
                          return (
                            <View key={e} style={[styles.equipmentTag, ok && { borderWidth: 1, borderColor: C.optimal }]}>
                              <Ionicons name={m2.icon as any} size={9} color={ok ? C.optimal : C.textDim} />
                              <Text style={[styles.equipmentTagText, ok && { color: C.optimal }]}>{m2.label}</Text>
                            </View>
                          );
                        })}
                      </View>
                      <View style={{ flexDirection: "row", gap: 6, marginTop: 8, marginLeft: 38, flexWrap: "wrap" }}>
                        <TouchableOpacity
                          testID={`video-${i}`}
                          onPress={() => { haptic(); openYouTube(ex.videoQuery); }}
                          style={styles.videoBtn}
                        >
                          <Ionicons name="logo-youtube" size={14} color={C.penalty} />
                          <Text style={styles.videoBtnText}>WATCH FORM</Text>
                        </TouchableOpacity>
                        {ex.alternatives && ex.alternatives.length > 0 && (
                          <TouchableOpacity
                            testID={`alt-toggle-${i}`}
                            onPress={() => { haptic(); setShowAlt({ ...showAlt, [i]: !altsOpen }); }}
                            style={styles.videoBtn}
                          >
                            <Ionicons
                              name={altsOpen ? "chevron-up" : "swap-horizontal"}
                              size={14}
                              color={!exHas ? C.warning : C.textDim}
                            />
                            <Text style={[styles.videoBtnText, !exHas && { color: C.warning }]}>
                              {!exHas
                                ? "MISSING KIT · ALTERNATIVES"
                                : `${ex.alternatives.length} ALT${ex.alternatives.length > 1 ? "S" : ""}`}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {altsOpen && ex.alternatives && (
                        <View style={styles.altBox}>
                          <Text style={styles.altKicker}>SWAPS</Text>
                          {ex.alternatives.map((a, ai) => (
                            <View
                              key={ai}
                              style={[
                                styles.altRow,
                                ai === ex.alternatives!.length - 1 && { borderBottomWidth: 0 },
                              ]}
                            >
                              <Text style={styles.altName}>{a.name}</Text>
                              <TouchableOpacity
                                testID={`alt-video-${i}-${ai}`}
                                onPress={() => { haptic(); openYouTube(a.videoQuery); }}
                                style={styles.altVideoBtn}
                              >
                                <Ionicons name="logo-youtube" size={11} color={C.penalty} />
                                <Text style={styles.altVideoText}>WATCH</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* START WORKOUT — primary action */}
                <TouchableOpacity
                  testID="start-workout-btn"
                  onPress={() => { haptic("medium"); setInSession(true); }}
                  style={[styles.logWorkoutBtn, { backgroundColor: C.fire, marginTop: 14 }]}
                >
                  <Ionicons name="play-circle" size={20} color={C.bg} />
                  <Text style={styles.logWorkoutBtnText}>START WORKOUT</Text>
                </TouchableOpacity>

                {/* MARK COMPLETE — quick log without session */}
                <TouchableOpacity
                  testID="log-workout-btn"
                  onPress={() => { onLogWorkout(open); setOpen(null); }}
                  style={[styles.logWorkoutBtn, {
                    backgroundColor: "transparent",
                    borderWidth: 1, borderColor: C.border,
                    marginTop: 8,
                  }]}
                >
                  <Ionicons name="checkmark-circle" size={18} color={C.textDim} />
                  <Text style={[styles.logWorkoutBtnText, { color: C.textDim }]}>
                    MARK COMPLETE · +{XP_RULES.workoutLogged} XP
                  </Text>
                </TouchableOpacity>

                {loggedToday.some((w) => w.id === open.id) && (
                  <Text style={[styles.hint, { textAlign: "center", color: C.optimal, marginTop: 10 }]}>
                    ✓ Already logged today
                  </Text>
                )}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </Modal>

      {/* Active workout session */}
      <Modal
        visible={inSession && open !== null}
        animationType="slide"
        onRequestClose={() => setInSession(false)}
      >
        {open && (
          <WorkoutSessionView
            workout={open}
            onFinish={() => {
              onLogWorkout(open);
              setInSession(false);
              setOpen(null);
            }}
            onBack={() => setInSession(false)}
          />
        )}
      </Modal>

      {/* ── Custom Workout Builder Modal ──────────────────────── */}
      <Modal visible={builderVisible} animationType="slide" onRequestClose={() => setBuilderVisible(false)}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <View style={styles.shell}>
            <View style={styles.pickerHeader}>
              <Text style={styles.brand}>
                {builderStep === 1 ? "BUILD WORKOUT" : builderStep === 2 ? "ADD EXERCISES" : "CONFIGURE"}
              </Text>
              <TouchableOpacity onPress={() => setBuilderVisible(false)} testID="close-builder">
                <Ionicons name="close" size={26} color={C.text} />
              </TouchableOpacity>
            </View>

            {/* progress bar */}
            <View style={{ height: 3, backgroundColor: C.border, marginHorizontal: 16, borderRadius: 2 }}>
              <View style={{ height: 3, backgroundColor: C.fire, borderRadius: 2, width: `${(builderStep / 3) * 100}%` as any }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
              {/* ── Step 1: Name + focus + duration ── */}
              {builderStep === 1 && (
                <View>
                  <Text style={[styles.label, { marginTop: 16 }]}>WORKOUT NAME</Text>
                  <TextInput
                    testID="builder-name-input"
                    value={builderName}
                    onChangeText={setBuilderName}
                    placeholder="e.g. Monday Strength"
                    placeholderTextColor={C.textMute}
                    style={styles.input}
                    autoFocus
                  />

                  <Text style={[styles.subKicker, { marginTop: 16 }]}>FOCUS</Text>
                  <View style={styles.filterRow}>
                    {(["strength", "fatburn", "metcon", "performance", "mobility", "recovery"] as WorkoutFocus[]).map((f) => (
                      <TouchableOpacity
                        key={f}
                        onPress={() => { haptic("light"); setBuilderFocus(f); }}
                        style={[styles.filterChip, builderFocus === f && styles.filterChipActive]}
                      >
                        <Text style={[styles.filterChipText, builderFocus === f && { color: C.bg }]}>
                          {FOCUS_META[f].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.subKicker, { marginTop: 8 }]}>DURATION (MINUTES)</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[15, 30, 45, 60, 90].map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => { haptic("light"); setBuilderDuration(d); }}
                        style={[
                          styles.filterChip,
                          builderDuration === d && styles.filterChipActive,
                        ]}
                      >
                        <Text style={[styles.filterChipText, builderDuration === d && { color: C.bg }]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    testID="builder-next-1"
                    onPress={() => { if (builderName.trim().length > 1) setBuilderStep(2); }}
                    disabled={builderName.trim().length < 2}
                    style={[styles.primaryBtn, { marginTop: 24 }, builderName.trim().length < 2 && styles.primaryBtnDisabled]}
                  >
                    <Text style={styles.primaryBtnText}>NEXT → ADD EXERCISES</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Step 2: Search + add exercises ── */}
              {builderStep === 2 && (
                <View>
                  <View style={[styles.searchWrap, { marginHorizontal: 0, marginTop: 16, marginBottom: 10 }]}>
                    <Ionicons name="search" size={16} color={C.textDim} />
                    <TextInput
                      testID="builder-search-input"
                      value={bQuery}
                      onChangeText={handleBSearch}
                      placeholder="Search exercises…"
                      placeholderTextColor={C.textMute}
                      style={styles.searchInput}
                      autoFocus
                    />
                    {bLoading && <ActivityIndicator size="small" color={C.textDim} />}
                  </View>

                  {bResults.map((s) => {
                    const sid = wgerSuggestionId(s);
                    return (
                      <TouchableOpacity
                        key={sid}
                        testID={`builder-result-${sid}`}
                        onPress={() => addBuilderExercise(s)}
                        style={[styles.foodRow, { justifyContent: "space-between" }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.foodRowName}>{s.data.name}</Text>
                          <Text style={styles.foodRowCat}>{s.data.category}</Text>
                        </View>
                        <Ionicons name="add-circle" size={22} color={C.optimal} />
                      </TouchableOpacity>
                    );
                  })}

                  {builderExercises.length > 0 && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={[styles.subKicker, { marginBottom: 8 }]}>ADDED ({builderExercises.length})</Text>
                      {builderExercises.map((ex, i) => (
                        <View key={i} style={[styles.exerciseCard, { flexDirection: "row", alignItems: "center" }]}>
                          <Text style={[styles.exerciseName, { flex: 1 }]}>{ex.name}</Text>
                          <Text style={{ color: C.science, fontSize: 10, fontWeight: "900", marginRight: 8 }}>MET {ex.met.toFixed(1)}</Text>
                          <TouchableOpacity onPress={() => removeBuilderEx(i)}>
                            <Ionicons name="close-circle" size={20} color={C.penalty} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
                    <TouchableOpacity onPress={() => setBuilderStep(1)} style={[styles.secondaryBtn, { flex: 1 }]}>
                      <Text style={styles.secondaryBtnText}>← BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      testID="builder-next-2"
                      onPress={() => { if (builderExercises.length > 0) setBuilderStep(3); }}
                      disabled={builderExercises.length === 0}
                      style={[styles.primaryBtn, { flex: 2 }, builderExercises.length === 0 && styles.primaryBtnDisabled]}
                    >
                      <Text style={styles.primaryBtnText}>NEXT → CONFIGURE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Step 3: Configure sets/reps + glycogen preview ── */}
              {builderStep === 3 && (
                <View>
                  {/* Glycogen summary */}
                  <View style={[styles.scienceBox, { marginTop: 8, marginBottom: 16 }]}>
                    <Text style={styles.scienceKicker}>ESTIMATED GLYCOGEN COST</Text>
                    <Text style={{ color: C.fire, fontSize: 32, fontWeight: "900", marginTop: 4 }}>
                      {totalGlycogen.toFixed(1)}<Text style={{ fontSize: 14, color: C.textDim }}> g CHO</Text>
                    </Text>
                    <Text style={[styles.scienceBody, { marginTop: 4, fontSize: 11 }]}>
                      Based on {bodyWeight} kg bodyweight, MET values, and set durations.
                    </Text>
                  </View>

                  {builderExercises.map((ex, i) => (
                    <View key={i} style={[styles.exerciseCard, { marginBottom: 12 }]}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={{ color: C.science, fontSize: 10, fontWeight: "900", marginBottom: 10 }}>
                        MET {ex.met.toFixed(1)} · ~{calcGlycogen(ex.met, bodyWeight, ex.useTime ? ex.durationSec / 60 : (ex.sets * ex.reps * 3) / 60).toFixed(2)} g CHO
                      </Text>

                      {/* Sets */}
                      <Text style={[styles.label, { marginBottom: 4 }]}>SETS</Text>
                      <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <TouchableOpacity
                            key={n}
                            onPress={() => updateBuilderEx(i, { sets: n })}
                            style={[styles.filterChip, ex.sets === n && styles.filterChipActive, { paddingHorizontal: 12, paddingVertical: 6 }]}
                          >
                            <Text style={[styles.filterChipText, ex.sets === n && { color: C.bg }]}>{n}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Reps or duration toggle */}
                      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                        <TouchableOpacity
                          onPress={() => updateBuilderEx(i, { useTime: false })}
                          style={[styles.filterChip, !ex.useTime && styles.filterChipActive]}
                        >
                          <Text style={[styles.filterChipText, !ex.useTime && { color: C.bg }]}>REPS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => updateBuilderEx(i, { useTime: true })}
                          style={[styles.filterChip, ex.useTime && styles.filterChipActive]}
                        >
                          <Text style={[styles.filterChipText, ex.useTime && { color: C.bg }]}>DURATION</Text>
                        </TouchableOpacity>
                      </View>

                      {!ex.useTime ? (
                        <View>
                          <Text style={[styles.label, { marginBottom: 4 }]}>REPS</Text>
                          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                            {[5, 8, 10, 12, 15, 20].map((n) => (
                              <TouchableOpacity
                                key={n}
                                onPress={() => updateBuilderEx(i, { reps: n })}
                                style={[styles.filterChip, ex.reps === n && styles.filterChipActive, { paddingHorizontal: 10, paddingVertical: 6 }]}
                              >
                                <Text style={[styles.filterChipText, ex.reps === n && { color: C.bg }]}>{n}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      ) : (
                        <View>
                          <Text style={[styles.label, { marginBottom: 4 }]}>DURATION (SEC)</Text>
                          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                            {[20, 30, 45, 60, 90, 120].map((n) => (
                              <TouchableOpacity
                                key={n}
                                onPress={() => updateBuilderEx(i, { durationSec: n })}
                                style={[styles.filterChip, ex.durationSec === n && styles.filterChipActive, { paddingHorizontal: 10, paddingVertical: 6 }]}
                              >
                                <Text style={[styles.filterChipText, ex.durationSec === n && { color: C.bg }]}>{n}s</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}

                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <TouchableOpacity onPress={() => setBuilderStep(2)} style={[styles.secondaryBtn, { flex: 1 }]}>
                      <Text style={styles.secondaryBtnText}>← BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      testID="builder-save-btn"
                      onPress={saveBuilderWorkout}
                      style={[styles.logWorkoutBtn, { flex: 2, marginTop: 0 }]}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={C.bg} />
                      <Text style={styles.logWorkoutBtnText}>SAVE WORKOUT</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Exercise Lookup — powered by Wger Workout Manager */}
      <Modal visible={lookupVisible} animationType="slide" onRequestClose={closeLookup}>
        <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
          <View style={styles.shell}>
            <View style={styles.pickerHeader}>
              <Text style={styles.brand}>EXERCISE LOOKUP</Text>
              <TouchableOpacity onPress={closeLookup} testID="close-lookup">
                <Ionicons name="close" size={26} color={C.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchWrap, { marginHorizontal: 16, marginTop: 12 }]}>
              <Ionicons name="search" size={16} color={C.textDim} />
              <TextInput
                testID="lookup-search-input"
                value={lookupQuery}
                onChangeText={handleLookupSearch}
                placeholder="e.g. deadlift, squat, press…"
                placeholderTextColor={C.textMute}
                style={styles.searchInput}
                autoFocus
              />
            </View>

            {lookupDetailLoading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator color={C.text} size="large" />
              </View>
            ) : lookupDetail ? (
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} testID="lookup-detail">
                <TouchableOpacity
                  testID="lookup-back"
                  onPress={() => { setLookupDetail(null); setLookupDbEntry(null); setLookupError(""); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}
                >
                  <Ionicons name="arrow-back" size={16} color={C.textDim} />
                  <Text style={{ color: C.textDim, fontSize: 12, fontWeight: "900", letterSpacing: 2 }}>
                    BACK TO RESULTS
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                  {lookupDetail.category.length > 0 && (
                    <Text style={styles.intelTag}>{lookupDetail.category.toUpperCase()}</Text>
                  )}
                  {lookupDbEntry?.difficulty && (() => {
                    const d = lookupDbEntry.difficulty;
                    const color = d === "beginner" ? C.optimal : d === "intermediate" ? C.warning : C.penalty;
                    return (
                      <View style={{ backgroundColor: `${color}22`, borderWidth: 1, borderColor: color, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 }}>
                        <Text style={{ color, fontSize: 10, fontWeight: "900", letterSpacing: 2 }}>
                          {d.toUpperCase()}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                <Text style={[styles.detailTitle, { marginTop: 4, marginBottom: 14 }]}>
                  {lookupDetail.name}
                </Text>

                {lookupDetail.muscles.length > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={[styles.subKicker, { marginBottom: 8 }]}>PRIMARY MUSCLES</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {lookupDetail.muscles.map((m: string) => (
                        <View
                          key={m}
                          style={{
                            backgroundColor: "rgba(34,197,94,0.1)",
                            borderWidth: 1, borderColor: C.optimal,
                            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                          }}
                        >
                          <Text style={{ color: C.optimal, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
                            {m}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {lookupDetail.musclesSecondary.length > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={[styles.subKicker, { marginBottom: 8 }]}>SECONDARY MUSCLES</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {lookupDetail.musclesSecondary.map((m: string) => (
                        <View
                          key={m}
                          style={{
                            backgroundColor: C.card,
                            borderWidth: 1, borderColor: C.border,
                            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                          }}
                        >
                          <Text style={{ color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
                            {m}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {lookupDetail.equipment.length > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={[styles.subKicker, { marginBottom: 8 }]}>EQUIPMENT</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {lookupDetail.equipment.map((e: string) => (
                        <View
                          key={e}
                          style={{
                            backgroundColor: C.card,
                            borderWidth: 1, borderColor: C.border,
                            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                          }}
                        >
                          <Text style={{ color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>
                            {e}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {lookupDbEntry && lookupDbEntry.instructions.length > 0 && (
                  <View style={[styles.scienceBox, { marginBottom: 12 }]}>
                    <Text style={styles.scienceKicker}>HOW TO PERFORM</Text>
                    {lookupDbEntry.instructions.map((step: string, i: number) => (
                      <View key={i} style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
                        <Text style={{ color: C.science, fontWeight: "900", fontSize: 12, width: 18 }}>
                          {i + 1}.
                        </Text>
                        <Text style={[styles.scienceBody, { flex: 1, marginTop: 0 }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {!lookupDbEntry && lookupDetail.description.length > 0 && (
                  <View style={styles.scienceBox}>
                    <Text style={styles.scienceKicker}>DESCRIPTION</Text>
                    <Text style={styles.scienceBody}>{lookupDetail.description}</Text>
                  </View>
                )}

                <TouchableOpacity
                  testID="lookup-watch-form"
                  onPress={() => { haptic(); openYouTube(`${lookupDetail.name} exercise tutorial form`); }}
                  style={[styles.videoBtn, { marginTop: 16, alignSelf: "flex-start" }]}
                >
                  <Ionicons name="logo-youtube" size={14} color={C.penalty} />
                  <Text style={styles.videoBtnText}>WATCH FORM</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} testID="lookup-results">
                {lookupLoading && (
                  <ActivityIndicator color={C.text} style={{ marginTop: 24 }} />
                )}
                {!lookupLoading && lookupError !== "" && (
                  <View style={{ alignItems: "center", marginTop: 24, gap: 12 }}>
                    <Text style={[styles.emptyText, { color: C.warning, marginTop: 0 }]}>
                      {lookupError}
                    </Text>
                    {lookupQuery.trim().length >= 2 && (
                      <TouchableOpacity
                        testID="lookup-retry"
                        onPress={retryLookupSearch}
                        style={{
                          flexDirection: "row", alignItems: "center", gap: 6,
                          borderWidth: 1, borderColor: C.science,
                          backgroundColor: "rgba(14,165,233,0.1)",
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        }}
                      >
                        <Ionicons name="refresh" size={13} color={C.science} />
                        <Text style={{ color: C.science, fontSize: 11, fontWeight: "900", letterSpacing: 2 }}>
                          RETRY
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {!lookupLoading && lookupError === "" && lookupQuery.trim().length >= 2 && lookupResults.length === 0 && (
                  <Text style={styles.emptyText}>No exercises found. Try a different term.</Text>
                )}
                {!lookupLoading && lookupQuery.trim().length < 2 && (
                  <Text style={[styles.emptyText, { marginTop: 24 }]}>
                    Start typing to search thousands of exercises.
                  </Text>
                )}
                {lookupResults.map((s: WgerSuggestion) => {
                  const id = wgerSuggestionId(s);
                  return (
                  <TouchableOpacity
                    key={id}
                    testID={`lookup-result-${id}`}
                    onPress={() => openLookupDetail(s)}
                    style={[styles.foodRow, { justifyContent: "space-between", alignItems: "center" }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodRowName}>{s.data.name}</Text>
                      <Text style={styles.foodRowCat}>{s.data.category}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.textDim} />
                  </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
