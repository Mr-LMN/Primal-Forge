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
} from "../data";
import { styles } from "../styles";
import { haptic, openYouTube } from "../utils";
import type { WorkoutLogged } from "../types";
import { WorkoutSessionView } from "./WorkoutSessionView";
import {
  searchWgerExercises,
  getWgerExerciseDetail,
  type WgerSuggestion,
  type WgerExerciseDetail,
} from "../api";

export function ForgeView({
  equipment,
  setEquipment,
  onLogWorkout,
  loggedToday,
}: {
  equipment: Equipment[];
  setEquipment: (e: Equipment[]) => void;
  onLogWorkout: (w: Workout) => void;
  loggedToday: WorkoutLogged[];
}) {
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
  const lookupDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setLookupError("");
  };

  const handleLookupSearch = (text: string) => {
    setLookupQuery(text);
    setLookupDetail(null);
    setLookupError("");
    if (lookupDebounce.current) clearTimeout(lookupDebounce.current);
    if (text.trim().length < 2) {
      setLookupResults([]);
      setLookupLoading(false);
      return;
    }
    setLookupLoading(true);
    lookupDebounce.current = setTimeout(async () => {
      try {
        const results = await searchWgerExercises(text.trim());
        setLookupResults(results);
      } catch {
        setLookupError("Couldn't reach exercise database. Check your connection.");
        setLookupResults([]);
      } finally {
        setLookupLoading(false);
      }
    }, 400);
  };

  const openLookupDetail = async (s: WgerSuggestion) => {
    haptic();
    setLookupDetailLoading(true);
    setLookupError("");
    try {
      const detail = await getWgerExerciseDetail(s.data.base_id);
      setLookupDetail(detail);
    } catch {
      setLookupError("Couldn't load exercise details. Try again.");
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

        <TouchableOpacity
          testID="exercise-lookup-btn"
          onPress={() => { haptic(); setLookupVisible(true); }}
          style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            alignSelf: "flex-start", marginBottom: 14,
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
              style={[styles.workoutCard, myKitOnly && !performable && styles.workoutCardLocked]}
            >
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
                    <View key={i} style={styles.exerciseCard} testID={`exercise-${i}`}>
                      <View style={styles.exerciseHeader}>
                        <Text style={styles.exerciseIdx}>{String(i + 1).padStart(2, "0")}</Text>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                      </View>
                      <Text style={styles.exerciseSets}>{ex.setsReps}</Text>
                      {ex.cue && <Text style={styles.exerciseCue}>↳ {ex.cue}</Text>}
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
                  onPress={() => { setLookupDetail(null); setLookupError(""); }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}
                >
                  <Ionicons name="arrow-back" size={16} color={C.textDim} />
                  <Text style={{ color: C.textDim, fontSize: 12, fontWeight: "900", letterSpacing: 2 }}>
                    BACK TO RESULTS
                  </Text>
                </TouchableOpacity>

                {lookupDetail.category.length > 0 && (
                  <Text style={styles.intelTag}>{lookupDetail.category.toUpperCase()}</Text>
                )}
                <Text style={[styles.detailTitle, { marginTop: 6, marginBottom: 14 }]}>
                  {lookupDetail.name}
                </Text>

                {lookupDetail.muscles.length > 0 && (
                  <View style={{ marginBottom: 14 }}>
                    <Text style={[styles.subKicker, { marginBottom: 8 }]}>PRIMARY MUSCLES</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      {lookupDetail.muscles.map((m) => (
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
                      {lookupDetail.musclesSecondary.map((m) => (
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
                      {lookupDetail.equipment.map((e) => (
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

                {lookupDetail.description.length > 0 && (
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
                  <Text style={[styles.emptyText, { color: C.warning }]}>{lookupError}</Text>
                )}
                {!lookupLoading && lookupError === "" && lookupQuery.trim().length >= 2 && lookupResults.length === 0 && (
                  <Text style={styles.emptyText}>No exercises found. Try a different term.</Text>
                )}
                {!lookupLoading && lookupQuery.trim().length < 2 && (
                  <Text style={[styles.emptyText, { marginTop: 24 }]}>
                    Start typing to search thousands of exercises.
                  </Text>
                )}
                {lookupResults.map((s) => (
                  <TouchableOpacity
                    key={s.data.id}
                    testID={`lookup-result-${s.data.id}`}
                    onPress={() => openLookupDetail(s)}
                    style={[styles.foodRow, { justifyContent: "space-between", alignItems: "center" }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.foodRowName}>{s.data.name}</Text>
                      <Text style={styles.foodRowCat}>{s.data.category}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={C.textDim} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
