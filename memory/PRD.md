# PRIMALFORGE — Product Requirements Document

## Vision
A brutalist, dark-mode metabolic tracker for biohackers, carnivore, and animal-based dieters.
Data-driven. No NHS guidelines. No bubbly animations. Peer-reviewed protocols only.

## Stack
- **Frontend**: Expo React Native (single-file app at `/app/frontend/app/index.tsx`)
- **Storage**: AsyncStorage (on-device persistence)
- **Backend**: None (default FastAPI scaffold untouched)
- **Navigation**: Internal 4-tab state (no expo-router child routes)

## Core Engine — Katch–McArdle
Inputs (onboarding): weight (kg), body fat (%), training-load tier.
- LBM = W × (1 − BF/100)
- BMR = 370 + 21.6 × LBM
- TDEE (Calories) = BMR × Activity Multiplier
- Protein target = W × 2.2 g
- Carb target tier-based: 50 / 100 / 150 / 200 g
- Fat target = (Calories − Protein×4 − Carbs×4) / 9

### Training Load Tiers
| Tier | Multiplier | Carb target |
|---|---|---|
| DESK LIFE | 1.2 | 50 g |
| BASELINE | 1.375 | 100 g |
| HEAVY LIFTING | 1.55 | 150 g |
| METCON / ATHLETE | 1.725 | 200 g |

## Views
1. **HUD** — Macro bars vs target, traffic-light carb status, burpee penalty, mini stats (LBM/BMR/TDEE).
2. **FUEL** — Pick from 50+ whole foods (animal-based focus), log grams, view today's log, wipe day.
3. **LEDGER** — Weekly carb-deficit bank with green Banked Surplus number and history.
4. **ARSENAL** — 10 peer-reviewed metabolic-protocol cards with citations.

## Carb Traffic-Light
- **Green OPTIMAL**: under target
- **Amber WARNING**: 0–20 g over
- **Red OVERFLOW**: 21+ g over → triggers Burpee Penalty = `ceil((excess × 4 kcal) / 1.4)`

## Siphon Alarm
When burpees > 50: split across 6 blocks at +0/+30/+60/+90/+120/+150 minutes.

## Persistence (AsyncStorage)
- `pf_profile_v1` — Profile + computed targets
- `pf_log_v1` — Daily food log entries
- `pf_bank_v1` — Banked carb surplus (g)
- `pf_bank_history_v1` — Bank deposit history

## Future / Smart Enhancement
- **Free-tier ceiling + Pro upsell**: 7-day bank history free; unlock 90-day trends, weekly metabolic
  reports, refeed planner, and CSV export at $4.99/mo via Stripe. Biohackers self-quantify
  obsessively — premium analytics is the natural revenue path.
