import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  C,
  ACTIVITY_TIERS,
  GOALS,
  VISUAL_BF,
  DIET_OPTIONS,
  ALLERGEN_OPTIONS,
  navyBF,
  round,
  type Sex,
  type Goal,
  type BfMode,
  type ActivityTier,
} from "../data";
import { styles } from "../styles";
import { haptic, buildProfile } from "../utils";
import type { Profile } from "../types";

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.previewStat}>
      <Text style={styles.previewStatLabel}>{label}</Text>
      <Text style={styles.previewStatValue}>{value}</Text>
    </View>
  );
}

function PreviewMacro({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.previewMacro, { borderColor: color }]}>
      <Text style={[styles.previewMacroLabel, { color }]}>{label}</Text>
      <Text style={styles.previewMacroValue}>{value}</Text>
    </View>
  );
}

export function Onboarding({ onComplete }: { onComplete: (p: Profile) => void }) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [sex, setSex] = useState<Sex | null>(null);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bfMode, setBfMode] = useState<BfMode>("manual");
  const [bfManual, setBfManual] = useState("");
  const [neck, setNeck] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [visualBf, setVisualBf] = useState<number | null>(null);
  const [tier, setTier] = useState<ActivityTier | null>(null);
  const [dietPrefs, setDietPrefs] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);

  const computedBF = useMemo(() => {
    if (bfMode === "manual") return parseFloat(bfManual);
    if (bfMode === "visual") return visualBf ?? NaN;
    if (bfMode === "tape" && sex && height && neck && waist && (sex === "m" || hip)) {
      const h = parseFloat(height),
        n = parseFloat(neck),
        wa = parseFloat(waist),
        hp = parseFloat(hip || "0");
      if (h > 0 && n > 0 && wa > n) return navyBF(sex, h, n, wa, hp);
    }
    return NaN;
  }, [bfMode, bfManual, visualBf, sex, height, neck, waist, hip]);

  const step1Valid = goal !== null && goal !== "athlete";
  const step2Valid = sex !== null && parseFloat(weight) > 0 && parseFloat(height) > 0;
  const step3Valid = !isNaN(computedBF) && computedBF >= 3 && computedBF < 60;
  const step4Valid = tier !== null;
  const step5Valid = dietPrefs.length > 0;
  const allValid = step1Valid && step2Valid && step3Valid && step4Valid && step5Valid;

  const toggleDiet = (id: string) => {
    haptic("light");
    if (id === "no-preference") { setDietPrefs(["no-preference"]); return; }
    setDietPrefs((prev) => {
      const without = prev.filter((p) => p !== "no-preference");
      return without.includes(id) ? without.filter((p) => p !== id) : [...without, id];
    });
  };
  const toggleAllergen = (id: string) => {
    haptic("light");
    if (id === "none") { setAllergens(["none"]); return; }
    setAllergens((prev) => {
      const without = prev.filter((a) => a !== "none");
      return without.includes(id) ? without.filter((a) => a !== id) : [...without, id];
    });
  };

  const preview = useMemo(() => {
    if (!allValid || !goal || !sex || !tier) return null;
    const p = buildProfile({
      sex,
      weight: parseFloat(weight),
      height: parseFloat(height),
      bodyFat: computedBF,
      bfMode,
      goal,
      tier,
    });
    p.dietPreferences = dietPrefs;
    p.allergens = allergens.filter((a) => a !== "none");
    return p;
  }, [allValid, goal, sex, weight, height, computedBF, bfMode, tier, dietPrefs, allergens]);

  const submit = () => {
    if (preview) {
      haptic("success");
      onComplete(preview);
    }
  };
  const next = () => {
    haptic();
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2 && step2Valid) setStep(3);
    else if (step === 3 && step3Valid) setStep(4);
    else if (step === 4 && step4Valid) setStep(5);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.shell}
      >
        <ScrollView contentContainerStyle={styles.onboardScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.onboardHero}>
            <Text style={styles.onboardKicker}>STEP {step} / 5</Text>
            <Text style={styles.brand}>PRIMALFORGE</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
            </View>
          </View>

          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>WHAT'S THE MISSION?</Text>
              <Text style={styles.stepSub}>Pick a primary objective. We'll calibrate the math to match.</Text>
              {GOALS.map((g) => {
                const active = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    testID={`goal-${g.id}`}
                    onPress={() => {
                      if (!g.locked) {
                        haptic();
                        setGoal(g.id);
                      }
                    }}
                    disabled={g.locked}
                    style={[
                      styles.goalCard,
                      active && styles.goalCardActive,
                      g.locked && styles.goalCardLocked,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.goalLabel, active && { color: C.text }]}>{g.label}</Text>
                        {g.locked && (
                          <View style={styles.lockTag}>
                            <Ionicons name="lock-closed" size={10} color={C.science} />
                            <Text style={styles.lockText}>LOCKED</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.goalSub}>{g.sub}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={C.optimal} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>VITALS</Text>
              <Text style={styles.stepSub}>Sex, weight, and height drive every calculation.</Text>
              <Text style={styles.label}>SEX</Text>
              <View style={styles.segRow}>
                {(["m", "f"] as Sex[]).map((s) => {
                  const active = sex === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      testID={`sex-${s}`}
                      onPress={() => {
                        haptic();
                        setSex(s);
                      }}
                      style={[styles.segBtn, active && styles.segBtnActive]}
                    >
                      <Text style={[styles.segText, active && { color: C.bg }]}>
                        {s === "m" ? "MALE" : "FEMALE"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hint}>Required for the Navy Tape Method &amp; protein scaling.</Text>
              <View style={styles.onboardField}>
                <Text style={styles.label}>BODY WEIGHT · KG</Text>
                <TextInput
                  testID="onboard-weight-input"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="84"
                  placeholderTextColor={C.textMute}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.onboardField}>
                <Text style={styles.label}>HEIGHT · CM</Text>
                <TextInput
                  testID="onboard-height-input"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="178"
                  placeholderTextColor={C.textMute}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>BODY COMPOSITION</Text>
              <Text style={styles.stepSub}>Three ways to find Active Metabolic Weight. Pick what suits you.</Text>
              <View style={styles.modeRow}>
                {(
                  [
                    { id: "manual", label: "I KNOW IT" },
                    { id: "tape", label: "TAPE METHOD" },
                    { id: "visual", label: "VISUAL" },
                  ] as { id: BfMode; label: string }[]
                ).map((m) => {
                  const active = bfMode === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      testID={`bfmode-${m.id}`}
                      onPress={() => {
                        haptic();
                        setBfMode(m.id);
                      }}
                      style={[styles.modeBtn, active && styles.modeBtnActive]}
                    >
                      <Text style={[styles.modeText, active && { color: C.bg }]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {bfMode === "manual" && (
                <View style={styles.onboardField}>
                  <Text style={styles.label}>BODY FAT · %</Text>
                  <TextInput
                    testID="onboard-bf-input"
                    value={bfManual}
                    onChangeText={setBfManual}
                    placeholder="15"
                    placeholderTextColor={C.textMute}
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                  <Text style={styles.hint}>DEXA &gt; calipers &gt; mirror.</Text>
                </View>
              )}
              {bfMode === "tape" && (
                <View>
                  <Text style={styles.hint}>US Navy circumference method. Soft tape, no compression. ±3% of DEXA.</Text>
                  {!sex && (
                    <View style={styles.warnBox}>
                      <Ionicons name="warning" size={16} color={C.warning} />
                      <Text style={styles.warnText}>Set sex in Step 2 first.</Text>
                    </View>
                  )}
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>NECK · CM (below larynx)</Text>
                    <TextInput
                      testID="tape-neck-input"
                      value={neck}
                      onChangeText={setNeck}
                      placeholder="38"
                      placeholderTextColor={C.textMute}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.onboardField}>
                    <Text style={styles.label}>WAIST · CM (at navel)</Text>
                    <TextInput
                      testID="tape-waist-input"
                      value={waist}
                      onChangeText={setWaist}
                      placeholder="84"
                      placeholderTextColor={C.textMute}
                      keyboardType="decimal-pad"
                      style={styles.input}
                    />
                  </View>
                  {sex === "f" && (
                    <View style={styles.onboardField}>
                      <Text style={styles.label}>HIP · CM (widest point)</Text>
                      <TextInput
                        testID="tape-hip-input"
                        value={hip}
                        onChangeText={setHip}
                        placeholder="98"
                        placeholderTextColor={C.textMute}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </View>
                  )}
                  {!isNaN(computedBF) && computedBF >= 3 && (
                    <View style={styles.computedBox}>
                      <Text style={styles.computedLabel}>ESTIMATED BF%</Text>
                      <Text style={styles.computedValue}>{round(computedBF, 1)}%</Text>
                    </View>
                  )}
                </View>
              )}
              {bfMode === "visual" && (
                <View>
                  {!sex && (
                    <View style={styles.warnBox}>
                      <Ionicons name="warning" size={16} color={C.warning} />
                      <Text style={styles.warnText}>Set sex in Step 2 first.</Text>
                    </View>
                  )}
                  {sex &&
                    VISUAL_BF[sex].map((v) => {
                      const active = visualBf === v.bf;
                      return (
                        <TouchableOpacity
                          key={v.id}
                          testID={`visual-${v.id}`}
                          onPress={() => {
                            haptic();
                            setVisualBf(v.bf);
                          }}
                          style={[styles.visualCard, active && styles.visualCardActive]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.visualLabel, active && { color: C.text }]}>{v.label}</Text>
                            <Text style={styles.visualSub}>{v.sub}</Text>
                          </View>
                          <Text style={styles.visualBf}>{v.bf}%</Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>TRAINING LOAD</Text>
              <Text style={styles.stepSub}>Your true daily output. Be honest.</Text>
              {ACTIVITY_TIERS.map((t) => {
                const active = tier?.id === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    testID={`onboard-tier-${t.id}`}
                    onPress={() => {
                      haptic();
                      setTier(t);
                    }}
                    style={[styles.tierBtn, active && styles.tierBtnActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tierLabel, active && { color: C.text }]}>{t.label}</Text>
                      <Text style={styles.tierSub}>{t.sub}</Text>
                    </View>
                    <View style={styles.tierMeta}>
                      <Text style={styles.tierMetaTop}>×{t.multiplier}</Text>
                      <Text style={styles.tierMetaBot}>{t.carbTarget}g C</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {preview && (
                <View style={styles.previewCard} testID="onboard-preview">
                  <Text style={styles.previewKicker}>YOUR FORGE</Text>
                  <View style={styles.previewRow}>
                    <PreviewStat label="LBM" value={`${preview.lbm} kg`} />
                    <PreviewStat label="BMR" value={`${preview.bmr}`} />
                    <PreviewStat label="TDEE" value={`${preview.tdee}`} />
                  </View>
                  <View style={styles.previewBig}>
                    <Text style={styles.previewBigLabel}>DAILY KCAL TARGET</Text>
                    <Text style={styles.previewBigValue}>{preview.calories}</Text>
                  </View>
                  <View style={styles.previewMacros}>
                    <PreviewMacro label="P" value={`${preview.protein}g`} color={C.science} />
                    <PreviewMacro label="F" value={`${preview.fat}g`} color={C.warning} />
                    <PreviewMacro label="C" value={`${preview.carbs}g`} color={C.optimal} />
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 5 && (
            <View>
              <Text style={styles.stepTitle}>DIETARY PROFILE</Text>
              <Text style={styles.stepSub}>Help ANVIL and recipes fit your lifestyle.</Text>
              <Text style={styles.label}>DIET PREFERENCE</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {DIET_OPTIONS.map((d) => {
                  const active = dietPrefs.includes(d.id);
                  return (
                    <TouchableOpacity
                      key={d.id}
                      testID={`diet-${d.id}`}
                      onPress={() => toggleDiet(d.id)}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, active && { color: C.bg }]}>{d.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.label}>ALLERGENS (AVOID)</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {ALLERGEN_OPTIONS.map((a) => {
                  const active = allergens.includes(a.id);
                  return (
                    <TouchableOpacity
                      key={a.id}
                      testID={`allergen-${a.id}`}
                      onPress={() => toggleAllergen(a.id)}
                      style={[styles.filterChip, active && { backgroundColor: C.penalty, borderColor: C.penalty }]}
                    >
                      <Text style={[styles.filterChipText, active && { color: "#fff" }]}>{a.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.navRow}>
            {step > 1 && (
              <TouchableOpacity
                testID="onboard-back-btn"
                onPress={() => {
                  haptic();
                  setStep(step - 1);
                }}
                style={styles.secondaryBtn}
              >
                <Ionicons name="arrow-back" size={16} color={C.text} />
                <Text style={styles.secondaryBtnText}>BACK</Text>
              </TouchableOpacity>
            )}
            {step < 5 ? (
              <TouchableOpacity
                testID="onboard-next-btn"
                disabled={
                  (step === 1 && !step1Valid) ||
                  (step === 2 && !step2Valid) ||
                  (step === 3 && !step3Valid) ||
                  (step === 4 && !step4Valid)
                }
                onPress={next}
                style={[
                  styles.primaryBtn,
                  { flex: 1 },
                  ((step === 1 && !step1Valid) ||
                    (step === 2 && !step2Valid) ||
                    (step === 3 && !step3Valid) ||
                    (step === 4 && !step4Valid)) &&
                    styles.primaryBtnDisabled,
                ]}
              >
                <Text style={styles.primaryBtnText}>NEXT →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                testID="onboard-submit-btn"
                disabled={!allValid}
                onPress={submit}
                style={[styles.primaryBtn, { flex: 1 }, !allValid && styles.primaryBtnDisabled]}
              >
                <Text style={styles.primaryBtnText}>FORGE PROFILE →</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.onboardFooter}>
            LBM = W × (1 − BF/100) · BMR = 370 + 21.6 × LBM · TDEE = BMR × Activity
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
