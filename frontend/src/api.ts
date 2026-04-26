// ─── Shared fetch helpers ────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  source: string;
  constructor(source: string, message: string, status = 0) {
    super(`[${source}] ${message}`);
    this.name = "ApiError";
    this.source = source;
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 8000;

async function fetchJson<T>(
  source: string,
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  // AbortSignal.timeout isn't on every Hermes/RN runtime; fall back to manual abort.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "PrimalForge/1.0 (+https://github.com/Mr-LMN/primal-forge)",
        ...(init.headers ?? {}),
      },
    });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new ApiError(source, `Request timed out after ${timeoutMs}ms`, 0);
    }
    throw new ApiError(source, err?.message ?? "Network request failed", 0);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new ApiError(source, `HTTP ${res.status} ${res.statusText}`, res.status);
  }
  try {
    return (await res.json()) as T;
  } catch (err: any) {
    throw new ApiError(source, `Invalid JSON response: ${err?.message ?? "parse failed"}`, res.status);
  }
}

// ─── Wger Workout Manager ───────────────────────────────────────────────────
// Free, no API key required.
// https://wger.de/api/v2/

export type WgerSuggestion = {
  value: string;
  data: {
    // Wger's response includes both `id` and (historically) `base_id`. The
    // exerciseinfo endpoint expects the base id; on newer schema versions
    // `base_id` may be absent and `id` carries the same value. Tolerate both.
    id: number;
    base_id?: number;
    name: string;
    category: string;
  };
};

export type WgerExerciseDetail = {
  baseId: number;
  name: string;
  category: string;
  description: string;
  muscles: string[];
  musclesSecondary: string[];
  equipment: string[];
};

export function wgerSuggestionId(s: WgerSuggestion): number {
  return s.data.base_id ?? s.data.id;
}

// ─── Local exercise database (offline fallback) ───────────────────────────────
// IDs >= 100000 are local and never sent to the wger API.
const LOCAL_ID_BASE = 100000;

const LOCAL_EXERCISES: WgerExerciseDetail[] = [
  // ── Legs ──
  { baseId: LOCAL_ID_BASE + 1, name: "Barbell Back Squat", category: "Legs", description: "Place barbell across upper traps, squat until thighs are parallel, then drive back up through the heels.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Hamstrings", "Calves", "Core"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 2, name: "Goblet Squat", category: "Legs", description: "Hold a dumbbell or kettlebell at chest, squat deep keeping torso upright.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Core", "Upper back"], equipment: ["Dumbbell", "Kettlebell"] },
  { baseId: LOCAL_ID_BASE + 3, name: "Bulgarian Split Squat", category: "Legs", description: "Rear foot elevated on bench, lower into single-leg squat until rear knee nearly touches floor.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Hamstrings", "Core"], equipment: ["Dumbbell", "Barbell", "Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 4, name: "Romanian Deadlift", category: "Legs", description: "Hip hinge with soft knees, lower bar along shins feeling hamstring stretch, then drive hips forward.", muscles: ["Hamstrings", "Gluteus maximus"], musclesSecondary: ["Lower back", "Core"], equipment: ["Barbell", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 5, name: "Leg Press", category: "Legs", description: "Feet shoulder-width on platform, lower sled until knees reach 90°, press through heels.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Hamstrings", "Calves"], equipment: ["Machine"] },
  { baseId: LOCAL_ID_BASE + 6, name: "Walking Lunge", category: "Legs", description: "Step forward into lunge, back knee lightly touches floor, then bring rear foot forward and repeat.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Hamstrings", "Core"], equipment: ["Bodyweight", "Dumbbell", "Barbell"] },
  { baseId: LOCAL_ID_BASE + 7, name: "Leg Curl", category: "Legs", description: "Lying face down on machine, curl heels towards glutes against resistance.", muscles: ["Hamstrings"], musclesSecondary: ["Calves"], equipment: ["Machine"] },
  { baseId: LOCAL_ID_BASE + 8, name: "Calf Raise", category: "Calves", description: "Stand with balls of feet on step, lower heels then explosively rise onto toes.", muscles: ["Calves"], musclesSecondary: [], equipment: ["Bodyweight", "Machine", "Barbell"] },
  { baseId: LOCAL_ID_BASE + 9, name: "Glute Bridge", category: "Legs", description: "Lie on back, feet flat on floor hip-width, drive hips to ceiling squeezing glutes at top.", muscles: ["Gluteus maximus"], musclesSecondary: ["Hamstrings", "Core"], equipment: ["Bodyweight", "Barbell"] },
  { baseId: LOCAL_ID_BASE + 10, name: "Hip Thrust", category: "Legs", description: "Upper back on bench, barbell across hips, drive hips to full extension squeezing glutes.", muscles: ["Gluteus maximus"], musclesSecondary: ["Hamstrings", "Core"], equipment: ["Barbell", "Dumbbell"] },
  // ── Back ──
  { baseId: LOCAL_ID_BASE + 11, name: "Conventional Deadlift", category: "Back", description: "Hip-width stance, grip bar just outside legs, drive floor away with legs then lock hips at top.", muscles: ["Hamstrings", "Gluteus maximus", "Lower back"], musclesSecondary: ["Traps", "Forearms", "Core"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 12, name: "Sumo Deadlift", category: "Back", description: "Wide stance, toes pointed out, grip bar inside legs. Drive knees out and hips through at lockout.", muscles: ["Hamstrings", "Gluteus maximus", "Inner thighs"], musclesSecondary: ["Lower back", "Traps"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 13, name: "Barbell Row", category: "Back", description: "Hip hinge until torso near parallel, row barbell to lower ribs keeping elbows tucked.", muscles: ["Latissimus dorsi", "Rhomboids"], musclesSecondary: ["Biceps", "Rear delts", "Lower back"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 14, name: "Dumbbell Row", category: "Back", description: "One knee and hand on bench, row dumbbell to hip, keeping elbow close to body.", muscles: ["Latissimus dorsi", "Rhomboids"], musclesSecondary: ["Biceps", "Rear delts"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 15, name: "Pull-up", category: "Back", description: "Overhand grip wider than shoulders, pull chin above bar leading with elbows, lower under control.", muscles: ["Latissimus dorsi"], musclesSecondary: ["Biceps", "Rear delts", "Core"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 16, name: "Chin-up", category: "Back", description: "Supinated (underhand) grip at shoulder-width, pull chin above bar, lower under control.", muscles: ["Latissimus dorsi", "Biceps"], musclesSecondary: ["Rear delts", "Core"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 17, name: "Lat Pulldown", category: "Back", description: "Grip bar wider than shoulders, pull to upper chest driving elbows down and back.", muscles: ["Latissimus dorsi"], musclesSecondary: ["Biceps", "Rear delts"], equipment: ["Machine"] },
  { baseId: LOCAL_ID_BASE + 18, name: "Cable Row", category: "Back", description: "Seated, pull handle to lower ribs keeping chest tall and elbows close.", muscles: ["Rhomboids", "Latissimus dorsi"], musclesSecondary: ["Biceps", "Rear delts"], equipment: ["Cable"] },
  { baseId: LOCAL_ID_BASE + 19, name: "Face Pull", category: "Back", description: "Cable at forehead height, pull rope to face flaring elbows high and externally rotating at the end.", muscles: ["Rear delts", "Rhomboids"], musclesSecondary: ["Rotator cuff", "Traps"], equipment: ["Cable"] },
  { baseId: LOCAL_ID_BASE + 20, name: "Good Morning", category: "Back", description: "Bar on traps, hinge at hips with soft knees until torso is near parallel, extend back up.", muscles: ["Hamstrings", "Lower back"], musclesSecondary: ["Gluteus maximus", "Core"], equipment: ["Barbell"] },
  // ── Chest ──
  { baseId: LOCAL_ID_BASE + 21, name: "Barbell Bench Press", category: "Chest", description: "Lie on bench, unrack bar, lower to mid-chest with 45° elbows, press to lockout.", muscles: ["Pectorals"], musclesSecondary: ["Triceps", "Front delts"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 22, name: "Dumbbell Bench Press", category: "Chest", description: "Dumbbells at chest, press up converging slightly, lower under control to a slight stretch.", muscles: ["Pectorals"], musclesSecondary: ["Triceps", "Front delts"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 23, name: "Incline Bench Press", category: "Chest", description: "Bench at 30-45°, press bar from upper chest. Targets upper pecs more than flat press.", muscles: ["Pectorals (upper)"], musclesSecondary: ["Triceps", "Front delts"], equipment: ["Barbell", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 24, name: "Push-up", category: "Chest", description: "Plank position, hands slightly wider than shoulders. Lower chest to floor, press back up.", muscles: ["Pectorals"], musclesSecondary: ["Triceps", "Front delts", "Core"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 25, name: "Cable Fly", category: "Chest", description: "Cables at mid-height, slight forward lean, arc arms together in front of chest.", muscles: ["Pectorals"], musclesSecondary: ["Front delts"], equipment: ["Cable"] },
  { baseId: LOCAL_ID_BASE + 26, name: "Dips", category: "Chest", description: "On parallel bars, slight forward lean, lower until elbows reach 90°, press back up.", muscles: ["Pectorals (lower)", "Triceps"], musclesSecondary: ["Front delts"], equipment: ["Bodyweight"] },
  // ── Shoulders ──
  { baseId: LOCAL_ID_BASE + 27, name: "Overhead Press", category: "Shoulders", description: "Bar at clavicle, press overhead to lockout, finishing with bar over mid-foot when viewed from side.", muscles: ["Deltoids (front)", "Deltoids (lateral)"], musclesSecondary: ["Triceps", "Upper traps", "Core"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 28, name: "Dumbbell Shoulder Press", category: "Shoulders", description: "Dumbbells at ear height, press overhead, lower under control.", muscles: ["Deltoids"], musclesSecondary: ["Triceps", "Upper traps"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 29, name: "Lateral Raise", category: "Shoulders", description: "Slight forward lean, raise dumbbells out to sides until upper arm is parallel to floor.", muscles: ["Deltoids (lateral)"], musclesSecondary: ["Traps"], equipment: ["Dumbbell", "Cable"] },
  { baseId: LOCAL_ID_BASE + 30, name: "Arnold Press", category: "Shoulders", description: "Start with palms facing you, rotate as you press overhead so palms face out at top.", muscles: ["Deltoids"], musclesSecondary: ["Triceps", "Rotator cuff"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 31, name: "Upright Row", category: "Shoulders", description: "Overhand grip, pull bar to chin level driving elbows high.", muscles: ["Deltoids (lateral)", "Traps"], musclesSecondary: ["Biceps", "Forearms"], equipment: ["Barbell", "Dumbbell", "Cable"] },
  // ── Arms ──
  { baseId: LOCAL_ID_BASE + 32, name: "Barbell Curl", category: "Arms", description: "Underhand shoulder-width grip, curl bar to shoulder height keeping elbows stationary.", muscles: ["Biceps"], musclesSecondary: ["Brachialis", "Forearms"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 33, name: "Dumbbell Curl", category: "Arms", description: "Alternate or simultaneous curls, supinate at the top for full bicep contraction.", muscles: ["Biceps"], musclesSecondary: ["Brachialis", "Forearms"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 34, name: "Hammer Curl", category: "Arms", description: "Neutral grip (palms facing each other), curl to shoulder height. Targets brachialis.", muscles: ["Brachialis", "Biceps"], musclesSecondary: ["Forearms"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 35, name: "Tricep Pushdown", category: "Arms", description: "Cable at forehead level, elbows pinned to sides, extend arms to lockout.", muscles: ["Triceps"], musclesSecondary: [], equipment: ["Cable"] },
  { baseId: LOCAL_ID_BASE + 36, name: "Skull Crusher", category: "Arms", description: "Lying on bench, bar above forehead, lower to just above forehead by bending elbows only.", muscles: ["Triceps"], musclesSecondary: [], equipment: ["Barbell", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 37, name: "Overhead Tricep Extension", category: "Arms", description: "Arms overhead, lower dumbbell behind head bending at elbows, extend back up.", muscles: ["Triceps (long head)"], musclesSecondary: [], equipment: ["Dumbbell", "Cable"] },
  { baseId: LOCAL_ID_BASE + 38, name: "Preacher Curl", category: "Arms", description: "Upper arms on pad, curl through full range without letting elbows lift.", muscles: ["Biceps (short head)"], musclesSecondary: ["Brachialis"], equipment: ["Barbell", "Dumbbell", "Cable"] },
  // ── Core ──
  { baseId: LOCAL_ID_BASE + 39, name: "Plank", category: "Core", description: "Forearm plank position, brace entire core, keep hips level. Hold 20-60 s.", muscles: ["Core", "Transverse abdominis"], musclesSecondary: ["Glutes", "Shoulder stabilisers"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 40, name: "Ab Wheel Rollout", category: "Core", description: "From kneeling, roll wheel forward until body is near parallel, pull back with core.", muscles: ["Core", "Transverse abdominis"], musclesSecondary: ["Latissimus dorsi", "Shoulders"], equipment: ["Ab wheel"] },
  { baseId: LOCAL_ID_BASE + 41, name: "Hanging Leg Raise", category: "Core", description: "Dead hang, raise straight legs to parallel (or knees to chest for easier version).", muscles: ["Lower abs", "Core"], musclesSecondary: ["Hip flexors", "Grip"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 42, name: "Cable Crunch", category: "Core", description: "Kneeling, rope behind head, crunch elbows to knees rounding spine. Resist on the way up.", muscles: ["Rectus abdominis"], musclesSecondary: ["Obliques"], equipment: ["Cable"] },
  { baseId: LOCAL_ID_BASE + 43, name: "Russian Twist", category: "Core", description: "Seated, feet raised, rotate torso side to side touching weight to each side.", muscles: ["Obliques"], musclesSecondary: ["Core"], equipment: ["Bodyweight", "Dumbbell", "Medicine ball"] },
  { baseId: LOCAL_ID_BASE + 44, name: "Dead Bug", category: "Core", description: "Lying on back, arms & knees raised, extend opposite arm and leg simultaneously keeping low back flat.", muscles: ["Core", "Transverse abdominis"], musclesSecondary: ["Hip flexors"], equipment: ["Bodyweight"] },
  // ── Cardio / Full Body ──
  { baseId: LOCAL_ID_BASE + 45, name: "Kettlebell Swing", category: "Cardio", description: "Hip hinge to load hamstrings, explosive hip drive to swing bell to shoulder height.", muscles: ["Hamstrings", "Gluteus maximus"], musclesSecondary: ["Core", "Shoulders", "Lower back"], equipment: ["Kettlebell"] },
  { baseId: LOCAL_ID_BASE + 46, name: "Burpee", category: "Cardio", description: "Squat down, jump feet back to plank, push up, jump feet forward, jump up with arms overhead.", muscles: ["Full body"], musclesSecondary: [], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 47, name: "Box Jump", category: "Cardio", description: "Quarter squat, jump onto box landing softly with knees bent, step back down.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Calves", "Core"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 48, name: "Thruster", category: "Cardio", description: "Front rack squat, drive out of the bottom and use momentum to press bar overhead in one fluid motion.", muscles: ["Quadriceps", "Deltoids", "Gluteus maximus"], musclesSecondary: ["Core", "Triceps"], equipment: ["Barbell", "Dumbbell", "Kettlebell"] },
  { baseId: LOCAL_ID_BASE + 49, name: "Clean and Press", category: "Cardio", description: "Pull barbell from floor to front rack (clean), then press overhead.", muscles: ["Full body"], musclesSecondary: [], equipment: ["Barbell", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 50, name: "Mountain Climber", category: "Cardio", description: "High plank, drive knees to chest alternately at pace while keeping hips level.", muscles: ["Core", "Hip flexors"], musclesSecondary: ["Shoulders", "Chest"], equipment: ["Bodyweight"] },
  // ── Olympic / Power ──
  { baseId: LOCAL_ID_BASE + 51, name: "Power Clean", category: "Olympic weightlifting", description: "Pull bar from floor, triple extension of ankles/knees/hips, catch in partial front squat.", muscles: ["Hamstrings", "Gluteus maximus", "Traps"], musclesSecondary: ["Core", "Forearms", "Calves"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 52, name: "Snatch", category: "Olympic weightlifting", description: "Wide grip pull from floor to overhead in one movement, catching in full overhead squat.", muscles: ["Full body"], musclesSecondary: [], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 53, name: "Push Press", category: "Shoulders", description: "Dip and drive with legs to initiate bar movement, then press overhead.", muscles: ["Deltoids", "Triceps"], musclesSecondary: ["Quadriceps", "Core"], equipment: ["Barbell", "Dumbbell"] },
  // ── Hinge / Posterior chain ──
  { baseId: LOCAL_ID_BASE + 54, name: "Trap Bar Deadlift", category: "Back", description: "Stand inside hex bar, neutral grip handles, lift by extending hips and knees simultaneously.", muscles: ["Quadriceps", "Hamstrings", "Gluteus maximus"], musclesSecondary: ["Traps", "Core"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 55, name: "Nordic Curl", category: "Legs", description: "Secure feet, lower body toward floor using hamstrings alone, catch with hands, pull back up.", muscles: ["Hamstrings"], musclesSecondary: ["Calves", "Gluteus maximus"], equipment: ["Bodyweight"] },
  { baseId: LOCAL_ID_BASE + 56, name: "Single-Leg Deadlift", category: "Legs", description: "Hinge on one leg, lower weight toward floor, keep hips square.", muscles: ["Hamstrings", "Gluteus maximus"], musclesSecondary: ["Core", "Lower back"], equipment: ["Dumbbell", "Kettlebell", "Barbell"] },
  // ── Additional common ──
  { baseId: LOCAL_ID_BASE + 57, name: "Bench Row", category: "Back", description: "Lie prone on incline bench, row dumbbells up keeping elbows at 45°.", muscles: ["Rhomboids", "Rear delts"], musclesSecondary: ["Biceps", "Traps"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 58, name: "Seated Row Machine", category: "Back", description: "Chest pad for support, grip handles and pull to mid-section squeezing shoulder blades.", muscles: ["Rhomboids", "Latissimus dorsi"], musclesSecondary: ["Biceps"], equipment: ["Machine"] },
  { baseId: LOCAL_ID_BASE + 59, name: "Chest Fly", category: "Chest", description: "Dumbbells above chest, lower in a wide arc until stretch is felt, bring back together.", muscles: ["Pectorals"], musclesSecondary: ["Front delts"], equipment: ["Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 60, name: "Close-Grip Bench Press", category: "Arms", description: "Bench press with hands shoulder-width, keeps elbows close to body to emphasise triceps.", muscles: ["Triceps"], musclesSecondary: ["Pectorals", "Front delts"], equipment: ["Barbell"] },
  { baseId: LOCAL_ID_BASE + 61, name: "Reverse Fly", category: "Shoulders", description: "Hinged forward, raise dumbbells out to sides with slight elbow bend targeting rear delts.", muscles: ["Rear delts", "Rhomboids"], musclesSecondary: ["Traps"], equipment: ["Dumbbell", "Cable"] },
  { baseId: LOCAL_ID_BASE + 62, name: "Shrug", category: "Back", description: "Elevate shoulders straight up toward ears, pause, lower slowly. No rolling.", muscles: ["Traps (upper)"], musclesSecondary: ["Levator scapulae"], equipment: ["Barbell", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 63, name: "Step-up", category: "Legs", description: "Drive through heel of elevated foot, bring opposite knee up, lower under control.", muscles: ["Quadriceps", "Gluteus maximus"], musclesSecondary: ["Hamstrings", "Core"], equipment: ["Bodyweight", "Dumbbell"] },
  { baseId: LOCAL_ID_BASE + 64, name: "Sumo Squat", category: "Legs", description: "Wide stance, toes out ~45°, squat keeping chest up and knees tracking toes.", muscles: ["Inner thighs", "Gluteus maximus", "Quadriceps"], musclesSecondary: ["Hamstrings"], equipment: ["Bodyweight", "Dumbbell", "Kettlebell"] },
];

function _localSearch(term: string): WgerSuggestion[] {
  const q = term.toLowerCase();
  return LOCAL_EXERCISES
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.muscles.some((m) => m.toLowerCase().includes(q)) ||
        e.musclesSecondary.some((m) => m.toLowerCase().includes(q))
    )
    .slice(0, 12)
    .map((e) => ({
      value: e.name,
      data: { id: e.baseId, name: e.name, category: e.category },
    }));
}

export async function searchWgerExercises(term: string): Promise<WgerSuggestion[]> {
  // language=2 is the numeric ID for English. The previous `language=english`
  // value was silently ignored on some wger versions and could return empty
  // results or 400s.
  const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=2&format=json`;
  try {
    const json = await fetchJson<{ suggestions?: WgerSuggestion[] }>("wger", url);
    const suggestions = json.suggestions ?? [];
    const seen = new Set<number>();
    const remote = suggestions.filter((s) => {
      const id = wgerSuggestionId(s);
      if (id == null || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    // If wger returned useful results, prefer them; supplement with local if sparse.
    if (remote.length >= 3) return remote;
    const local = _localSearch(term).filter((l) => !remote.some((r) => r.value.toLowerCase() === l.value.toLowerCase()));
    return [...remote, ...local].slice(0, 12);
  } catch {
    // wger unreachable or erroring — fall back to built-in database silently.
    return _localSearch(term);
  }
}

export async function getWgerExerciseDetail(baseId: number): Promise<WgerExerciseDetail> {
  // Local exercise — no network call needed.
  if (baseId >= LOCAL_ID_BASE) {
    const local = LOCAL_EXERCISES.find((e) => e.baseId === baseId);
    if (local) return local;
    throw new ApiError("local", "Exercise not found", 404);
  }

  const url = `https://wger.de/api/v2/exerciseinfo/${baseId}/?format=json`;
  const json = await fetchJson<any>("wger", url);
  const en = (json.translations ?? []).find((t: any) => t.language?.short_name === "en");
  const fallback = json.translations?.[0];
  return {
    baseId: json.id,
    name: en?.name ?? fallback?.name ?? "Unknown",
    category: json.category?.name ?? "",
    description: _stripHtml(en?.description ?? fallback?.description ?? ""),
    muscles: (json.muscles ?? []).map((m: any) => m.name_en || m.name).filter(Boolean),
    musclesSecondary: (json.muscles_secondary ?? []).map((m: any) => m.name_en || m.name).filter(Boolean),
    equipment: (json.equipment ?? []).map((e: any) => e.name).filter(Boolean),
  };
}

function _stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ─── USDA FoodData Central ────────────────────────────────────────────────────
// Free tier, API key required.
// Sign up: https://fdc.nal.usda.gov/api-key-signup.html
// Add to frontend/.env.local → EXPO_PUBLIC_USDA_API_KEY=your_key_here

const _USDA_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY ?? "";
export const USDA_AVAILABLE = !!_USDA_KEY;

export type UsdaFood = {
  fdcId: number;
  description: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export async function searchUsdaFoods(query: string): Promise<UsdaFood[]> {
  if (!_USDA_KEY) throw new Error("USDA_KEY_MISSING");
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=12&api_key=${encodeURIComponent(_USDA_KEY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("USDA search failed");
  const json = await res.json();
  return (json.foods ?? []).map((f: any) => {
    // Foundation/SR foods use 2047 (Atwater General) for kcal; branded foods use 1008
    const n = (id: number): number =>
      f.foodNutrients?.find((x: any) => x.nutrientId === id)?.value ?? 0;
    const kcal = n(1008) || n(2047) || n(2048);
    return {
      fdcId: f.fdcId,
      description: f.description,
      kcal: Math.round(kcal),
      protein: Math.round(n(1003) * 10) / 10,
      fat: Math.round(n(1004) * 10) / 10,
      carbs: Math.round(n(1005) * 10) / 10,
    };
  });
}

// ─── Nutritionix ─────────────────────────────────────────────────────────────
// Free tier: 500 food searches + 50 NLP exercise lookups per day.
// Requires a business email to sign up — skipping for now.
// Sign up: https://www.nutritionix.com/business/api
export const NUTRITIONIX_AVAILABLE = !!(
  process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID &&
  process.env.EXPO_PUBLIC_NUTRITIONIX_APP_KEY
);

// ─── ExerciseDB via RapidAPI ──────────────────────────────────────────────────
// Free tier: 1,000 requests per day.
// Sign up: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
// Add to frontend/.env.local → EXPO_PUBLIC_EXERCISEDB_API_KEY=your_rapidapi_key

const _EXERCISEDB_KEY = process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY ?? "";
export const EXERCISEDB_AVAILABLE = !!_EXERCISEDB_KEY;

export type ExerciseDbEntry = {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | string;
  category: string;
};

export async function searchExerciseDb(name: string): Promise<ExerciseDbEntry[]> {
  if (!_EXERCISEDB_KEY) throw new ApiError("exercisedb", "API key not configured");
  const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(name.toLowerCase())}?limit=5&offset=0`;
  return fetchJson<ExerciseDbEntry[]>("exercisedb", url, {
    headers: {
      "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      "x-rapidapi-key": _EXERCISEDB_KEY,
    },
  });
}
