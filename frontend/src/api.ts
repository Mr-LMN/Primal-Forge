// ─── Wger Workout Manager ───────────────────────────────────────────────────
// Free, no API key required.
// https://wger.de/api/v2/

export type WgerSuggestion = {
  value: string;
  data: {
    id: number;
    base_id: number;
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

export async function searchWgerExercises(term: string): Promise<WgerSuggestion[]> {
  const url = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}&language=english&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Exercise search unavailable");
  const json = await res.json();
  const suggestions = (json.suggestions ?? []) as WgerSuggestion[];
  const seen = new Set<number>();
  return suggestions.filter((s) => {
    if (seen.has(s.data.base_id)) return false;
    seen.add(s.data.base_id);
    return true;
  });
}

export async function getWgerExerciseDetail(baseId: number): Promise<WgerExerciseDetail> {
  const url = `https://wger.de/api/v2/exerciseinfo/${baseId}/?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Exercise info unavailable");
  const json = await res.json();
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
    const n = (id: number): number =>
      f.foodNutrients?.find((x: any) => x.nutrientId === id)?.value ?? 0;
    return {
      fdcId: f.fdcId,
      description: f.description,
      kcal: Math.round(n(1008)),
      protein: Math.round(n(1003) * 10) / 10,
      fat: Math.round(n(1004) * 10) / 10,
      carbs: Math.round(n(1005) * 10) / 10,
    };
  });
}

// ─── Nutritionix ─────────────────────────────────────────────────────────────
// Free tier: 500 food searches + 50 NLP exercise lookups per day.
// Sign up: https://www.nutritionix.com/business/api
// Add to frontend/.env.local:
//   EXPO_PUBLIC_NUTRITIONIX_APP_ID=your_app_id
//   EXPO_PUBLIC_NUTRITIONIX_APP_KEY=your_app_key
export const NUTRITIONIX_AVAILABLE = !!(
  process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID &&
  process.env.EXPO_PUBLIC_NUTRITIONIX_APP_KEY
);

// ─── ExerciseDB via RapidAPI ──────────────────────────────────────────────────
// Free tier: 1,000 requests per day.
// Sign up: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
// Add to frontend/.env.local → EXPO_PUBLIC_EXERCISEDB_API_KEY=your_rapidapi_key
export const EXERCISEDB_AVAILABLE = !!process.env.EXPO_PUBLIC_EXERCISEDB_API_KEY;
