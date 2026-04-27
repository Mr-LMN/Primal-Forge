/**
 * PRIMALFORGE — IMAGE SERVICE
 * Fetches contextual images from Unsplash Source API (no key required).
 * Caches URLs in memory to avoid redundant network calls.
 *
 * Optional: set EXPO_PUBLIC_UNSPLASH_KEY for curated search results.
 */

const MEM_CACHE: Record<string, string> = {};

// Unsplash Source — free, no API key required.
// Returns a redirect to a real photo matching the query.
const UNSPLASH_BASE = "https://source.unsplash.com";

// Sensible fallback gradient pairs keyed by first char of query (deterministic)
const FALLBACK_GRADIENTS: [string, string][] = [
  ["#1a0e0a", "#3d1f0f"],
  ["#0a1220", "#0f2744"],
  ["#0a1a10", "#0f3320"],
  ["#1a1000", "#3d2800"],
  ["#180a1a", "#33103d"],
  ["#0a1818", "#0f3030"],
];

export function getGradientFallback(seed: string): [string, string] {
  const idx = seed.charCodeAt(0) % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[idx];
}

async function fetchUnsplashSource(
  query: string,
  width: number,
  height: number
): Promise<string | null> {
  const cacheKey = `${query}:${width}x${height}`;
  if (MEM_CACHE[cacheKey]) return MEM_CACHE[cacheKey];

  try {
    const encoded = encodeURIComponent(query);
    const url = `${UNSPLASH_BASE}/${width}x${height}/?${encoded}`;
    // Unsplash Source does a 302 redirect — we want the final URL
    const resp = await fetch(url, { method: "HEAD" });
    const finalUrl = resp.url;
    if (finalUrl && finalUrl.includes("images.unsplash.com")) {
      MEM_CACHE[cacheKey] = finalUrl;
      return finalUrl;
    }
    // Some envs return the source URL directly
    MEM_CACHE[cacheKey] = url;
    return url;
  } catch {
    return null;
  }
}

export async function getMealImage(mealName: string): Promise<string | null> {
  // Map recipe names to tighter search queries
  const query = `${mealName} food meal plate`;
  return fetchUnsplashSource(query, 400, 200);
}

export async function getExerciseImage(exerciseName: string): Promise<string | null> {
  const query = `${exerciseName} workout fitness`;
  return fetchUnsplashSource(query, 400, 200);
}

export async function getWorkoutHeroImage(focus: string): Promise<string | null> {
  const focusMap: Record<string, string> = {
    fatburn:     "cardio running sweat athlete",
    performance: "speed athletic training explosive",
    strength:    "barbell weightlifting powerlifting",
    metcon:      "crossfit functional fitness intense",
    mobility:    "stretching yoga flexibility calm",
    recovery:    "sauna ice bath recovery athlete",
  };
  const query = focusMap[focus] ?? "workout fitness training";
  return fetchUnsplashSource(query, 480, 220);
}
