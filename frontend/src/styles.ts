/**
 * PRIMALFORGE — GLOBAL STYLES
 *
 * Refactored Phase 2 (UI Polish):
 *   • makeStyles(C, isDark)  → palette-aware StyleSheet factory
 *   • useStyles()             → React hook (auto-binds to ThemeProvider)
 *   • radii / shadow / frostedGlass  → utility helpers used across screens
 *
 * Existing screens that still import the static `styles` keep working
 * (backed by the dark palette from `data.ts`). New / refreshed screens
 * should call `useStyles()` for live light/dark switching.
 */
import { StyleSheet, Platform, ViewStyle } from "react-native";
import { useMemo } from "react";
import { C as STATIC_C } from "./data";
import { useTheme, type Palette } from "./theme";

/* ─── Utility tokens ──────────────────────────────────────────────────── */
export const radii = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 14,        // standardised card radius (Phase 2)
  xl: 16,
  xxl: 22,
  pill: 999,
} as const;

/** Premium iOS/Android shadow stack. `level` = 1 (subtle) … 4 (lifted FAB). */
export function shadow(isDark: boolean, level: 1 | 2 | 3 | 4 = 2): ViewStyle {
  const opacity = isDark ? 0.45 : 0.12;
  switch (level) {
    case 1:
      return {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: opacity * 0.6,
        shadowRadius: 3,
        elevation: 2,
      };
    case 2:
      return {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: opacity * 0.8,
        shadowRadius: 8,
        elevation: 4,
      };
    case 3:
      return {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: opacity,
        shadowRadius: 14,
        elevation: 8,
      };
    case 4:
      return {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: opacity * 1.1,
        shadowRadius: 22,
        elevation: 14,
      };
  }
}

/** Frosted-glass background (use BlurView on iOS, semi-transparent fill elsewhere). */
export function frostedGlass(C: Palette, isDark: boolean, alpha = 0.55): ViewStyle {
  // Hex helper: take card color and slap an alpha — works across platforms.
  const hex = C.card.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return {
    backgroundColor: `rgba(${r},${g},${b},${alpha})`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    borderRadius: radii.lg,
  };
}

/* ─── useStyles() hook ───────────────────────────────────────────────── */
/**
 * React hook returning a memoised StyleSheet bound to the active palette.
 * Use inside any screen / component that should respect light/dark theme.
 */
export function useStyles() {
  const { C, isDark } = useTheme();
  return useMemo(() => makeStyles(C, isDark), [C, isDark]);
}

/* ─── Factory ─────────────────────────────────────────────────────────── */
export function makeStyles(C: Palette, isDark: boolean) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  shell: {
    flex: 1, width: "100%",
    maxWidth: Platform.OS === "web" ? 480 : undefined,
    alignSelf: "center", backgroundColor: C.bg,
  },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.border,
  },
  brand: { fontSize: 22, fontWeight: "900", color: C.text, letterSpacing: 4 },
  brandSmall: { color: C.text, letterSpacing: 6, fontWeight: "900" },
  brandSub: { color: C.textDim, fontSize: 11, letterSpacing: 2, marginTop: 2, fontWeight: "700" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center", backgroundColor: C.card,
  },
  streakChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    marginRight: 8,
  },
  streakChipText: { color: C.fire, fontSize: 12, fontWeight: "900" },
  xpChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(245,180,0,0.1)", borderWidth: 1, borderColor: C.gold,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    marginRight: 8,
  },
  xpChipText: { color: C.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1 },

  /* XP Toast */
  xpToast: {
    position: "absolute", top: 70, alignSelf: "center", zIndex: 9999,
    backgroundColor: C.gold, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 6,
    shadowColor: C.gold, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  xpToastText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 13 },

  /* Onboarding */
  onboardScroll: { padding: 20, paddingBottom: 60 },
  onboardHero: { marginTop: 12, marginBottom: 28 },
  onboardKicker: { color: C.science, letterSpacing: 6, fontWeight: "900", fontSize: 11, marginBottom: 8 },
  progressTrack: { height: 3, backgroundColor: C.border, borderRadius: 2, marginTop: 14, overflow: "hidden" },
  progressFill: { height: 3, backgroundColor: C.text },
  stepTitle: { color: C.text, fontSize: 22, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  stepSub: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 20, maxWidth: 340 },

  goalCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 18, borderRadius: 12, marginBottom: 10,
  },
  goalCardActive: { borderColor: C.optimal, backgroundColor: C.cardHi },
  goalCardLocked: { opacity: 0.55 },
  goalLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 14 },
  goalSub: { color: C.textMute, fontSize: 12, marginTop: 6, lineHeight: 17 },
  lockTag: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  lockText: { color: C.science, fontSize: 9, fontWeight: "900", letterSpacing: 2 },

  segRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  segBtn: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 14, borderRadius: 10, alignItems: "center",
  },
  segBtnActive: { backgroundColor: C.text, borderColor: C.text },
  segText: { color: C.textDim, letterSpacing: 2, fontWeight: "900", fontSize: 12 },

  modeRow: { flexDirection: "row", gap: 6, marginBottom: 16 },
  modeBtn: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 12, borderRadius: 8, alignItems: "center",
  },
  modeBtnActive: { backgroundColor: C.text, borderColor: C.text },
  modeText: { color: C.textDim, letterSpacing: 1, fontWeight: "900", fontSize: 11 },
  warnBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(245,158,11,0.08)", borderColor: C.warning, borderWidth: 1,
    borderRadius: 8, padding: 12, marginBottom: 12,
  },
  warnText: { color: C.warning, fontSize: 12, fontWeight: "700" },
  computedBox: {
    backgroundColor: "rgba(34,197,94,0.08)", borderWidth: 1, borderColor: C.optimal,
    borderRadius: 10, padding: 14, marginTop: 4,
  },
  computedLabel: { color: C.optimal, letterSpacing: 3, fontSize: 10, fontWeight: "900" },
  computedValue: { color: C.optimal, fontSize: 30, fontWeight: "900", marginTop: 4 },

  visualCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 16, borderRadius: 10, marginBottom: 8,
  },
  visualCardActive: { borderColor: C.text, backgroundColor: C.cardHi },
  visualLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 13 },
  visualSub: { color: C.textMute, fontSize: 12, marginTop: 4 },
  visualBf: { color: C.text, fontSize: 18, fontWeight: "900" },

  onboardField: { marginBottom: 18 },
  label: { color: C.textDim, letterSpacing: 3, fontSize: 10, fontWeight: "800", marginBottom: 8 },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    color: C.text, fontSize: 22, fontWeight: "700",
    paddingHorizontal: 16, paddingVertical: 16, borderRadius: 10,
  },
  hint: { color: C.textMute, fontSize: 11, marginTop: 6, letterSpacing: 1 },
  tierBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 16, borderRadius: 10, marginBottom: 8,
  },
  tierBtnActive: { borderColor: C.text, backgroundColor: C.cardHi },
  tierLabel: { color: C.textDim, fontWeight: "900", letterSpacing: 2, fontSize: 13 },
  tierSub: { color: C.textMute, fontSize: 12, marginTop: 4 },
  tierMeta: { alignItems: "flex-end" },
  tierMetaTop: { color: C.text, fontWeight: "900", fontSize: 14 },
  tierMetaBot: { color: C.textDim, fontSize: 11, fontWeight: "700", marginTop: 2 },

  previewCard: {
    backgroundColor: C.cardHi, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 14, padding: 18, marginTop: 8,
  },
  previewKicker: { color: C.science, letterSpacing: 4, fontSize: 10, fontWeight: "900", marginBottom: 12 },
  previewRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  previewStat: {
    flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, padding: 10, alignItems: "center",
  },
  previewStatLabel: { color: C.textMute, fontSize: 9, letterSpacing: 2, fontWeight: "800" },
  previewStatValue: { color: C.text, fontSize: 14, fontWeight: "900", marginTop: 2 },
  previewBig: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, alignItems: "center",
  },
  previewBigLabel: { color: C.textDim, letterSpacing: 3, fontSize: 10, fontWeight: "900" },
  previewBigValue: { color: C.text, fontSize: 38, fontWeight: "900", marginTop: 4 },
  previewMacros: { flexDirection: "row", gap: 8, marginTop: 12 },
  previewMacro: {
    flex: 1, borderWidth: 1.5, borderRadius: 8,
    paddingVertical: 10, alignItems: "center",
  },
  previewMacroLabel: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  previewMacroValue: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 2 },

  navRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  primaryBtn: {
    backgroundColor: C.text, paddingVertical: 18, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  primaryBtnDisabled: { backgroundColor: C.border },
  primaryBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 13 },
  secondaryBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingVertical: 18, paddingHorizontal: 18, borderRadius: 10,
  },
  secondaryBtnText: { color: C.text, fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  onboardFooter: {
    color: C.textMute, fontSize: 10, textAlign: "center",
    marginTop: 24, letterSpacing: 1, lineHeight: 16,
  },

  /* Sections */
  scrollPad: { padding: 20, paddingBottom: 100 },
  sectionKicker: { color: C.textDim, letterSpacing: 4, fontSize: 11, fontWeight: "900", marginBottom: 14 },
  subKicker: { color: C.textMute, letterSpacing: 3, fontSize: 10, fontWeight: "900", marginBottom: 10 },

  /* Today's Intel card */
  intelCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.science,
    borderRadius: 14, padding: 18, marginBottom: 16,
    overflow: "hidden",
  },
  intelCardRead: { opacity: 0.7, borderColor: C.border },
  intelHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  intelKicker: { color: C.science, letterSpacing: 3, fontSize: 10, fontWeight: "900", flex: 1 },
  intelXpBadge: {
    backgroundColor: "rgba(245,180,0,0.15)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
    flexDirection: "row", alignItems: "center", gap: 3,
  },
  intelXpBadgeText: { color: C.gold, fontWeight: "900", fontSize: 10, letterSpacing: 1 },
  intelTag: {
    color: C.science, fontSize: 10, fontWeight: "900", letterSpacing: 3,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
    alignSelf: "flex-start", marginBottom: 8,
  },
  intelTitle: { color: C.text, fontSize: 19, fontWeight: "900", marginBottom: 8, lineHeight: 25 },
  intelTease: { color: C.textDim, fontSize: 13, lineHeight: 19 },
  intelTapHint: {
    color: C.science, fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 12,
  },

  /* Macros */
  macroGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  macroCard: {
    width: "48%", backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 14,
  },
  macroLabel: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "800", marginBottom: 8 },
  macroValueRow: { flexDirection: "row", alignItems: "baseline" },
  macroValue: { color: C.text, fontSize: 24, fontWeight: "900" },
  macroTarget: { color: C.textMute, fontSize: 11, fontWeight: "700" },
  barTrack: { height: 4, backgroundColor: C.border, borderRadius: 2, marginTop: 10, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },

  statusCard: { borderWidth: 1.5, borderRadius: 12, padding: 16, backgroundColor: C.card, marginBottom: 14 },
  statusHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusTag: { fontSize: 11, fontWeight: "900", letterSpacing: 3 },
  statusDetail: { color: C.text, fontSize: 14, lineHeight: 20 },

  penaltyCard: {
    backgroundColor: "#1a0808", borderWidth: 1.5, borderColor: C.penalty,
    borderRadius: 12, padding: 18, marginBottom: 14,
  },
  penaltyTag: { color: C.penalty, fontSize: 11, letterSpacing: 3, fontWeight: "900", marginBottom: 8 },
  penaltyValue: { color: C.text, fontSize: 24, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  penaltyFormula: { color: C.textDim, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  siphonBtn: {
    backgroundColor: C.penalty, paddingVertical: 14, borderRadius: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  siphonBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 16, padding: 22,
  },
  modalScrollCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 16, padding: 22, maxHeight: "85%",
  },
  modalTitle: { color: C.penalty, letterSpacing: 4, fontWeight: "900", fontSize: 14 },
  modalTitleLight: { color: C.text, letterSpacing: 4, fontWeight: "900", fontSize: 14 },
  modalSub: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 18 },
  block: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.bg2,
    borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, marginBottom: 8,
  },
  blockIdx: { color: C.penalty, fontWeight: "900", fontSize: 18, width: 40 },
  blockTime: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "700" },
  blockReps: { color: C.text, fontWeight: "900", fontSize: 16, marginTop: 2 },

  /* Water */
  waterCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginBottom: 14,
  },
  waterHeader: { flexDirection: "row", alignItems: "center" },
  waterLabel: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  waterValue: { color: C.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  waterTarget: { color: C.textMute, fontSize: 13, fontWeight: "700" },
  waterBtnRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  waterBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    paddingVertical: 12, borderRadius: 8,
  },
  waterBtnPrimary: { backgroundColor: C.science, borderColor: C.science },
  waterBtnText: { color: C.text, fontWeight: "900", fontSize: 12, letterSpacing: 1 },

  miniStats: { flexDirection: "row", gap: 10, marginTop: 4 },
  miniStatBox: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12, alignItems: "center",
  },
  miniStatLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  miniStatValue: { color: C.text, fontSize: 16, fontWeight: "900", marginTop: 4 },

  weightTrendCard: {
    flexDirection: "row", backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginTop: 14, gap: 12,
  },
  weightTrendLabel: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  weightTrendValue: { color: C.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  weightTrendDelta: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  weightTrendDate: { color: C.textMute, fontSize: 11, marginTop: 2 },

  /* Recents */
  recentChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
    maxWidth: 200,
  },
  recentChipText: { color: C.text, fontWeight: "700", fontSize: 12 },

  /* Fuel */
  foodPickerBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 16, marginBottom: 16,
  },
  foodPickerLabel: { color: C.textDim, fontSize: 10, letterSpacing: 3, fontWeight: "800" },
  foodPickerValue: { color: C.text, fontSize: 16, fontWeight: "700", marginTop: 6 },
  foodPickerMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },

  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  unitChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
  },
  unitChipActive: { backgroundColor: C.text, borderColor: C.text },
  unitChipText: { color: C.textDim, fontWeight: "900", fontSize: 11, letterSpacing: 1 },
  previewInline: { color: C.science, fontSize: 12, marginTop: 8, fontWeight: "700" },

  todayLogHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 24, marginBottom: 10,
  },
  wipeText: { color: C.penalty, fontSize: 11, letterSpacing: 2, fontWeight: "900" },
  emptyBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderStyle: "dashed", borderRadius: 10, padding: 24, alignItems: "center",
  },
  emptyText: { color: C.textMute, fontSize: 13, textAlign: "center", lineHeight: 19 },

  logCard: {
    flexDirection: "row", backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  logName: { color: C.text, fontWeight: "700", fontSize: 14 },
  logMeta: { color: C.textMute, fontSize: 11, marginTop: 4 },
  logMacros: { alignItems: "flex-end" },
  logKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  logBreak: { color: C.textDim, fontSize: 11, marginTop: 4 },

  pickerHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: C.border,
  },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, marginHorizontal: 16, marginTop: 12, gap: 10,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 14 },
  foodRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 8,
  },
  foodRowName: { color: C.text, fontWeight: "700", fontSize: 14 },
  foodRowCat: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "800", marginTop: 4 },
  foodRowMeta: { alignItems: "flex-end" },
  foodRowKcal: { color: C.text, fontWeight: "900", fontSize: 14 },
  foodRowMacros: { color: C.textDim, fontSize: 11, marginTop: 4 },

  /* FORGE */
  forgeCount: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.cardHi, borderWidth: 1, borderColor: C.borderHi,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 14,
  },
  forgeCountText: { color: C.text, fontWeight: "900", fontSize: 12, letterSpacing: 1 },
  forgeCountSub: { color: C.textDim, fontSize: 11 },
  clearBtnText: { color: C.science, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  equipmentSection: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 14,
  },
  equipmentHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10,
  },
  equipmentTitle: { color: C.text, fontWeight: "900", fontSize: 12, letterSpacing: 2 },
  equipmentCount: { color: C.science, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  equipmentChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999,
  },
  equipmentChipActive: { backgroundColor: C.science, borderColor: C.science },
  equipmentChipText: { color: C.textDim, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  equipmentSummary: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  equipmentTag: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: C.bg2, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4,
  },
  equipmentTagText: { color: C.textDim, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  workoutCardLocked: { opacity: 0.45 },
  altBox: {
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, padding: 10, marginTop: 8, marginLeft: 38,
  },
  altKicker: { color: C.optimal, fontSize: 9, fontWeight: "900", letterSpacing: 2, marginBottom: 6 },
  altRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, borderBottomWidth: 1, borderColor: C.border,
  },
  altName: { color: C.text, fontSize: 12, flex: 1 },
  altVideoBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: C.card,
  },
  altVideoText: { color: C.textDim, fontSize: 10, fontWeight: "900" },
  sourceBadge: {
    backgroundColor: "rgba(245,180,0,0.1)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  sourceBadgeText: { color: C.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  filterChip: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
  },
  filterChipActive: { backgroundColor: C.text, borderColor: C.text },
  filterChipText: { color: C.textDim, fontWeight: "900", fontSize: 10, letterSpacing: 1.5 },
  workoutCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 18, marginBottom: 12,
  },
  workoutHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  focusBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  focusBadgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  timeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.bg2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  timeBadgeText: { color: C.textDim, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  workoutTitle: { color: C.text, fontSize: 18, fontWeight: "900", letterSpacing: 0.5, marginBottom: 6 },
  workoutDesc: { color: C.textDim, fontSize: 12, lineHeight: 18 },
  workoutCardFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: C.border,
  },
  workoutExCount: { color: C.textMute, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  workoutOpenText: { color: C.text, fontSize: 11, fontWeight: "900", letterSpacing: 2 },

  /* Workout detail */
  detailScroll: { padding: 20, paddingBottom: 100 },
  detailHeader: { marginBottom: 16 },
  detailTitle: { color: C.text, fontSize: 26, fontWeight: "900", letterSpacing: 0.5, marginTop: 8 },
  detailDesc: { color: C.textDim, fontSize: 14, lineHeight: 21, marginTop: 10 },
  scienceBox: {
    backgroundColor: "rgba(14,165,233,0.06)", borderWidth: 1, borderColor: C.science,
    borderRadius: 12, padding: 16, marginVertical: 16,
  },
  scienceKicker: { color: C.science, letterSpacing: 3, fontSize: 10, fontWeight: "900", marginBottom: 8 },
  scienceBody: { color: C.text, fontSize: 13, lineHeight: 20 },
  scienceCitation: { color: C.science, fontSize: 11, fontWeight: "700", marginTop: 10 },

  exerciseCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  exerciseHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  exerciseIdx: { color: C.gold, fontSize: 14, fontWeight: "900", letterSpacing: 2, width: 28 },
  exerciseName: { color: C.text, fontSize: 15, fontWeight: "900", flex: 1 },
  exerciseSets: { color: C.science, fontSize: 12, fontWeight: "700", marginTop: 6, marginLeft: 38 },
  exerciseCue: { color: C.textDim, fontSize: 12, lineHeight: 18, marginTop: 6, marginLeft: 38, fontStyle: "italic" },
  videoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, marginLeft: 38,
    backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, alignSelf: "flex-start",
  },
  videoBtnText: { color: C.text, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  logWorkoutBtn: {
    backgroundColor: C.gold, paddingVertical: 18, borderRadius: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 14,
  },
  logWorkoutBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 3, fontSize: 13 },

  /* Ledger / carb bank (in VAULT) */
  bankCard: {
    backgroundColor: "#06180c", borderWidth: 1.5, borderColor: C.optimal,
    borderRadius: 14, padding: 22, marginBottom: 16,
  },
  bankLabel: { color: C.optimal, letterSpacing: 4, fontSize: 11, fontWeight: "900", marginBottom: 8 },
  bankValue: { color: C.optimal, fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  bankSub: { color: C.textDim, fontSize: 12, marginTop: 8, lineHeight: 18 },
  todayDeficitCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, gap: 14,
  },
  deficitValue: { fontSize: 28, fontWeight: "900", marginTop: 4 },
  bankBtn: {
    backgroundColor: C.optimal, paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 10, alignItems: "center",
  },
  bankBtnDisabled: { backgroundColor: C.border },
  bankBtnText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  historyRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 14, marginBottom: 6,
  },
  historyDate: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  historyDeficit: { color: C.optimal, fontWeight: "900", fontSize: 16 },

  /* VAULT */
  vaultHero: {
    backgroundColor: "rgba(245,180,0,0.06)", borderWidth: 1.5, borderColor: C.gold,
    borderRadius: 16, padding: 22, marginBottom: 16, alignItems: "center",
  },
  vaultLabel: { color: C.gold, letterSpacing: 4, fontSize: 10, fontWeight: "900" },
  vaultXp: { color: C.gold, fontSize: 56, fontWeight: "900", marginTop: 4, letterSpacing: -2 },
  vaultXpSub: { color: C.textDim, fontSize: 12, marginTop: 4 },
  vaultSplit: { flexDirection: "row", gap: 10, marginBottom: 16 },
  vaultStat: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, alignItems: "center",
  },
  vaultStatLabel: { color: C.textDim, fontSize: 10, letterSpacing: 2, fontWeight: "900" },
  vaultStatValue: { color: C.text, fontSize: 24, fontWeight: "900", marginTop: 6 },
  todayEarn: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginBottom: 16,
  },
  earnRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderColor: C.bg2,
  },
  earnLabel: { color: C.text, fontSize: 13, fontWeight: "700" },
  earnXp: { color: C.gold, fontWeight: "900", fontSize: 13 },
  earnXpDim: { color: C.textMute, fontWeight: "900", fontSize: 13 },

  perkCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  perkCardLocked: { opacity: 0.55 },
  perkHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  perkPartner: { color: C.textMute, fontSize: 10, letterSpacing: 2, fontWeight: "900" },
  perkCost: {
    backgroundColor: "rgba(245,180,0,0.15)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
    flexDirection: "row", gap: 4, alignItems: "center",
  },
  perkCostText: { color: C.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  perkTitle: { color: C.text, fontSize: 14, fontWeight: "900", letterSpacing: 0.5, marginBottom: 4 },
  perkDesc: { color: C.textDim, fontSize: 12, lineHeight: 18 },
  perkRedeem: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: C.gold, paddingVertical: 10, borderRadius: 6, marginTop: 10,
  },
  perkRedeemDisabled: { backgroundColor: C.border },
  perkRedeemText: { color: C.bg, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  perkRedeemTextDisabled: { color: C.textMute, fontSize: 11, fontWeight: "900", letterSpacing: 2 },

  archiveCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  archiveHead: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  archiveIdx: { color: C.textMute, fontWeight: "900", fontSize: 12, letterSpacing: 2, marginRight: 10 },
  archiveTag: {
    color: C.science, fontSize: 9, fontWeight: "900", letterSpacing: 2,
    backgroundColor: "rgba(14,165,233,0.1)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  archiveTitle: { color: C.text, fontWeight: "900", fontSize: 15, marginBottom: 6 },
  archiveBody: { color: C.textDim, fontSize: 12, lineHeight: 18 },
  archiveCitation: { color: C.science, fontSize: 10, fontWeight: "700", marginTop: 8 },

  /* SCAN — Phase C */
  scanInputBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    color: C.text, fontSize: 13, lineHeight: 19,
    padding: 14, borderRadius: 10, minHeight: 120, textAlignVertical: "top",
  },
  scanActionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  scanSampleBtn: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingVertical: 10, alignItems: "center",
  },
  scanSampleText: { color: C.textDim, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  scanCircle: {
    alignSelf: "center", width: 140, height: 140, borderRadius: 70,
    borderWidth: 6, alignItems: "center", justifyContent: "center", marginVertical: 16,
  },
  scanCircleScore: { fontSize: 44, fontWeight: "900", letterSpacing: -2 },
  scanCircleSub: { fontSize: 10, fontWeight: "900", letterSpacing: 3, marginTop: 2 },
  scanTallyRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  scanTallyBox: {
    flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, alignItems: "center",
  },
  scanTallyN: { fontSize: 22, fontWeight: "900" },
  scanTallyLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 2, marginTop: 2 },
  scanIngCard: {
    backgroundColor: C.card, borderLeftWidth: 4, borderRadius: 8,
    padding: 12, marginBottom: 8,
  },
  scanIngHead: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 8 },
  scanIngName: { color: C.text, fontWeight: "900", fontSize: 13, flex: 1 },
  scanIngCat: {
    fontSize: 9, fontWeight: "900", letterSpacing: 2,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  scanIngBody: { color: C.textDim, fontSize: 12, lineHeight: 17, marginTop: 4 },
  scanIngCitation: { color: C.science, fontSize: 10, fontWeight: "700", marginTop: 6 },
  scanSwapsLabel: { color: C.optimal, fontSize: 9, fontWeight: "900", letterSpacing: 2, marginTop: 8 },
  scanSwapsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  scanSwapChip: {
    backgroundColor: "rgba(34,197,94,0.08)", borderWidth: 1, borderColor: C.optimal,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4,
  },
  scanSwapText: { color: C.optimal, fontSize: 10, fontWeight: "700" },
  scanUnknownBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, padding: 10, marginTop: 8,
  },
  scanUnknownText: { color: C.textMute, fontSize: 11, lineHeight: 16 },
  scanSaveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.gold, paddingVertical: 14, borderRadius: 10, marginTop: 14,
  },
  scanSaveText: { color: C.bg, fontWeight: "900", letterSpacing: 2, fontSize: 12 },
  scanHistoryCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, padding: 12, marginBottom: 8, gap: 12,
  },
  scanHistDot: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  scanHistDotText: { fontWeight: "900", fontSize: 13 },
  scanHistName: { color: C.text, fontWeight: "700", fontSize: 13 },
  scanHistDate: { color: C.textMute, fontSize: 10, marginTop: 2 },
  /* SCAN placeholder */
  scanHero: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 28, alignItems: "center", marginTop: 20,
  },
  scanIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(14,165,233,0.1)",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  scanTitle: { color: C.text, fontSize: 20, fontWeight: "900", letterSpacing: 1, marginBottom: 8 },
  scanSub: { color: C.textDim, fontSize: 13, lineHeight: 20, textAlign: "center" },
  scanBullets: { marginTop: 18, alignSelf: "stretch" },
  scanBullet: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  scanBulletText: { color: C.text, fontSize: 13, flex: 1 },

  /* Weight modal extras */
  weightModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  weightRowDate: { color: C.textDim, fontSize: 11, fontWeight: "700", width: 78 },
  weightRowBarTrack: { flex: 1, height: 6, backgroundColor: C.bg2, borderRadius: 3, overflow: "hidden" },
  weightRowBarFill: { height: 6, backgroundColor: C.science, borderRadius: 3 },
  weightRowValue: { color: C.text, fontSize: 12, fontWeight: "900", width: 56, textAlign: "right" },

  /* Tab Bar */
  tabBar: {
    flexDirection: "row", borderTopWidth: 1, borderColor: C.border,
    backgroundColor: C.bg2,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, paddingBottom: 14, position: "relative" },
  tabLabel: { color: C.textMute, fontSize: 9, letterSpacing: 1.5, fontWeight: "900", marginTop: 4 },
  tabIndicator: { position: "absolute", top: 0, width: 28, height: 2, backgroundColor: C.text },

  /* ---------- FUEL · MODE TOGGLE (FOODS | RECIPES) ---------- */
  modeToggleRow: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 7,
  },
  modeToggleBtnActive: {
    backgroundColor: C.text,
  },
  modeToggleText: {
    color: C.textDim,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "900",
  },
  modeToggleTextActive: {
    color: C.bg,
  },

  /* ---------- RECIPES ---------- */
  recipeFilterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  recipeCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  recipeHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  recipeMealBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(245,180,0,0.12)",
    borderWidth: 1,
    borderColor: C.gold,
  },
  recipeMealBadgeText: {
    color: C.gold,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  recipeTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  recipeTimeBadgeText: {
    color: C.textDim,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  recipeName: {
    color: C.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipeDesc: {
    color: C.textDim,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  recipeMacroRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  recipeMacroChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  recipeMacroChipKcal: {
    borderColor: C.text,
    backgroundColor: "rgba(245,245,245,0.05)",
  },
  recipeMacroChipP: {
    borderColor: C.science,
  },
  recipeMacroChipF: {
    borderColor: C.warning,
  },
  recipeMacroChipC: {
    borderColor: C.optimal,
  },
  recipeMacroValue: {
    color: C.text,
    fontSize: 12,
    fontWeight: "900",
  },
  recipeMacroLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  recipeTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 10,
  },
  recipeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: C.bg2,
    borderRadius: 3,
  },
  recipeTagText: {
    color: C.textMute,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: "700",
  },
  recipeBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  recipeOpenBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.border,
  },
  recipeOpenText: {
    color: C.text,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  recipeLogBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 7,
    backgroundColor: C.gold,
  },
  recipeLogText: {
    color: C.bg,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "900",
  },

  /* ---------- RECIPE DETAIL ---------- */
  recipeDetailHero: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  recipeDetailTitle: {
    color: C.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  recipeDetailDesc: {
    color: C.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  recipeDetailMacroBlock: {
    flexDirection: "row",
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 12,
    gap: 10,
  },
  recipeDetailMacroCol: {
    flex: 1,
    alignItems: "center",
  },
  recipeDetailMacroN: {
    color: C.text,
    fontSize: 18,
    fontWeight: "900",
  },
  recipeDetailMacroL: {
    color: C.textDim,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
    marginTop: 2,
  },
  recipeIngList: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recipeIngRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  recipeIngQty: {
    color: C.gold,
    fontSize: 12,
    fontWeight: "900",
    minWidth: 90,
  },
  recipeIngItem: {
    color: C.text,
    fontSize: 13,
    flex: 1,
  },
  recipeStepRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  recipeStepIdx: {
    color: C.gold,
    fontSize: 14,
    fontWeight: "900",
    minWidth: 24,
  },
  recipeStepText: {
    color: C.text,
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
  recipeWhyBox: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "rgba(14,165,233,0.08)",
    borderWidth: 1,
    borderColor: C.science,
    borderRadius: 10,
    padding: 14,
  },
  recipeLogBig: {
    marginHorizontal: 20,
    marginVertical: 18,
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recipeLogBigText: {
    color: C.bg,
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: "900",
  },
  recipeEmpty: {
    paddingVertical: 30,
    alignItems: "center",
  },

  /* ---------- RECIPE SORT / FAVES / FIT ---------- */
  recipeSortRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  recipeSortBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },
  recipeSortBtnActive: {
    backgroundColor: C.text,
    borderColor: C.text,
  },
  recipeSortText: {
    color: C.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  recipeFavBtn: {
    marginLeft: "auto",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  fitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  fitBadgeText: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  fitHeaderBox: {
    backgroundColor: "rgba(14,165,233,0.06)",
    borderWidth: 1,
    borderColor: C.science,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  fitRemainRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 6,
  },
  fitRemainKcal: {
    color: C.text,
    fontSize: 18,
    fontWeight: "900",
  },
  fitRemainMacro: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  fitRemainHint: {
    color: C.textDim,
    fontSize: 11,
    lineHeight: 15,
  },

  /* OCR — camera capture for ScanView */
  ocrBtnRow: { flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 4 },
  ocrPanel: {
    marginTop: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 10,
  },
  ocrPreview: {
    width: "100%",
    height: 160,
    borderRadius: 6,
    backgroundColor: C.bg2,
  },
  ocrStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  ocrStatusText: {
    color: C.textDim,
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },

  /* FUEL — fit explainer & auto-planner & custom recipes */
  fitExplainer: {
    color: C.textDim,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
    marginBottom: 2,
    fontStyle: "italic",
  },
  planBtnRow: { flexDirection: "row", gap: 8, marginBottom: 12, marginTop: 2 },
  planBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingVertical: 12,
  },
  planBtnText: { color: C.text, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  planSummary: {
    backgroundColor: "rgba(34,197,94,0.06)",
    borderWidth: 1,
    borderColor: C.optimal,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  planSummaryRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginTop: 4,
    flexWrap: "wrap",
  },
  planSummaryKcal: { color: C.text, fontSize: 18, fontWeight: "900" },
  planSummaryMacro: { fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  planMealCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  planMealHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  planMealSlot: {
    color: C.science,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },
  planMealName: { color: C.text, fontSize: 13, fontWeight: "700", flex: 1 },
  planMealMacro: { color: C.textDim, fontSize: 11 },
  planEmpty: {
    color: C.textDim,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 15,
  },
  scaleRow: {
    flexDirection: "row",
    gap: 6,
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  scaleChip: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  scaleChipActive: { backgroundColor: C.text, borderColor: C.text },
  scaleChipText: { color: C.textDim, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  scaleChipTextActive: { color: C.bg },
  customBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.gold,
    backgroundColor: "rgba(245,180,0,0.08)",
  },
  customBadgeText: {
    color: C.gold,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  customDeleteBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recipeFormField: { marginBottom: 12 },
  recipeFormLabel: {
    color: C.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
    marginBottom: 6,
  },
  recipeFormMacroRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  recipeFormMacroCol: { flex: 1 },
  mealPickRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  /* ─── Phase 2 utility classes ─────────────────────────────── */
  /** Standardised premium card. Use as a base then layer specifics. */
  cardBase: {
    backgroundColor: C.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow(isDark, 1),
  },
  cardElevated: {
    backgroundColor: C.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.borderHi,
    borderRadius: radii.lg,
    padding: 18,
    ...shadow(isDark, 2),
  },
  /** Translucent overlay surface (drop a BlurView behind for true frosted). */
  frosted: {
    ...frostedGlass(C, isDark, 0.6),
    padding: 16,
  },
});
}

/* ─── Static fallback (legacy import) ─────────────────────────────────── */
/**
 * Backwards-compatible static export. Bound to the original dark palette.
 * Components that haven't been migrated to `useStyles()` continue to render
 * unchanged. New work should prefer `useStyles()`.
 */
export const styles = makeStyles(STATIC_C as Palette, true);

