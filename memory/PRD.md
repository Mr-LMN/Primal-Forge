# PRIMALFORGE — Product Requirements Document

## Vision
A brutalist, dark-mode metabolic tracker for biohackers, carnivore, and animal-based dieters.
British-first. Goal-driven. Peer-reviewed protocols. Built to rival MyFitnessPal/Cronometer
with a sharper edge and zero plant-propaganda.

## Stack
- **Frontend**: Expo React Native (single-file app at `/app/frontend/app/index.tsx`)
- **Storage**: AsyncStorage (on-device persistence, v2 schema)
- **Backend**: None active (FastAPI scaffold reserved for future cloud sync / pro tier)

## Core Engine — Katch–McArdle (with goal adjustment)
- LBM = W × (1 − BF/100)
- BMR = 370 + 21.6 × LBM
- TDEE = BMR × Activity Multiplier
- **Goal-adjusted Calories** = TDEE × { Fat Loss 0.80 · Maintain 1.00 · Muscle 1.10 · Athlete 1.05 }
- **Protein g** = W × { Fat Loss 2.4 · Maintain 2.0 · Muscle 2.2 · Athlete 2.2 }
- **Carb target** = ActivityCarbs × { Fat Loss 0.7 · Maintain 1.0 · Muscle 1.2 }
- Fat g = (Calories − P×4 − C×4) / 9

## Onboarding (4-step wizard)
1. **Goal** — Fat Loss / Muscle Gain / Maintain / Athlete (LOCKED — Hyrox · CrossFit · Ironman tier coming soon)
2. **Vitals** — Sex (M/F), Weight (kg), Height (cm)
3. **Body Composition** — three modes:
   - **Manual** BF% input
   - **US Navy Tape Method** — neck + waist (+ hip for women), log10 formula, ±3% of DEXA
   - **Visual Estimate** — 5 sex-specific cards
4. **Activity Tier** + live target preview

### Activity Tiers
| Tier | Multiplier | Carb base |
|---|---|---|
| Desk Life | 1.2 | 50 g |
| Baseline | 1.375 | 100 g |
| Heavy Lifting | 1.55 | 150 g |
| Metcon / Athlete | 1.725 | 200 g |

## Views
1. **HUD** — macro bars vs target, traffic-light carb status, Burpee Penalty `ceil((excess×4)/1.4)`, Siphon Alarm modal (>50 burpees → 6 blocks every 30 min over 3 h), Hydration tracker (35 ml/kg target), mini stats (LBM/BMR/TDEE), weight trend card.
2. **FUEL** — recents quick-log chips, food picker over 70+ British whole-foods (Beef Mince 5/10/20%, Cumberland & Lincolnshire sausage, Back/Streaky Bacon, Black Pudding, Kippers, Smoked Mackerel, Mature Cheddar, Stilton, Wensleydale, Jacket Potato, Bramley Apple…), per-food unit chips (g / tsp / tbsp / piece — rasher / sausage / egg / knob / slice — meat stays gram-only), live macro preview, today's log, wipe day.
3. **LEDGER** — carb-deficit bank with green Banked Surplus, double-bank guard, history, reset.
4. **ARSENAL** — 12 peer-reviewed metabolic-protocol cards with citations.

## Persistence (AsyncStorage v2)
- `pf_profile_v2` — Profile (sex, weight, height, BF, BF mode, goal, tier, computed targets)
- `pf_log_v2` — Daily food log entries (incl. unit, amount, grams)
- `pf_bank_v2` / `pf_bank_history_v2` — Banked carb surplus
- `pf_water_v2` — Water by day-key (ml)
- `pf_weights_v2` — Weight history (sorted desc)
- `pf_recents_v2` — Last 6 logged food IDs

## Smart Business Hooks
- **Pro tier ($4.99/mo)** — 90-day trends, weekly metabolic reports, refeed planner, CSV export
- **Athlete tier upsell** — Hyrox / CrossFit / Ironman protocols + race-day fuelling calculators (educate athletes on glycogen, fat-adaptation, electrolytes — alternative to gel-dependence)

## Future Enhancements
- Apple Health / Google Fit step + sleep sync
- Photo-based BF estimator (vision model)
- Refeed-day planner using banked carbs
- Habit streak (consecutive days hitting protein target)
