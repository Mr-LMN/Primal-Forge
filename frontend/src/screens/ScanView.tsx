import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  INGREDIENTS,
  SCAN_SAMPLES,
  scanLabel,
  todayKey,
  type ScanResult,
  type RiskLevel,
} from "../data";
import { useStyles, radii, shadow } from "../styles";
import { useTheme, type Palette } from "../theme";
import { haptic, confirmAction } from "../utils";
import type { ScanHistEntry } from "../types";

/* ── types ───────────────────────────────────────────────── */
type OcrState =
  | { kind: "idle" }
  | { kind: "preview"; uri: string }
  | { kind: "running"; uri: string; progress: number }
  | { kind: "done"; uri: string }
  | { kind: "error"; uri?: string; message: string };

type BarcodeState =
  | { kind: "idle" }
  | { kind: "scanning" }
  | { kind: "fetching"; barcode: string }
  | { kind: "found"; barcode: string; name: string }
  | { kind: "notfound"; barcode: string }
  | { kind: "error"; message: string };

/* ── helpers ─────────────────────────────────────────────── */
const verdictColor = (C: Palette, lvl: RiskLevel) =>
  lvl === "green" ? C.optimal : lvl === "amber" ? C.warning : C.penalty;

const levelColor = (C: Palette, lvl: RiskLevel) =>
  lvl === "red" ? C.penalty : lvl === "amber" ? C.warning : C.optimal;

/* ── component ───────────────────────────────────────────── */
export function ScanView({
  history,
  onSave,
  onClear,
}: {
  history: ScanHistEntry[];
  onSave: (e: ScanHistEntry) => void;
  onClear: () => void;
}) {
  const { C, isDark } = useTheme();
  const styles = useStyles();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);
  const [input, setInput] = useState("");
  const [productLabel, setProductLabel] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [ocr, setOcr] = useState<OcrState>({ kind: "idle" });
  const [barcode, setBarcode] = useState<BarcodeState>({ kind: "idle" });
  const scannedLock = useRef(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  /* ── scan logic ─────────────────────────────────────────── */
  const runScan = () => {
    if (input.trim().length < 5) return;
    haptic("medium");
    const r = scanLabel(input);
    setResult(r);
    setShowSavePrompt(false);
    setProductLabel("");
  };

  const loadSample = (sample: (typeof SCAN_SAMPLES)[0]) => {
    haptic("light");
    setInput(sample.ingredients);
    setProductLabel(sample.label);
    setResult(null);
    setShowSavePrompt(false);
  };

  const clearScan = () => {
    haptic();
    setInput("");
    setResult(null);
    setProductLabel("");
    setShowSavePrompt(false);
    setOcr({ kind: "idle" });
    setBarcode({ kind: "idle" });
    scannedLock.current = false;
  };

  /* ── barcode scanner ─────────────────────────────────────── */
  const openBarcodeScanner = async () => {
    haptic();
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        setBarcode({ kind: "error", message: "Camera permission denied." });
        return;
      }
    }
    scannedLock.current = false;
    setBarcode({ kind: "scanning" });
  };

  const closeBarcodeScanner = () => {
    scannedLock.current = false;
    setBarcode({ kind: "idle" });
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scannedLock.current) return;
    scannedLock.current = true;
    haptic("success");
    setBarcode({ kind: "fetching", barcode: data });

    try {
      const resp = await fetch(
        `https://world.openbeautyfacts.org/api/v0/product/${data}.json`
      );
      const json = await resp.json();

      if (json.status === 0 || !json.product) {
        setBarcode({ kind: "notfound", barcode: data });
        return;
      }

      const p = json.product;
      const name: string = p.product_name || p.brands || "Unknown product";
      const ings: string = p.ingredients_text || "";

      setBarcode({ kind: "found", barcode: data, name });

      if (ings.trim().length > 5) {
        setInput(ings);
        setProductLabel(name);
        setResult(null);
        setShowSavePrompt(false);
        // auto-run scan
        const r = scanLabel(ings);
        setResult(r);
      } else {
        setBarcode({ kind: "notfound", barcode: data });
        setProductLabel(name);
      }
    } catch {
      setBarcode({ kind: "error", message: "Network error. Check connection." });
    }
  };

  /* ── OCR ─────────────────────────────────────────────────── */
  const runOcr = async (uri: string) => {
    if (Platform.OS !== "web") {
      setOcr({ kind: "error", uri, message: "OCR runs on web. Type ingredients from the photo below." });
      return;
    }
    setOcr({ kind: "running", uri, progress: 0 });
    try {
      const mod: any = await import("tesseract.js");
      const Tesseract = mod.default ?? mod;
      const out = await Tesseract.recognize(uri, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcr((cur) =>
              cur.kind === "running" ? { ...cur, progress: m.progress } : cur
            );
          }
        },
      });
      const cleaned = (out.data?.text ?? "")
        .replace(/[\r\n]+/g, ", ")
        .replace(/\s{2,}/g, " ")
        .replace(/,\s*,/g, ",")
        .trim();
      if (cleaned.length < 4) {
        setOcr({ kind: "error", uri, message: "Couldn't read text. Try a clearer shot." });
        return;
      }
      setInput((prev) => (prev.trim() ? `${prev.trim()}, ${cleaned}` : cleaned));
      setOcr({ kind: "done", uri });
      haptic("success");
    } catch {
      setOcr({ kind: "error", uri, message: "OCR failed. Type the ingredients below." });
    }
  };

  const pickFromCamera = async () => {
    haptic();
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { setOcr({ kind: "error", message: "Camera permission denied." }); return; }
      const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (r.canceled || !r.assets?.[0]) return;
      const uri = r.assets[0].uri;
      setOcr({ kind: "preview", uri });
      runOcr(uri);
    } catch {
      setOcr({ kind: "error", message: "Camera unavailable." });
    }
  };

  const pickFromLibrary = async () => {
    haptic();
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { setOcr({ kind: "error", message: "Photo permission denied." }); return; }
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
      if (r.canceled || !r.assets?.[0]) return;
      const uri = r.assets[0].uri;
      setOcr({ kind: "preview", uri });
      runOcr(uri);
    } catch {
      setOcr({ kind: "error", message: "Couldn't open photos." });
    }
  };

  /* ── save ────────────────────────────────────────────────── */
  const saveScan = () => {
    if (!result) return;
    const name = productLabel.trim() || "Untitled scan";
    const entry: ScanHistEntry = {
      id: `${Date.now()}`,
      label: name,
      score: result.score,
      verdict: result.verdict,
      reds: result.reds,
      ambers: result.ambers,
      date: todayKey(),
    };
    onSave(entry);
    haptic("success");
    setShowSavePrompt(false);
  };

  const reds   = result ? result.matches.filter((m) => m.level === "red")   : [];
  const ambers = result ? result.matches.filter((m) => m.level === "amber") : [];
  const greens = result ? result.matches.filter((m) => m.level === "green") : [];

  /* ── render ──────────────────────────────────────────────── */
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      {/* ── Barcode scanner modal ─────────────────────────────── */}
      <Modal
        visible={barcode.kind === "scanning" || barcode.kind === "fetching"}
        animationType="slide"
        onRequestClose={closeBarcodeScanner}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {(barcode.kind === "scanning" || barcode.kind === "fetching") && (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={barcode.kind === "scanning" ? handleBarcodeScanned : undefined}
              barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
            >
              {/* viewfinder overlay */}
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <View style={{
                  width: 260, height: 160, borderRadius: 12,
                  borderWidth: 2, borderColor: C.science,
                  backgroundColor: "transparent",
                }} />
                <Text style={{ color: C.text, marginTop: 20, fontWeight: "900", letterSpacing: 2, fontSize: 12 }}>
                  {barcode.kind === "fetching" ? "LOOKING UP PRODUCT…" : "POINT AT BARCODE"}
                </Text>
                {barcode.kind === "fetching" && (
                  <ActivityIndicator color={C.science} style={{ marginTop: 12 }} size="large" />
                )}
              </View>

              {/* close button */}
              <TouchableOpacity
                onPress={closeBarcodeScanner}
                style={{
                  position: "absolute", top: 54, right: 20,
                  backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20,
                  width: 40, height: 40, alignItems: "center", justifyContent: "center",
                }}
              >
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </CameraView>
          )}
        </View>
      </Modal>

      <Animated.ScrollView
        style={{ flex: 1, opacity, transform: [{ translateY }] }}
        contentContainerStyle={styles.scrollPad}
        keyboardShouldPersistTaps="handled"
        testID="scan-view"
      >
        <Text style={styles.sectionKicker}>SCAN · INGREDIENT TRUTH</Text>

        {/* ── 1. SCAN BARCODE hero card ──────────────────────── */}
        <TouchableOpacity
          testID="barcode-scan-btn"
          onPress={openBarcodeScanner}
          activeOpacity={0.85}
          style={{
            backgroundColor: "rgba(14,165,233,0.08)",
            borderWidth: 1.5, borderColor: C.science,
            borderRadius: 16, padding: 20, marginBottom: 14,
            flexDirection: "row", alignItems: "center", gap: 16,
          }}
        >
          <View style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: "rgba(14,165,233,0.15)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Ionicons name="barcode-outline" size={30} color={C.science} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.science, fontWeight: "900", letterSpacing: 3, fontSize: 13, marginBottom: 4 }}>
              SCAN BARCODE
            </Text>
            <Text style={{ color: C.textDim, fontSize: 12, lineHeight: 17 }}>
              Point camera at any beauty product barcode. Ingredients auto-populate from Open Beauty Facts.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.science} />
        </TouchableOpacity>

        {/* barcode status messages */}
        {(barcode.kind === "notfound" || barcode.kind === "error") && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: C.warning,
            borderRadius: 8, padding: 12, marginBottom: 14,
          }}>
            <Ionicons name="warning-outline" size={16} color={C.warning} />
            <Text style={{ color: C.warning, fontSize: 12, flex: 1, lineHeight: 17 }}>
              {barcode.kind === "notfound"
                ? `Product not found (${barcode.barcode}). Paste ingredients manually below.`
                : barcode.message}
            </Text>
          </View>
        )}
        {barcode.kind === "found" && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "rgba(34,197,94,0.08)", borderWidth: 1, borderColor: C.optimal,
            borderRadius: 8, padding: 12, marginBottom: 14,
          }}>
            <Ionicons name="checkmark-circle" size={16} color={C.optimal} />
            <Text style={{ color: C.optimal, fontSize: 12, flex: 1, lineHeight: 17 }}>
              Found: <Text style={{ fontWeight: "900" }}>{barcode.name}</Text> — ingredients loaded.
            </Text>
          </View>
        )}

        {/* ── 2. CAPTURE LABEL (OCR) ─────────────────────────── */}
        <Text style={styles.subKicker}>CAPTURE LABEL</Text>
        <View style={styles.ocrBtnRow} testID="ocr-buttons">
          <TouchableOpacity
            testID="ocr-camera-btn"
            onPress={pickFromCamera}
            style={[styles.secondaryBtn, { flex: 1 }]}
            disabled={ocr.kind === "running"}
          >
            <Ionicons name="camera-outline" size={14} color={C.text} />
            <Text style={styles.secondaryBtnText}>CAMERA</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="ocr-library-btn"
            onPress={pickFromLibrary}
            style={[styles.secondaryBtn, { flex: 1 }]}
            disabled={ocr.kind === "running"}
          >
            <Ionicons name="image-outline" size={14} color={C.text} />
            <Text style={styles.secondaryBtnText}>PHOTOS</Text>
          </TouchableOpacity>
        </View>

        {ocr.kind !== "idle" && (
          <View style={styles.ocrPanel} testID="ocr-panel">
            {"uri" in ocr && ocr.uri && (
              <Image source={{ uri: ocr.uri }} style={styles.ocrPreview} />
            )}
            {ocr.kind === "running" && (
              <View style={styles.ocrStatusRow}>
                <ActivityIndicator size="small" color={C.science} />
                <Text style={styles.ocrStatusText}>Reading text… {Math.round(ocr.progress * 100)}%</Text>
              </View>
            )}
            {ocr.kind === "done" && (
              <View style={styles.ocrStatusRow}>
                <Ionicons name="checkmark-circle" size={14} color={C.optimal} />
                <Text style={[styles.ocrStatusText, { color: C.optimal }]}>Text added below — review then ANALYSE.</Text>
              </View>
            )}
            {ocr.kind === "error" && (
              <View style={styles.ocrStatusRow}>
                <Ionicons name="warning-outline" size={14} color={C.warning} />
                <Text style={[styles.ocrStatusText, { color: C.warning }]}>{ocr.message}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── 3. Paste ingredients + ANALYSE ────────────────── */}
        <Text style={[styles.label, { marginTop: 14 }]}>INGREDIENT LIST</Text>
        <Text style={{ color: C.textMute, fontSize: 11, marginBottom: 8, lineHeight: 16 }}>
          Paste an ingredient list. Flags parabens, phthalates, oxybenzone, retinyl palmitate,
          fragrance, aluminium salts and {INGREDIENTS.length - 25}+ compounds.
        </Text>
        <TextInput
          testID="scan-input"
          value={input}
          onChangeText={setInput}
          placeholder="Aqua, Glycerin, Methylparaben, Fragrance, ..."
          placeholderTextColor={C.textMute}
          multiline
          style={styles.scanInputBox}
        />
        <View style={styles.scanActionRow}>
          <TouchableOpacity
            testID="scan-run-btn"
            onPress={runScan}
            disabled={input.trim().length < 5}
            style={[
              styles.primaryBtn,
              { flex: 2 },
              input.trim().length < 5 && styles.primaryBtnDisabled,
            ]}
          >
            <Text style={styles.primaryBtnText}>ANALYSE</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="scan-clear-btn" onPress={clearScan} style={[styles.secondaryBtn, { flex: 1 }]}>
            <Ionicons name="close" size={14} color={C.text} />
            <Text style={styles.secondaryBtnText}>CLEAR</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subKicker, { marginTop: 14 }]}>TRY A SAMPLE</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {SCAN_SAMPLES.map((s, i) => (
            <TouchableOpacity key={i} testID={`scan-sample-${i}`} onPress={() => loadSample(s)} style={styles.scanSampleBtn}>
              <Text style={styles.scanSampleText}>{s.label.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── 4. Results ────────────────────────────────────────── */}
        {result && (
          <View testID="scan-result" style={{ marginTop: 20 }}>
            {/* Score circle */}
            <View style={[styles.scanCircle, { borderColor: verdictColor(C, result.verdict) }]} testID="scan-score-circle">
              <Text style={[styles.scanCircleScore, { color: verdictColor(C, result.verdict) }]}>{result.score}</Text>
              <Text style={[styles.scanCircleSub, { color: verdictColor(C, result.verdict) }]}>
                {result.verdict === "green" ? "CLEAN" : result.verdict === "amber" ? "CAUTION" : "AVOID"}
              </Text>
            </View>

            {/* Tally row */}
            <View style={styles.scanTallyRow}>
              <View style={[styles.scanTallyBox, { borderColor: C.penalty }]}>
                <Text style={[styles.scanTallyN, { color: C.penalty }]}>{result.reds}</Text>
                <Text style={[styles.scanTallyLabel, { color: C.penalty }]}>RED FLAGS</Text>
              </View>
              <View style={[styles.scanTallyBox, { borderColor: C.warning }]}>
                <Text style={[styles.scanTallyN, { color: C.warning }]}>{result.ambers}</Text>
                <Text style={[styles.scanTallyLabel, { color: C.warning }]}>CAUTION</Text>
              </View>
              <View style={[styles.scanTallyBox, { borderColor: C.optimal }]}>
                <Text style={[styles.scanTallyN, { color: C.optimal }]}>{result.greens}</Text>
                <Text style={[styles.scanTallyLabel, { color: C.optimal }]}>CLEAN</Text>
              </View>
            </View>

            {/* Save */}
            {showSavePrompt ? (
              <View>
                <Text style={styles.label}>NAME THIS SCAN</Text>
                <TextInput
                  testID="scan-save-name"
                  value={productLabel}
                  onChangeText={setProductLabel}
                  placeholder="My moisturiser"
                  placeholderTextColor={C.textMute}
                  style={styles.input}
                />
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  <TouchableOpacity testID="scan-save-confirm" onPress={saveScan} style={[styles.scanSaveBtn, { flex: 1 }]}>
                    <Ionicons name="checkmark" size={16} color={C.bg} />
                    <Text style={styles.scanSaveText}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity testID="scan-save-cancel" onPress={() => setShowSavePrompt(false)} style={[styles.secondaryBtn, { flex: 1 }]}>
                    <Text style={styles.secondaryBtnText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity testID="scan-save-btn" onPress={() => setShowSavePrompt(true)} style={styles.scanSaveBtn}>
                <Ionicons name="bookmark" size={16} color={C.bg} />
                <Text style={styles.scanSaveText}>SAVE TO HISTORY</Text>
              </TouchableOpacity>
            )}

            {/* Red flags */}
            {reds.length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.subKicker, { color: C.penalty }]}>RED FLAGS · {reds.length}</Text>
                {reds.map((m) => (
                  <View key={m.id} style={[styles.scanIngCard, { borderLeftColor: C.penalty }]} testID={`scan-ing-${m.id}`}>
                    <View style={styles.scanIngHead}>
                      <Text style={styles.scanIngName}>{m.name}</Text>
                      <Text style={[styles.scanIngCat, { color: C.penalty, backgroundColor: "rgba(220,38,38,0.1)" }]}>{m.category}</Text>
                    </View>
                    <Text style={styles.scanIngBody}>{m.summary}</Text>
                    {m.citation && <Text style={styles.scanIngCitation}>{m.citation}</Text>}
                    {m.swaps && m.swaps.length > 0 && (
                      <View>
                        <Text style={styles.scanSwapsLabel}>CLEANER SWAPS</Text>
                        <View style={styles.scanSwapsRow}>
                          {m.swaps.map((s, i) => (
                            <View key={i} style={styles.scanSwapChip}>
                              <Text style={styles.scanSwapText}>{s}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Ambers */}
            {ambers.length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.subKicker, { color: C.warning }]}>CAUTION · {ambers.length}</Text>
                {ambers.map((m) => (
                  <View key={m.id} style={[styles.scanIngCard, { borderLeftColor: C.warning }]} testID={`scan-ing-${m.id}`}>
                    <View style={styles.scanIngHead}>
                      <Text style={styles.scanIngName}>{m.name}</Text>
                      <Text style={[styles.scanIngCat, { color: C.warning, backgroundColor: "rgba(245,158,11,0.1)" }]}>{m.category}</Text>
                    </View>
                    <Text style={styles.scanIngBody}>{m.summary}</Text>
                    {m.citation && <Text style={styles.scanIngCitation}>{m.citation}</Text>}
                    {m.swaps && m.swaps.length > 0 && (
                      <View>
                        <Text style={styles.scanSwapsLabel}>CLEANER SWAPS</Text>
                        <View style={styles.scanSwapsRow}>
                          {m.swaps.map((s, i) => (
                            <View key={i} style={styles.scanSwapChip}>
                              <Text style={styles.scanSwapText}>{s}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Greens */}
            {greens.length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.subKicker, { color: C.optimal }]}>RECOGNISED CLEAN · {greens.length}</Text>
                {greens.map((m) => (
                  <View key={m.id} style={[styles.scanIngCard, { borderLeftColor: C.optimal }]} testID={`scan-ing-${m.id}`}>
                    <View style={styles.scanIngHead}>
                      <Text style={styles.scanIngName}>{m.name}</Text>
                      <Text style={[styles.scanIngCat, { color: C.optimal, backgroundColor: "rgba(34,197,94,0.1)" }]}>{m.category}</Text>
                    </View>
                    <Text style={styles.scanIngBody}>{m.summary}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Unknown */}
            {result.unknown.length > 0 && (
              <View style={[styles.scanUnknownBox, { marginTop: 14 }]} testID="scan-unknown">
                <Text style={styles.subKicker}>NOT IN DATABASE · {result.unknown.length}</Text>
                <Text style={styles.scanUnknownText}>
                  {result.unknown.slice(0, 12).join(" · ")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── 5. Scan history ───────────────────────────────────── */}
        {history.length > 0 && (
          <View style={{ marginTop: 28 }}>
            <View style={styles.todayLogHeader}>
              <Text style={styles.subKicker}>SAVED SCANS · {history.length}</Text>
              <TouchableOpacity
                testID="scan-clear-history"
                onPress={() => confirmAction("CLEAR HISTORY", "Delete all saved scans?", onClear)}
              >
                <Text style={styles.wipeText}>CLEAR</Text>
              </TouchableOpacity>
            </View>
            {history.map((h) => (
              <View key={h.id} style={styles.scanHistoryCard} testID={`scan-hist-${h.id}`}>
                <View style={[styles.scanHistDot, { borderColor: levelColor(C, h.verdict) }]}>
                  <Text style={[styles.scanHistDotText, { color: levelColor(C, h.verdict) }]}>{h.score}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scanHistName}>{h.label}</Text>
                  <Text style={styles.scanHistDate}>{h.date} · {h.reds} red · {h.ambers} amber</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}
