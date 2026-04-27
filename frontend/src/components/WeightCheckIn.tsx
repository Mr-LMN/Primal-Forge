import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, XP_RULES, formatDateDisplay } from "../data";
import { styles } from "../styles";
import type { WeightEntry } from "../types";

export function WeightCheckIn({
  visible,
  onClose,
  weights,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  weights: WeightEntry[];
  onSave: (kg: number) => void;
}) {
  const [kg, setKg] = useState("");
  useEffect(() => {
    if (visible) setKg("");
  }, [visible]);
  const submit = () => {
    const n = parseFloat(kg);
    if (!n || n <= 0 || n > 400) return;
    onSave(n);
  };
  const last7 = weights.slice(0, 7);
  const max = Math.max(...last7.map((w) => w.weight), 0);
  const min = Math.min(...last7.map((w) => w.weight), max);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard} testID="weight-modal">
          <View style={styles.weightModalHeader}>
            <Text style={styles.modalTitleLight}>WEIGH-IN</Text>
            <TouchableOpacity onPress={onClose} testID="weight-modal-close">
              <Ionicons name="close" size={22} color={C.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSub}>Daily weigh-in. Same time, same scale. Trend &gt; absolute.</Text>
          <Text style={styles.label}>WEIGHT · KG</Text>
          <TextInput
            testID="weight-input"
            value={kg}
            onChangeText={setKg}
            placeholder="84.2"
            placeholderTextColor={C.textMute}
            keyboardType="decimal-pad"
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity
            testID="weight-save-btn"
            onPress={submit}
            disabled={!kg}
            style={[styles.primaryBtn, !kg && styles.primaryBtnDisabled, { marginTop: 14 }]}
          >
            <Text style={styles.primaryBtnText}>LOG WEIGHT · +{XP_RULES.weighIn} XP</Text>
          </TouchableOpacity>
          {last7.length > 0 && (
            <View style={{ marginTop: 22 }}>
              <Text style={styles.subKicker}>LAST {last7.length} ENTRIES</Text>
              {last7.map((w) => {
                const pct = max === min ? 0.5 : (w.weight - min) / (max - min);
                return (
                  <View key={w.date} style={styles.weightRow}>
                    <Text style={styles.weightRowDate}>{formatDateDisplay(w.date)}</Text>
                    <View style={styles.weightRowBarTrack}>
                      <View style={[styles.weightRowBarFill, { width: `${20 + pct * 80}%` }]} />
                    </View>
                    <Text style={styles.weightRowValue}>{w.weight}kg</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
