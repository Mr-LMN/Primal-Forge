# PRIMALFORGE — Product Requirements Document

## Vision
Brutalist, dark-mode metabolic tracker for biohackers, carnivore, animal-based dieters, and the
30–60 Hyrox/CrossFit/clean-eating tribe. British-first. Goal-driven. Peer-reviewed protocols.
One-stop shop for fuel, training, science, and (Phase C) cosmetic-ingredient truth.

## Stack
- **Frontend**: Expo React Native, modular
  - `app/index.tsx` — components & screens
  - `src/data.ts` — foods, tips, workouts, equipment, types, helpers
  - `src/styles.ts` — shared StyleSheet
- **Storage**: AsyncStorage (v2/v3/v4 keys)
- **Backend**: FastAPI scaffold (reserved for Pro/Stripe/cloud-sync)

## 5-Tab Structure
1. **HUD** — Daily Intel (XP earner) · macro bars · traffic-light carbs · burpee penalty · siphon alarm · hydration · LBM/BMR/TDEE · weight trend
2. **FUEL** — 70+ British whole foods · recents · multi-unit (g/tsp/tbsp/rasher/egg/etc) · live macro preview · today's log
3. **FORGE** — **30 workouts** with equipment system & alternatives:
   - Filters: focus / time / **MY KIT** equipment match
   - Sources: CrossFit.com, Hyrox · Official Race, Marcus Filly · Functional Bodybuilding, Ben Greenfield, Wendler 5/3/1, Knees Over Toes Guy, Tabata 1996, Norwegian 4×4, Andrew Weil
   - Per-exercise: equipment chips · YouTube form-tutorial · alternatives panel (e.g., no pull-up bar → ring row / DB row / banded pulldown)
   - Workout count badge · CLEAR ALL filters
   - +100 XP per completed workout
4. **SCAN** — Phase C placeholder for ingredient/cosmetic risk scanner
5. **VAULT** — XP wallet · streak · credits · today's earnings · 6 perk redemptions (Honest Biltong / Bulk Powders / Black Insomnia + content unlocks) · carb bank ledger · Arsenal archive of 15 tips

## Equipment System (Phase B)
17 equipment types: bodyweight, dumbbell, kettlebell, barbell, pull-up bar, resistance bands,
rower, ski erg, sled, air/echo bike, treadmill, plyo box, wall ball, sandbag, rings, sauna,
cold plunge/shower.

`canPerform(workout, available)` — evaluates if user can do every exercise either directly
or via alternatives covering missing equipment. Powers MY KIT filter.

## Workout Library (30 total)
- **Fat Burn (5)**: Tabata Torch · Post-Prandial Siphon · 20-Min EMOM · VO₂ Crusher · Greenfield Z2 Engine (nasal-only)
- **Performance / Hyrox (5)**: Hyrox Full Sim (8 stations) · Roxzone Transitions · Row+Wall Ball Doubles · Farmer's March EMOM · Sled Endurance Block
- **Metcon (CrossFit.com benchmarks, 8)**: Cindy · Fran · Helen · Grace · Diane · Karen · Angie · Murph (no vest)
- **Strength (5)**: Back Squat 5×5 · Deadlift 5/3/1 · Press Day OHP+Incline · Pull Day Vert+Horiz · **Filly · Persist DB Circuit** (Marcus Filly Functional Bodybuilding)
- **Mobility (4)**: ATG Knees Over Toes · Hip Flexor Reclaim · Shoulder Prehab Flow · T-Spine Openers
- **Recovery (3)**: 4-7-8 Breath · **Greenfield Heat+Cold Stack** · Parasympathetic Reset

## Core Engine — Katch–McArdle (goal-adjusted)
- LBM, BMR, TDEE math; goal multipliers (0.8/1.0/1.1/1.05); protein scaling (2.4/2.0/2.2 g/kg);
  carb scaling (0.7/1.0/1.2)
- Body comp via Manual / **US Navy Tape** / **Visual Estimate**

## XP / Credit Economy
| Action | XP | Cap |
|---|---|---|
| Read Daily Intel | 50 | 1× |
| Log Meal | 10 | 5× |
| Mark Workout Complete | 100 | 2× |
| Hit All Macros (±10%) | 200 | 1× |
| Daily Weigh-in | 25 | 1× |
| 7-day Streak Bonus | 500 | every 7 days |

**1 credit = 1000 XP** · spend in VAULT > Perks · Stripe top-ups planned (Phase D)

## Persistence Keys
v2: profile · log · bank · bankHistory · water · weights · recents
v3: xp · workouts · intelRead
v4: **equipment**

## Polish
- expo-haptics on tab switch / button press / log success / XP award
- Animated XP toast (`+50 XP · INTEL READ`)
- Streak fire chip + credits diamond chip in header
- Daily Intel rotates by `dayOfYear() % TIPS.length`
- All workouts cite sources with badges (CrossFit.com / Hyrox / Marcus Filly / Ben Greenfield etc.)

## Smart Business Hooks
- **Affiliate revenue**: 6 perk slots in VAULT (DTC partners — Honest Biltong, Bulk Powders, Black Insomnia)
- **Pro tier ($4.99–$9.99/mo)**: Phase C SCAN database, Athlete-tier programming, AI macro-fit recipe generator, weekly TDEE auto-recalibration, unlimited credits
- **Athlete-tier upsell**: locked goal in onboarding teases Hyrox/CrossFit/Ironman as next product rung
- **Equipment-aware filtering** = retention lever (users with home gyms see workouts they can actually do, not generic feed)

## Roadmap (Phase C+)
- **Phase C**: SCAN tab built — paste ingredient list / barcode → red/amber/green verdict on parabens, phthalates, oxybenzone, retinyl palmitate, fragrance, aluminium salts, etc., 200+ flagged compounds with citations + cleaner alternatives
- **Phase D**: RECIPES inside FUEL (~25 macro-balanced whole-food recipes, filterable by remaining macros / goal / Hyrox prep tags)
- **Phase E**: Adaptive coaching (auto TDEE recalibration from weight trend) · Stripe credit packs · Apple Health/Google Fit step+sleep sync · photo-based BF estimator
