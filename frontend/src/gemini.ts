// ─── Gemini AI Coach — API Service Layer ─────────────────────────────────────
// Uses gemini-2.5-flash via REST API for cost efficiency.
// All prompts are pre-built with user context for accurate coaching.

import type {
  Profile,
  Totals,
  CoachMessage,
  GeneratedWorkout,
  MealSuggestion,
  SupplementVerdict,
  DietPreference,
  WorkoutLogged,
} from "./types";
import type { Equipment } from "./data";

const _GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
export const GEMINI_AVAILABLE = !!_GEMINI_KEY;

const MODEL = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=`;
const TIMEOUT_MS = 20000;

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoachContext = {
  profile: Profile;
  totals: Totals;
  remaining: Totals;
  equipment: Equipment[];
  recentWorkouts: WorkoutLogged[];
};

type GeminiContent = {
  role: "user" | "model";
  parts: { text: string }[];
};

type GeminiRequest = {
  contents: GeminiContent[];
  systemInstruction?: { parts: { text: string }[] };
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
};

// ─── System Prompt Builder ───────────────────────────────────────────────────

function buildSystemPrompt(ctx: CoachContext): string {
  const { profile: p, totals: t, remaining: r, equipment: eq, recentWorkouts: rw } = ctx;
  const eqList = eq.length > 0 ? eq.join(", ") : "bodyweight only";
  const recentList = rw.slice(0, 5).map((w) => `${w.name} (${w.date})`).join(", ") || "none";
  const dietLine = p.dietPreferences?.length
    ? `DIETARY PREFERENCES: ${p.dietPreferences.join(", ")}`
    : "DIETARY PREFERENCES: none specified";
  const allergenLine = p.allergens?.length
    ? `ALLERGENS (MUST AVOID): ${p.allergens.join(", ")}`
    : "ALLERGENS: none";

  return `You are the PrimalForge AI Coach named ANVIL — a senior sports scientist and nutrition advisor.
You speak in direct, evidence-based language. No fluff. No disclaimers. No "I'm just an AI" caveats.
British English spelling. Metric units (kg, cm, g, kcal).

USER PROFILE:
- Sex: ${p.sex === "m" ? "Male" : "Female"}, Weight: ${p.weight}kg, Height: ${p.height}cm
- Body Fat: ${p.bodyFat}%, LBM: ${p.lbm}kg, BMR: ${p.bmr}, TDEE: ${p.tdee}
- Goal: ${p.goal}, Created: ${p.createdAt}

DAILY TARGETS: ${p.calories} kcal · ${p.protein}P / ${p.fat}F / ${p.carbs}C

TODAY'S INTAKE:
- Consumed: ${Math.round(t.kcal)} kcal · ${Math.round(t.p)}P / ${Math.round(t.f)}F / ${Math.round(t.c)}C
- Remaining: ${Math.round(r.kcal)} kcal · ${Math.round(r.p)}P / ${Math.round(r.f)}F / ${Math.round(r.c)}C

AVAILABLE EQUIPMENT: ${eqList}
RECENT WORKOUTS: ${recentList}
${dietLine}
${allergenLine}

RULES:
- Cite peer-reviewed sources when making claims about training or nutrition.
- When suggesting meals, prefer whole foods: meat, fish, eggs, dairy, organs, berries, honey, root veg.
- When generating workouts, only use exercises possible with the user's available equipment.
- For supplements, reference systematic reviews and RCTs. Grade evidence strength.
- Keep responses concise but actionable. No padding.`;
}

// ─── Core API Call ────────────────────────────────────────────────────────────

async function callGemini(
  request: GeminiRequest,
): Promise<string> {
  if (!_GEMINI_KEY) throw new Error("GEMINI_KEY_MISSING");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${encodeURIComponent(_GEMINI_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Coach request timed out. Try again.");
    }
    throw new Error("Couldn't reach the AI coach. Check your connection.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limited. Wait a moment and try again.");
    if (res.status === 403) throw new Error("API key invalid or quota exceeded.");
    throw new Error(`Coach error (${res.status}): ${errorBody.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from coach. Try again.");
  return text.trim();
}

// ─── Chat with Coach ─────────────────────────────────────────────────────────

export async function chatWithCoach(
  messages: CoachMessage[],
  ctx: CoachContext,
): Promise<string> {
  const contents: GeminiContent[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  return callGemini({
    contents,
    systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800,
    },
  });
}

// ─── Generate Workout ────────────────────────────────────────────────────────

export async function generateWorkout(
  ctx: CoachContext,
  preferences: {
    focus: string;
    duration: number;
    intensity: string;
  },
): Promise<GeneratedWorkout> {
  const prompt = `Generate a ${preferences.duration}-minute ${preferences.focus} workout at ${preferences.intensity} intensity.
Use ONLY equipment from: ${ctx.equipment.length > 0 ? ctx.equipment.join(", ") : "bodyweight only"}.

Respond in this EXACT JSON format (no markdown, no backticks, just raw JSON):
{
  "name": "WORKOUT NAME IN CAPS",
  "focus": "${preferences.focus}",
  "duration": ${preferences.duration},
  "intensity": "${preferences.intensity}",
  "warmup": ["movement 1", "movement 2"],
  "exercises": [
    {"name": "Exercise Name", "setsReps": "3 × 10 reps", "cue": "Form cue here"}
  ],
  "cooldown": ["stretch 1", "stretch 2"],
  "scienceNote": "Why this workout works, with citation."
}`;

  const text = await callGemini({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(text) as GeneratedWorkout;
  } catch {
    // If JSON parse fails, try to extract JSON from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as GeneratedWorkout;
    throw new Error("Couldn't parse workout response. Try again.");
  }
}

// ─── Suggest Meals ───────────────────────────────────────────────────────────

export async function suggestMeals(
  ctx: CoachContext,
  dietPref: DietPreference,
): Promise<MealSuggestion[]> {
  const prefLabel = dietPref === "no-preference" ? "no restrictions" : dietPref;
  const prompt = `Suggest 3 meals to fill my remaining macros today.
Remaining: ${Math.round(ctx.remaining.kcal)} kcal, ${Math.round(ctx.remaining.p)}P / ${Math.round(ctx.remaining.f)}F / ${Math.round(ctx.remaining.c)}C.
Dietary preference: ${prefLabel}.
Prioritise whole foods: meat, fish, eggs, organs, dairy, berries, root veg, honey.

Respond in this EXACT JSON format (no markdown, no backticks, just raw JSON):
[
  {
    "name": "Meal Name",
    "description": "One-line description",
    "kcal": 500,
    "p": 40,
    "f": 20,
    "c": 30,
    "ingredients": ["200g chicken breast", "100g sweet potato"],
    "prepTime": 15
  }
]`;

  const text = await callGemini({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1200,
      responseMimeType: "application/json",
    },
  });

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as MealSuggestion[];
    throw new Error("Couldn't parse meal suggestions. Try again.");
  }
}

// ─── Evaluate Supplement ─────────────────────────────────────────────────────

export async function evaluateSupplement(
  supplementName: string,
  ctx: CoachContext,
): Promise<SupplementVerdict> {
  const prompt = `Evaluate the supplement "${supplementName}" for this user.
Consider their goal (${ctx.profile.goal}), activity level, and body composition.
Use Examine.com-grade evidence: systematic reviews, RCTs, meta-analyses.
Grade each piece of evidence as "strong", "moderate", or "weak".

Respond in this EXACT JSON format (no markdown, no backticks, just raw JSON):
{
  "name": "${supplementName}",
  "verdict": "keep" | "bin" | "conditional",
  "score": 7,
  "summary": "One-paragraph verdict with key takeaway.",
  "benefits": ["Benefit 1 with specifics", "Benefit 2"],
  "risks": ["Risk 1", "Risk 2"],
  "evidence": [
    {"claim": "Specific claim", "source": "Author et al. (Year) Journal", "strength": "strong"}
  ],
  "dosage": "Recommended dosage if verdict is keep/conditional"
}

Score guide: 1-3 = BIN, 4-6 = CONDITIONAL, 7-10 = KEEP.
Be honest. If it's snake oil, say so. If it works, cite the evidence.`;

  const text = await callGemini({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
    generationConfig: {
      temperature: 0.4, // lower temp for more factual responses
      maxOutputTokens: 1500,
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(text) as SupplementVerdict;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]) as SupplementVerdict;
    throw new Error("Couldn't parse supplement evaluation. Try again.");
  }
}
