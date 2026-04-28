import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
  Animated, Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, type Palette } from "../theme";
import { useStyles, radii, shadow } from "../styles";
import { haptic } from "../utils";
import type {
  Profile, Totals, CoachMessage, WorkoutLogged,
} from "../types";
import type { Equipment } from "../data";
import {
  GEMINI_AVAILABLE, chatWithCoach, evaluateSupplement,
  type CoachContext,
} from "../gemini";

/* ─── Usage limits ─────────────────────────────────────────────────────────── */
// Free: 1 prompt/day base, 3 if logged workout + meals today
// Premium (future): 10/day
type UserTier = "free" | "premium";

function getDailyLimit(
  tier: UserTier,
  loggedMealsToday: boolean,
  loggedWorkoutToday: boolean,
): number {
  if (tier === "premium") return 10;
  if (loggedMealsToday && loggedWorkoutToday) return 3;
  return 1;
}

/* ─── Quick chips ──────────────────────────────────────────────────────────── */
const QUICK_CHIPS = [
  { label: "Am I on track?", prompt: "Analyse my intake so far today. Am I on track for my goal?" },
  { label: "Fill my macros", prompt: "MEAL_SUGGEST" },
  { label: "Plan a workout", prompt: "WORKOUT_GEN" },
  { label: "Rate a supplement", prompt: "KEEP_OR_BIN" },
];

/* ─── Props ────────────────────────────────────────────────────────────────── */
type Props = {
  profile: Profile;
  totals: Totals;
  remaining: Totals;
  equipment: Equipment[];
  recentWorkouts: WorkoutLogged[];
  loggedMealsToday: boolean;
  loggedWorkoutToday: boolean;
  onClose: () => void;
};

export function CoachView({
  profile, totals, remaining, equipment, recentWorkouts,
  loggedMealsToday, loggedWorkoutToday, onClose,
}: Props) {
  const { C, isDark } = useTheme();
  const styles = useStyles();
  const cs = useMemo(() => makeCoachStyles(C, isDark), [C, isDark]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [promptsUsed, setPromptsUsed] = useState(0);
  // Supplement input
  const [supplementInput, setSupplementInput] = useState("");
  const [showSupplementPrompt, setShowSupplementPrompt] = useState(false);
  // Workout gen input
  const [showWorkoutGen, setShowWorkoutGen] = useState(false);
  const [wkFocus, setWkFocus] = useState("fatburn");
  const [wkDuration, setWkDuration] = useState(30);
  const [wkIntensity, setWkIntensity] = useState("high");
  const scrollRef = useRef<ScrollView>(null);

  const userTier: UserTier = "free"; // future: read from profile/subscription
  const dailyLimit = getDailyLimit(userTier, loggedMealsToday, loggedWorkoutToday);
  const promptsRemaining = Math.max(0, dailyLimit - promptsUsed);
  const atLimit = promptsRemaining <= 0;

  // Entry animation
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [opacity]);

  const ctx: CoachContext = { profile, totals, remaining, equipment, recentWorkouts };

  const addMsg = (role: "user" | "model", text: string) => {
    const msg: CoachMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role, text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, msg]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || atLimit) return;
    setError("");
    setInput("");
    addMsg("user", text.trim());
    setLoading(true);
    setPromptsUsed((p) => p + 1);
    try {
      const allMsgs: CoachMessage[] = [
        ...messages,
        { id: "tmp", role: "user", text: text.trim(), timestamp: "" },
      ];
      const response = await chatWithCoach(allMsgs, ctx);
      addMsg("model", response);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setPromptsUsed((p) => Math.max(0, p - 1)); // refund on error
    } finally {
      setLoading(false);
    }
  };

  const handleSupplementEval = async () => {
    const name = supplementInput.trim();
    if (!name || loading || atLimit) return;
    setShowSupplementPrompt(false);
    setSupplementInput("");
    setError("");
    addMsg("user", `Keep or Bin: ${name}`);
    setLoading(true);
    setPromptsUsed((p) => p + 1);
    try {
      const verdict = await evaluateSupplement(name, ctx);
      const icon = verdict.verdict === "keep" ? "🟢" : verdict.verdict === "bin" ? "🔴" : "🟡";
      const evidenceList = verdict.evidence
        .map((e) => `• [${e.strength.toUpperCase()}] ${e.claim}\n  → ${e.source}`)
        .join("\n");
      const response = `${icon} ${verdict.name.toUpperCase()} — ${verdict.verdict.toUpperCase()} (${verdict.score}/10)\n\n${verdict.summary}\n\nBenefits:\n${verdict.benefits.map((b) => `✓ ${b}`).join("\n")}\n\nRisks:\n${verdict.risks.map((r) => `✗ ${r}`).join("\n")}\n\nEvidence:\n${evidenceList}${verdict.dosage ? `\n\nDosage: ${verdict.dosage}` : ""}`;
      addMsg("model", response);
    } catch (err: any) {
      setError(err?.message ?? "Couldn't evaluate supplement.");
      setPromptsUsed((p) => Math.max(0, p - 1));
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutGen = async () => {
    if (loading || atLimit) return;
    setShowWorkoutGen(false);
    const eqList = equipment.length > 0 ? equipment.join(", ") : "bodyweight only";
    const prompt = `Generate a ${wkDuration}-minute ${wkFocus} workout at ${wkIntensity} intensity. Equipment: ${eqList}. Include warmup, exercises with sets/reps/cues, and cooldown.`;
    await sendMessage(prompt);
  };

  const handleMealSuggest = async () => {
    const dietInfo = profile.dietPreferences?.length
      ? `Diet: ${profile.dietPreferences.join(", ")}.`
      : "";
    const allergenInfo = profile.allergens?.length
      ? `Avoid: ${profile.allergens.join(", ")}.`
      : "";
    const prompt = `Suggest 3 meals to fill my remaining macros (${Math.round(remaining.kcal)} kcal, ${Math.round(remaining.p)}P / ${Math.round(remaining.f)}F / ${Math.round(remaining.c)}C). ${dietInfo} ${allergenInfo} Prioritise whole foods.`;
    await sendMessage(prompt);
  };

  const handleChip = (chip: typeof QUICK_CHIPS[0]) => {
    haptic("light");
    if (atLimit) return;
    if (chip.prompt === "KEEP_OR_BIN") { setShowSupplementPrompt(true); return; }
    if (chip.prompt === "WORKOUT_GEN") { setShowWorkoutGen(true); return; }
    if (chip.prompt === "MEAL_SUGGEST") { handleMealSuggest(); return; }
    sendMessage(chip.prompt);
  };

  if (!GEMINI_AVAILABLE) {
    return (
      <View style={cs.root}>
        <View style={cs.header}>
          <Text style={cs.brand}>⚒ ANVIL</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={26} color={C.text} /></TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <Ionicons name="key-outline" size={40} color={C.textMute} />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            Add your Gemini API key to unlock ANVIL.{"\n\n"}
            Set EXPO_PUBLIC_GEMINI_API_KEY in .env.local or EAS secrets.
          </Text>
        </View>
      </View>
    );
  }

  const focusOpts = ["fatburn", "strength", "metcon", "performance", "mobility"];
  const durationOpts = [15, 30, 45, 60];
  const intensityOpts = ["low", "med", "high", "max"];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={cs.root}>
      <Animated.View style={{ flex: 1, opacity }}>
      {/* Header */}
      <View style={cs.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={cs.brand}>⚒ ANVIL</Text>
          <View style={cs.badge}><Text style={cs.badgeText}>AI COACH</Text></View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[cs.limitBadge, atLimit && { borderColor: C.penalty }]}>
            <Text style={[cs.limitText, atLimit && { color: C.penalty }]}>
              {promptsRemaining}/{dailyLimit}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} testID="close-coach">
            <Ionicons name="close" size={26} color={C.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} contentContainerStyle={cs.scroll} keyboardShouldPersistTaps="handled">
        {messages.length === 0 && (
          <View style={cs.welcome}>
            <Text style={cs.welcomeTitle}>⚒ ANVIL</Text>
            <Text style={cs.welcomeSub}>
              Your AI-powered forge coach.{"\n"}Ask anything — training, nutrition, supplements.
            </Text>
            {!loggedMealsToday && !loggedWorkoutToday && (
              <View style={cs.limitHint}>
                <Ionicons name="flash" size={12} color={C.gold} />
                <Text style={cs.limitHintText}>
                  Log meals + a workout today to unlock 3 prompts (currently {dailyLimit})
                </Text>
              </View>
            )}
          </View>
        )}

        {messages.map((m) => (
          <View key={m.id} style={m.role === "user" ? cs.userBubble : cs.modelBubble}>
            {m.role === "model" && (
              <View style={cs.modelLabel}>
                <Text style={cs.modelLabelText}>ANVIL</Text>
                <Text style={cs.timestamp}>{m.timestamp}</Text>
              </View>
            )}
            <Text style={m.role === "user" ? cs.userText : cs.modelText}>{m.text}</Text>
            {m.role === "user" && (
              <Text style={[cs.timestamp, { textAlign: "right", marginTop: 4 }]}>{m.timestamp}</Text>
            )}
          </View>
        ))}

        {loading && (
          <View style={cs.modelBubble}>
            <View style={cs.modelLabel}><Text style={cs.modelLabelText}>ANVIL</Text></View>
            <ActivityIndicator color={C.science} size="small" />
            <Text style={[cs.modelText, { color: C.textMute, marginTop: 6 }]}>Forging response…</Text>
          </View>
        )}

        {error !== "" && (
          <View style={[cs.modelBubble, { borderColor: C.penalty }]}>
            <Text style={[cs.modelText, { color: C.penalty }]}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")} style={{ marginTop: 8 }}>
              <Text style={{ color: C.science, fontSize: 11, fontWeight: "900" }}>DISMISS</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Supplement input overlay */}
      {showSupplementPrompt && (
        <View style={cs.overlayBar}>
          <Text style={cs.overlayLabel}>SUPPLEMENT RATING — ENTER NAME:</Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TextInput
              value={supplementInput} onChangeText={setSupplementInput}
              placeholder="e.g. Creatine, Ashwagandha…" placeholderTextColor={C.textMute}
              style={[cs.input, { flex: 1 }]} autoFocus onSubmitEditing={handleSupplementEval}
            />
            <TouchableOpacity onPress={handleSupplementEval} style={cs.sendBtn} disabled={!supplementInput.trim()}>
              <Ionicons name="flask" size={18} color={C.bg} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSupplementPrompt(false)}>
              <Ionicons name="close-circle" size={24} color={C.textMute} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Workout generator overlay */}
      {showWorkoutGen && (
        <View style={cs.overlayBar}>
          <Text style={cs.overlayLabel}>GENERATE WORKOUT</Text>
          <Text style={[cs.overlayLabel, { color: C.textDim, marginBottom: 6 }]}>FOCUS</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {focusOpts.map((f) => (
              <TouchableOpacity key={f} onPress={() => { haptic("light"); setWkFocus(f); }}
                style={[cs.optionChip, wkFocus === f && cs.optionChipActive]}>
                <Text style={[cs.optionText, wkFocus === f && { color: C.bg }]}>{f.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[cs.overlayLabel, { color: C.textDim, marginBottom: 6 }]}>DURATION</Text>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
            {durationOpts.map((d) => (
              <TouchableOpacity key={d} onPress={() => { haptic("light"); setWkDuration(d); }}
                style={[cs.optionChip, wkDuration === d && cs.optionChipActive]}>
                <Text style={[cs.optionText, wkDuration === d && { color: C.bg }]}>{d} MIN</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[cs.overlayLabel, { color: C.textDim, marginBottom: 6 }]}>INTENSITY</Text>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
            {intensityOpts.map((i) => (
              <TouchableOpacity key={i} onPress={() => { haptic("light"); setWkIntensity(i); }}
                style={[cs.optionChip, wkIntensity === i && cs.optionChipActive]}>
                <Text style={[cs.optionText, wkIntensity === i && { color: C.bg }]}>{i.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={handleWorkoutGen} style={[cs.sendBtn, { flex: 1, borderRadius: 10, flexDirection: "row", gap: 6 }]}>
              <Ionicons name="flash" size={16} color={C.bg} />
              <Text style={{ color: C.bg, fontWeight: "900", fontSize: 12 }}>GENERATE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowWorkoutGen(false)} style={{ justifyContent: "center" }}>
              <Ionicons name="close-circle" size={24} color={C.textMute} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Quick chips (shown when no messages and no overlay) */}
      {messages.length === 0 && !showSupplementPrompt && !showWorkoutGen && (
        <View style={cs.chipRow}>
          {QUICK_CHIPS.map((chip) => (
            <TouchableOpacity key={chip.label} onPress={() => handleChip(chip)}
              style={[cs.chip, atLimit && { opacity: 0.4 }]} disabled={atLimit}>
              <Text style={cs.chipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* At-limit banner */}
      {atLimit && (
        <View style={cs.limitBanner}>
          <Ionicons name="lock-closed" size={14} color={C.gold} />
          <Text style={cs.limitBannerText}>
            Daily limit reached. Log meals + workouts for more prompts.
          </Text>
        </View>
      )}

      {/* Input bar */}
      {!showSupplementPrompt && !showWorkoutGen && !atLimit && (
        <View style={cs.inputBar}>
          <TextInput
            value={input} onChangeText={setInput}
            placeholder="Ask ANVIL anything…" placeholderTextColor={C.textMute}
            style={[cs.input, { flex: 1 }]} multiline maxLength={500}
            onSubmitEditing={() => sendMessage(input)} blurOnSubmit
          />
          <TouchableOpacity
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            style={[cs.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
            testID="coach-send"
          >
            <Ionicons name="arrow-up" size={18} color={C.bg} />
          </TouchableOpacity>
        </View>
      )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

/* ─── Local styles (theme-aware) ─── */
function makeCoachStyles(C: Palette, isDark: boolean) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.borderHi,
      backgroundColor: C.bg,
      ...shadow(isDark, 1),
    },
    brand: { color: C.fire, fontSize: 18, fontWeight: "900", letterSpacing: 3 },
    badge: {
      backgroundColor: `${C.science}22`, borderWidth: 1, borderColor: C.science,
      paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.xs,
    },
    badgeText: { color: C.science, fontSize: 9, fontWeight: "900", letterSpacing: 2 },
    limitBadge: {
      borderWidth: 1, borderColor: C.border, borderRadius: radii.md,
      paddingHorizontal: 8, paddingVertical: 2,
    },
    limitText: { color: C.textDim, fontSize: 11, fontWeight: "900" },
    scroll: { padding: 16, paddingBottom: 20 },
    welcome: { alignItems: "center", paddingVertical: 40 },
    welcomeTitle: { color: C.fire, fontSize: 32, fontWeight: "900", letterSpacing: 4 },
    welcomeSub: { color: C.textDim, fontSize: 13, textAlign: "center", marginTop: 12, lineHeight: 20 },
    limitHint: {
      flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16,
      backgroundColor: `${C.gold}15`, borderWidth: 1, borderColor: `${C.gold}44`,
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.md,
    },
    limitHintText: { color: C.gold, fontSize: 11, fontWeight: "700", flex: 1 },
    userBubble: {
      alignSelf: "flex-end", maxWidth: "80%", backgroundColor: C.science,
      borderRadius: radii.lg, borderBottomRightRadius: 4, padding: 12, marginBottom: 10,
      ...shadow(isDark, 1),
    },
    userText: { color: "#fff", fontSize: 14, lineHeight: 20 },
    modelBubble: {
      alignSelf: "flex-start", maxWidth: "85%", backgroundColor: C.card,
      borderRadius: radii.lg, borderBottomLeftRadius: 4, padding: 14, marginBottom: 10,
      borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
      ...shadow(isDark, 1),
    },
    modelLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    modelLabelText: { color: C.fire, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
    modelText: { color: C.text, fontSize: 14, lineHeight: 22 },
    timestamp: { color: C.textMute, fontSize: 10 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
    chip: {
      backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.pill,
    },
    chipText: { color: C.text, fontSize: 12, fontWeight: "700" },
    inputBar: {
      flexDirection: "row", alignItems: "flex-end", gap: 8,
      paddingHorizontal: 16, paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderHi,
      backgroundColor: C.bg2,
    },
    input: {
      backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: radii.pill,
      paddingHorizontal: 16, paddingVertical: 10, color: C.text, fontSize: 14, maxHeight: 100,
    },
    sendBtn: {
      width: 36, height: 36, borderRadius: 18, backgroundColor: C.science,
      justifyContent: "center", alignItems: "center",
      ...shadow(isDark, 1),
    },
    overlayBar: {
      paddingHorizontal: 16, paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.borderHi,
      backgroundColor: C.bg2,
    },
    overlayLabel: {
      color: C.fire, fontSize: 10, fontWeight: "900", letterSpacing: 2, marginBottom: 8,
    },
    optionChip: {
      backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.lg,
    },
    optionChipActive: { backgroundColor: C.text, borderColor: C.text },
    optionText: { color: C.textDim, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
    limitBanner: {
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 16, paddingVertical: 10,
      backgroundColor: `${C.gold}15`, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: `${C.gold}44`,
    },
    limitBannerText: { color: C.gold, fontSize: 12, fontWeight: "700", flex: 1 },
  });
}
