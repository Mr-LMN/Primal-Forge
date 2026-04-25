import { StyleSheet, Platform } from "react-native";
import { C } from "./data";

export const styles = StyleSheet.create({
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
});
