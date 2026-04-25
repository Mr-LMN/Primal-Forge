# PRIMALFORGE — Product Requirements Document

## Vision
A brutalist, dark-mode metabolic tracker for biohackers, carnivore, animal-based dieters, and
the 30–60 Hyrox/CrossFit/clean-eating tribe. British-first. Goal-driven. Peer-reviewed.
One-stop shop for fuel, training, science, and (soon) cosmetic-ingredient truth.

## Stack
- **Frontend**: Expo React Native (modular)
  - `app/index.tsx` — components & screens
  - `src/data.ts` — foods, tips, workouts, constants, types, helpers
  - `src/styles.ts` — shared StyleSheet
- **Storage**: AsyncStorage (v2 + v3 keys)
- **Backend**: None active (FastAPI scaffold reserved for Pro/Stripe)

## 5-Tab Structure
1. **HUD** — Daily Intel card (XP earner) + macro bars + traffic-light carb status + burpee penalty + hydration tracker + mini stats + weight trend
2. **FUEL** — Recents quick-log, food picker (70+ British whole-foods), per-food unit chips (g/tsp/tbsp/rasher/egg/etc), live macro preview, today's log, wipe day
3. **FORGE** — 25-workout training library, filter by focus (Fat Burn / Performance / Strength / Metcon / Mobility / Recovery) and max time. Each workout: science note + citation, exercises with sets/reps/cues, per-exercise YouTube form-tutorial links (Squat University default), Mark Complete (+100 XP)
4. **SCAN** — Coming Soon placeholder for Yuka-style cosmetic & food ingredient risk scanner
5. **VAULT** — XP wallet · streak · credits · today's earnings breakdown · 6 perk redemptions (content unlocks + affiliate: Honest Biltong / Bulk Powders Creatine / Black Insomnia Coffee) · carb bank ledger · Arsenal archive of 15 tips

## Core Engine — Katch–McArdle (goal-adjusted)
- LBM = W × (1 − BF/100); BMR = 370 + 21.6 × LBM; TDEE = BMR × Activity
- Calories = TDEE × { Fat Loss 0.80 · Maintain 1.00 · Muscle 1.10 · Athlete 1.05 }
- Protein g = W × { 2.4 · 2.0 · 2.2 · 2.2 }
- Carbs = ActivityCarbs × { 0.7 · 1.0 · 1.2 · 1.0 }
- Fat = (Cal − P×4 − C×4) / 9

## Body-comp inputs
- Manual BF% / **US Navy Tape Method** (log10 formula, ±3% of DEXA) / **Visual Estimate** (5 sex-specific cards)

## XP / Credit Economy
| Action | XP | Daily Cap |
|---|---|---|
| Read Daily Intel | 50 | 1× |
| Log Meal | 10 | 5× = 50 |
| Mark Workout Complete | 100 | 2× = 200 |
| Hit All Macros (±10%) | 200 | 1× |
| Daily Weigh-in | 25 | 1× |
| 7-day Streak Bonus | 500 | every 7 days |

**1 credit = 1000 XP**. Spend in VAULT > Perks. Future: Stripe top-ups for credit packs.

## Persistence (AsyncStorage)
- v2: `pf_profile_v2`, `pf_log_v2`, `pf_bank_v2`, `pf_bank_history_v2`, `pf_water_v2`, `pf_weights_v2`, `pf_recents_v2`
- v3: `pf_xp_v3`, `pf_workouts_v3`, `pf_intel_read_v3`

## Polish
- Haptic feedback on tab switch, button press, log success, XP award (expo-haptics)
- Animated XP toast notifications (`+50 XP · INTEL READ`)
- Streak fire chip + credits diamond chip in header
- Daily Intel rotates by `dayOfYear() % TIPS.length`

## Smart Business Hooks
- **Affiliate revenue**: 6 perk slots in VAULT — Honest Biltong, Bulk Powders, Black Insomnia (real partners as DTC matures). Credits earned by app engagement = trojan horse for re-engagement and partner CTR.
- **Pro tier ($4.99–$9.99/mo)**: deeper SCAN database, Athlete-tier programming (Hyrox/Ironman/CrossFit periodisation), AI macro-fit recipe generator, weekly TDEE recalibration, unlimited credits.
- **Athlete-tier upsell**: locked goal in onboarding teases Hyrox/CrossFit/Ironman as next-rung product.

## Roadmap (Phase B+)
- **Phase B**: RECIPES inside FUEL (~25 macro-balanced whole-food recipes, filterable by remaining macros & goal & Hyrox/CrossFit prep tags)
- **Phase C**: SCAN tab built — paste ingredient list or barcode → red/amber/green verdict on parabens, phthalates, oxybenzone, retinyl palmitate, fragrance, aluminium salts, etc., 200+ flagged compounds with citations
- **Phase D**: Adaptive coaching (auto TDEE recalibration from weight trend), Stripe credit packs, Apple Health/Google Fit step+sleep sync, photo-based BF estimator
