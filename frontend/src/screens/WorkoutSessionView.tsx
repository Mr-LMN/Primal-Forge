import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { C, FOCUS_META, XP_RULES, type Workout } from "../data";
import { styles } from "../styles";
import { haptic } from "../utils";

type WorkoutMode = "tabata" | "strength" | "general";
type SetLog = { weight: string; reps: string; done: boolean };

function getMode(w: Workout): WorkoutMode {
  if (
    w.source?.toLowerCase().includes("tabata") ||
    w.exercises.some((e) => e.setsReps.includes("20s ON"))
  )
    return "tabata";
  if (w.focus === "strength") return "strength";
  return "general";
}

function parseSets(setsReps: string): number {
  // "5 × 5 · ..." → 5,  "3 × 8" → 3
  const timesMatch = setsReps.match(/^(\d+)\s*[×x]/);
  if (timesMatch) return Math.min(parseInt(timesMatch[1]), 8);
  // "5@65% · 5@75% · 5+@85%" → count @ segments → 3
  const atCount = (setsReps.match(/@/g) ?? []).length;
  if (atCount > 0) return Math.min(atCount, 6);
  return 3;
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Tabata ──────────────────────────────────────────────────────────────────

const TABATA_ROUNDS = 8;
const WORK_SECS = 20;
const REST_SECS = 10;
const ROUND_SECS = WORK_SECS + REST_SECS; // 30
const TABATA_TOTAL = TABATA_ROUNDS * ROUND_SECS; // 240

function TabataSession({
  workout,
  onFinish,
}: {
  workout: Workout;
  onFinish: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [scores, setScores] = useState<string[]>(Array(TABATA_ROUNDS).fill(""));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const done = elapsed >= TABATA_TOTAL;
  const roundIdx = Math.min(Math.floor(elapsed / ROUND_SECS), TABATA_ROUNDS - 1);
  const posInRound = elapsed % ROUND_SECS;
  const isWork = posInRound < WORK_SECS;
  const secondsLeft = isWork
    ? WORK_SECS - posInRound
    : REST_SECS - (posInRound - WORK_SECS);
  const currentRound = Math.floor(elapsed / ROUND_SECS) + 1;
  const activeScoreRound = !isWork && !done ? roundIdx : -1;

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= TABATA_TOTAL) {
          setRunning(false);
          haptic("medium");
          return TABATA_TOTAL;
        }
        const nextPos = next % ROUND_SECS;
        if (nextPos === 0) haptic("medium");
        else if (nextPos === WORK_SECS) haptic("light");
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const phaseColor = done ? C.optimal : isWork ? C.penalty : C.science;

  if (!started) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
        <Text style={{ color: C.textMute, letterSpacing: 4, fontSize: 11, fontWeight: "900", marginBottom: 16 }}>
          TABATA PROTOCOL
        </Text>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: "900", textAlign: "center", marginBottom: 6 }}>
          {workout.exercises[0]?.name ?? workout.name}
        </Text>
        <Text style={{ color: C.textDim, fontSize: 13, textAlign: "center", marginBottom: 32, lineHeight: 20 }}>
          {TABATA_ROUNDS} rounds · {WORK_SECS}s all-out / {REST_SECS}s rest{"\n"}Total: 4 minutes
        </Text>
        <View style={{
          backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
          borderRadius: 12, padding: 16, marginBottom: 32, width: "100%",
        }}>
          <Text style={{ color: C.textMute, fontSize: 10, letterSpacing: 3, fontWeight: "900", marginBottom: 8 }}>
            SCORING
          </Text>
          <Text style={{ color: C.textDim, fontSize: 13, lineHeight: 19 }}>
            Count your reps each 20s work interval. Enter them during the 10s rest.
            Total score = sum of all {TABATA_ROUNDS} rounds.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { haptic("medium"); setStarted(true); setRunning(true); }}
          style={{
            backgroundColor: C.penalty, paddingVertical: 20, paddingHorizontal: 52,
            borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 10,
          }}
        >
          <Ionicons name="play" size={22} color={C.bg} />
          <Text style={{ color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 16 }}>
            START
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 24, alignItems: "center", paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Circular clock */}
      <View style={{
        width: 230, height: 230, borderRadius: 115,
        borderWidth: 6, borderColor: phaseColor,
        backgroundColor: `${phaseColor}11`,
        alignItems: "center", justifyContent: "center",
        marginBottom: 18, marginTop: 4,
      }}>
        {done ? (
          <>
            <Ionicons name="checkmark-circle" size={72} color={C.optimal} />
            <Text style={{ color: C.optimal, fontWeight: "900", fontSize: 18, marginTop: 6, letterSpacing: 2 }}>
              DONE
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: phaseColor, fontSize: 80, fontWeight: "900", lineHeight: 88 }}>
              {secondsLeft}
            </Text>
            <Text style={{ color: phaseColor, letterSpacing: 5, fontSize: 12, fontWeight: "900" }}>
              {isWork ? "WORK" : "REST"}
            </Text>
          </>
        )}
      </View>

      {/* Round counter & dots */}
      {!done && (
        <Text style={{ color: C.text, fontSize: 18, fontWeight: "900", marginBottom: 10 }}>
          ROUND {Math.min(currentRound, TABATA_ROUNDS)} / {TABATA_ROUNDS}
        </Text>
      )}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {Array.from({ length: TABATA_ROUNDS }).map((_, i) => {
          const complete = elapsed >= (i + 1) * ROUND_SECS;
          const active = !done && currentRound === i + 1;
          return (
            <View
              key={i}
              style={{
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: complete ? C.optimal : active ? phaseColor : C.border,
              }}
            />
          );
        })}
      </View>

      {/* Play / Pause */}
      {!done && (
        <TouchableOpacity
          onPress={() => { haptic(); setRunning((r) => !r); }}
          style={{
            backgroundColor: running ? C.card : phaseColor,
            borderWidth: 1, borderColor: running ? C.border : phaseColor,
            paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10,
            flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 28,
          }}
        >
          <Ionicons
            name={running ? "pause" : "play"}
            size={18}
            color={running ? C.text : C.bg}
          />
          <Text style={{
            color: running ? C.text : C.bg,
            fontWeight: "900", letterSpacing: 2, fontSize: 13,
          }}>
            {running ? "PAUSE" : "RESUME"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Round score boxes */}
      <View style={{ width: "100%", marginBottom: 24 }}>
        <Text style={{ color: C.textMute, letterSpacing: 3, fontSize: 10, fontWeight: "900", marginBottom: 12 }}>
          REPS PER ROUND
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: TABATA_ROUNDS }).map((_, i) => {
            const isActive = activeScoreRound === i;
            const isComplete = elapsed >= (i + 1) * ROUND_SECS;
            return (
              <View
                key={i}
                style={{
                  width: "22%", backgroundColor: C.card,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? C.science : scores[i] ? C.optimal : C.border,
                  borderRadius: 10, padding: 10, alignItems: "center",
                }}
              >
                <Text style={{
                  color: isActive ? C.science : C.textMute,
                  fontSize: 9, fontWeight: "900", letterSpacing: 1,
                }}>
                  R{i + 1}
                </Text>
                <TextInput
                  value={scores[i]}
                  onChangeText={(t) => {
                    const s = [...scores];
                    s[i] = t.replace(/[^0-9]/g, "");
                    setScores(s);
                  }}
                  keyboardType="number-pad"
                  placeholder="—"
                  placeholderTextColor={C.textMute}
                  style={{
                    color: isComplete ? C.optimal : C.text,
                    fontSize: 22, fontWeight: "900",
                    textAlign: "center", width: "100%", marginTop: 4,
                    paddingVertical: 0,
                  }}
                />
              </View>
            );
          })}
        </View>
        {scores.some((s) => s !== "") && (
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            marginTop: 10, backgroundColor: C.cardHi,
            borderWidth: 1, borderColor: C.borderHi,
            borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
          }}>
            <Text style={{ color: C.textDim, fontSize: 12, fontWeight: "900", letterSpacing: 1 }}>
              TOTAL REPS
            </Text>
            <Text style={{ color: C.optimal, fontSize: 16, fontWeight: "900" }}>
              {scores.reduce((sum, s) => sum + (parseInt(s) || 0), 0)}
            </Text>
          </View>
        )}
      </View>

      {/* Finish button — only when done */}
      {done && (
        <TouchableOpacity
          onPress={() => { haptic("medium"); onFinish(); }}
          style={{
            backgroundColor: C.optimal, paddingVertical: 20,
            borderRadius: 14, width: "100%",
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color={C.bg} />
          <Text style={{ color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 14 }}>
            LOG WORKOUT · +{XP_RULES.workoutLogged} XP
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Strength ─────────────────────────────────────────────────────────────────

function StrengthSession({
  workout,
  onFinish,
}: {
  workout: Workout;
  onFinish: () => void;
}) {
  const buildInitial = (): Record<number, SetLog[]> => {
    const out: Record<number, SetLog[]> = {};
    workout.exercises.forEach((ex, i) => {
      const count = parseSets(ex.setsReps);
      out[i] = Array.from({ length: count }, () => ({ weight: "", reps: "", done: false }));
    });
    return out;
  };

  const [sets, setSets] = useState<Record<number, SetLog[]>>(buildInitial);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!timerRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning]);

  const allSets = Object.values(sets).flat();
  const doneSets = allSets.filter((s) => s.done).length;

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: keyof SetLog,
    value: string | boolean,
  ) => {
    setSets((prev) => {
      const next = { ...prev, [exIdx]: [...prev[exIdx]] };
      next[exIdx][setIdx] = { ...prev[exIdx][setIdx], [field]: value };
      return next;
    });
  };

  const addSet = (exIdx: number) => {
    setSets((prev) => {
      const last = prev[exIdx].at(-1) ?? { weight: "", reps: "", done: false };
      return { ...prev, [exIdx]: [...prev[exIdx], { weight: last.weight, reps: "", done: false }] };
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setSets((prev) => {
      if (prev[exIdx].length <= 1) return prev;
      return { ...prev, [exIdx]: prev[exIdx].filter((_, i) => i !== setIdx) };
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Timer bar */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
        borderRadius: 10, padding: 14, marginBottom: 18,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="time-outline" size={16} color={C.textDim} />
          <Text style={{ color: C.text, fontWeight: "900", fontSize: 22 }}>{fmt(elapsed)}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ color: C.optimal, fontWeight: "900", fontSize: 11, letterSpacing: 1 }}>
            {doneSets} / {allSets.length} SETS
          </Text>
          <TouchableOpacity onPress={() => { haptic(); setTimerRunning((r) => !r); }}>
            <Ionicons
              name={timerRunning ? "pause-circle" : "play-circle"}
              size={30}
              color={C.textDim}
            />
          </TouchableOpacity>
        </View>
      </View>

      {workout.exercises.map((ex, exIdx) => (
        <View
          key={exIdx}
          style={{
            backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
            borderRadius: 12, padding: 16, marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Text style={{ color: C.gold, fontWeight: "900", fontSize: 13, letterSpacing: 2 }}>
              {String(exIdx + 1).padStart(2, "0")}
            </Text>
            <Text style={{ color: C.text, fontWeight: "900", fontSize: 15, flex: 1 }}>
              {ex.name}
            </Text>
          </View>
          <Text style={{ color: C.science, fontSize: 12, fontWeight: "700", marginBottom: 14 }}>
            {ex.setsReps}
          </Text>

          {/* Column headers */}
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, paddingHorizontal: 2 }}>
            <Text style={{ width: 26, color: C.textMute, fontSize: 9, fontWeight: "900", letterSpacing: 1 }}></Text>
            <Text style={{ flex: 1, color: C.textMute, fontSize: 9, fontWeight: "900", letterSpacing: 1, textAlign: "center" }}>
              KG
            </Text>
            <Text style={{ flex: 1, color: C.textMute, fontSize: 9, fontWeight: "900", letterSpacing: 1, textAlign: "center" }}>
              REPS
            </Text>
            <View style={{ width: 34 }} />
            <View style={{ width: 22 }} />
          </View>

          {sets[exIdx]?.map((s, setIdx) => (
            <View key={setIdx} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Text style={{ width: 26, color: C.textMute, fontSize: 11, fontWeight: "900" }}>
                {setIdx + 1}
              </Text>
              <TextInput
                value={s.weight}
                onChangeText={(t) => updateSet(exIdx, setIdx, "weight", t.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={C.textMute}
                style={{
                  flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700",
                  color: C.text,
                  backgroundColor: s.done ? `${C.optimal}18` : C.bg2,
                  borderWidth: 1, borderColor: s.done ? C.optimal : C.border,
                  borderRadius: 8, paddingHorizontal: 8, paddingVertical: 10,
                }}
              />
              <TextInput
                value={s.reps}
                onChangeText={(t) => updateSet(exIdx, setIdx, "reps", t.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={C.textMute}
                style={{
                  flex: 1, textAlign: "center", fontSize: 17, fontWeight: "700",
                  color: C.text,
                  backgroundColor: s.done ? `${C.optimal}18` : C.bg2,
                  borderWidth: 1, borderColor: s.done ? C.optimal : C.border,
                  borderRadius: 8, paddingHorizontal: 8, paddingVertical: 10,
                }}
              />
              <TouchableOpacity
                onPress={() => { haptic("light"); updateSet(exIdx, setIdx, "done", !s.done); }}
                style={{ width: 34, alignItems: "center" }}
              >
                <Ionicons
                  name={s.done ? "checkmark-circle" : "ellipse-outline"}
                  size={28}
                  color={s.done ? C.optimal : C.border}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { haptic("light"); removeSet(exIdx, setIdx); }}
                style={{ width: 22, alignItems: "center" }}
              >
                <Ionicons name="remove-circle-outline" size={18} color={C.textMute} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => { haptic("light"); addSet(exIdx); }}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
              borderWidth: 1, borderColor: C.border, borderStyle: "dashed",
              borderRadius: 8, paddingVertical: 10, marginTop: 4,
            }}
          >
            <Ionicons name="add" size={16} color={C.textDim} />
            <Text style={{ color: C.textDim, fontSize: 11, fontWeight: "900", letterSpacing: 2 }}>
              ADD SET
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => { haptic("medium"); setTimerRunning(false); onFinish(); }}
        style={{
          backgroundColor: C.gold, paddingVertical: 20, borderRadius: 14,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
          marginTop: 4,
        }}
      >
        <Ionicons name="checkmark-circle" size={20} color={C.bg} />
        <Text style={{ color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 14 }}>
          FINISH WORKOUT · +{XP_RULES.workoutLogged} XP
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── General (timer + checklist) ─────────────────────────────────────────────

function GeneralSession({
  workout,
  onFinish,
}: {
  workout: Workout;
  onFinish: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const doneCount = Object.values(done).filter(Boolean).length;
  const allDone = doneCount === workout.exercises.length;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      {/* Stopwatch */}
      <View style={{
        alignItems: "center",
        backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
        borderRadius: 14, padding: 24, marginBottom: 20,
      }}>
        <Text style={{ color: C.textMute, letterSpacing: 4, fontSize: 10, fontWeight: "900" }}>
          ELAPSED
        </Text>
        <Text style={{ color: C.text, fontSize: 60, fontWeight: "900", marginVertical: 8 }}>
          {fmt(elapsed)}
        </Text>
        <TouchableOpacity
          onPress={() => { haptic(); setRunning((r) => !r); }}
          style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: running ? C.bg2 : C.science,
            borderWidth: 1, borderColor: running ? C.border : C.science,
            paddingVertical: 10, paddingHorizontal: 26, borderRadius: 10,
          }}
        >
          <Ionicons name={running ? "pause" : "play"} size={16} color={running ? C.text : C.bg} />
          <Text style={{ color: running ? C.text : C.bg, fontWeight: "900", fontSize: 12, letterSpacing: 2 }}>
            {running ? "PAUSE" : "RESUME"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise checklist */}
      <Text style={{ color: C.textMute, letterSpacing: 3, fontSize: 10, fontWeight: "900", marginBottom: 10 }}>
        EXERCISES · {doneCount} / {workout.exercises.length} DONE
      </Text>
      {workout.exercises.map((ex, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => { haptic("light"); setDone((d) => ({ ...d, [i]: !d[i] })); }}
          style={{
            flexDirection: "row", alignItems: "center", gap: 12,
            backgroundColor: done[i] ? `${C.optimal}11` : C.card,
            borderWidth: 1, borderColor: done[i] ? C.optimal : C.border,
            borderRadius: 12, padding: 16, marginBottom: 10,
          }}
        >
          <Ionicons
            name={done[i] ? "checkmark-circle" : "ellipse-outline"}
            size={28}
            color={done[i] ? C.optimal : C.border}
          />
          <View style={{ flex: 1 }}>
            <Text style={{
              color: done[i] ? C.optimal : C.text,
              fontWeight: "900", fontSize: 15,
              textDecorationLine: done[i] ? "line-through" : "none",
            }}>
              {ex.name}
            </Text>
            <Text style={{ color: C.science, fontSize: 12, fontWeight: "700", marginTop: 2 }}>
              {ex.setsReps}
            </Text>
            {ex.cue && (
              <Text style={{ color: C.textMute, fontSize: 11, marginTop: 2, fontStyle: "italic" }}>
                ↳ {ex.cue}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => { haptic("medium"); setRunning(false); onFinish(); }}
        style={{
          backgroundColor: allDone ? C.optimal : C.card,
          borderWidth: 1, borderColor: allDone ? C.optimal : C.border,
          paddingVertical: 20, borderRadius: 14, marginTop: 4,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={allDone ? C.bg : C.textDim}
        />
        <Text style={{
          color: allDone ? C.bg : C.textDim,
          fontWeight: "900", letterSpacing: 3, fontSize: 14,
        }}>
          FINISH WORKOUT · +{XP_RULES.workoutLogged} XP
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkoutSessionView({
  workout,
  onFinish,
  onBack,
}: {
  workout: Workout;
  onFinish: () => void;
  onBack: () => void;
}) {
  const mode = getMode(workout);
  const meta = FOCUS_META[workout.focus];

  return (
    <SafeAreaView style={[styles.root, { flex: 1 }]} edges={["top", "bottom"]}>
      <View style={styles.shell}>
        {/* Header */}
        <View style={[styles.pickerHeader, { paddingHorizontal: 16 }]}>
          <TouchableOpacity
            onPress={() => { haptic(); onBack(); }}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, minWidth: 60 }}
          >
            <Ionicons name="chevron-back" size={20} color={C.text} />
            <Text style={{ color: C.text, fontWeight: "700", fontSize: 14 }}>BACK</Text>
          </TouchableOpacity>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text style={{ color: meta.color, fontSize: 9, letterSpacing: 3, fontWeight: "900" }}>
              {meta.label}
            </Text>
            <Text
              style={{ color: C.text, fontWeight: "900", fontSize: 14, letterSpacing: 0.5 }}
              numberOfLines={1}
            >
              {workout.name}
            </Text>
          </View>
          <View style={{ minWidth: 60, alignItems: "flex-end" }}>
            {mode === "tabata" && (
              <View style={{
                backgroundColor: `${C.penalty}22`, borderWidth: 1, borderColor: C.penalty,
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ color: C.penalty, fontSize: 9, fontWeight: "900", letterSpacing: 2 }}>
                  TABATA
                </Text>
              </View>
            )}
            {mode === "strength" && (
              <View style={{
                backgroundColor: `${C.gold}22`, borderWidth: 1, borderColor: C.gold,
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ color: C.gold, fontSize: 9, fontWeight: "900", letterSpacing: 2 }}>
                  STRENGTH
                </Text>
              </View>
            )}
          </View>
        </View>

        {mode === "tabata" && (
          <TabataSession workout={workout} onFinish={onFinish} />
        )}
        {mode === "strength" && (
          <StrengthSession workout={workout} onFinish={onFinish} />
        )}
        {mode === "general" && (
          <GeneralSession workout={workout} onFinish={onFinish} />
        )}
      </View>
    </SafeAreaView>
  );
}
