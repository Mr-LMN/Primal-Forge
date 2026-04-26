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

export async function searchWgerExercises(term: string): Promise<WgerSuggestion[]> {
  // language=2 is the numeric ID for English. The previous `language=english`
  // value was silently ignored on some wger versions and could return empty
  // results or 400s.
  const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=2&format=json`;
  const json = await fetchJson<{ suggestions?: WgerSuggestion[] }>("wger", url);
  const suggestions = json.suggestions ?? [];
  const seen = new Set<number>();
  return suggestions.filter((s) => {
    const id = wgerSuggestionId(s);
    if (id == null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export async function getWgerExerciseDetail(baseId: number): Promise<WgerExerciseDetail> {
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
