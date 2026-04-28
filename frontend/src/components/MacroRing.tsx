/**
 * PRIMALFORGE — MACRO RING
 *
 * Animated SVG arc for macro progress on the HUD screen.
 * Smooth sweep from 0 → current % whenever `value` changes.
 *
 * Usage:
 *   <MacroRing label="PROTEIN" unit="g" value={p} target={target} color={C.science} />
 */
import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { useTheme } from "../theme";
import { radii, shadow } from "../styles";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface MacroRingProps {
  label: string;
  unit: string;
  value: number;
  target: number;
  color: string;
  /** Optional accent color for gradient — defaults to `color`. */
  colorAccent?: string;
  /** Render slightly bigger for the hero "calories" ring. */
  hero?: boolean;
}

export function MacroRing({
  label,
  unit,
  value,
  target,
  color,
  colorAccent,
  hero = false,
}: MacroRingProps) {
  const { C, isDark } = useTheme();
  const SIZE = hero ? 132 : 108;
  const SW = hero ? 11 : 9;
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const pct = Math.min(1, target > 0 ? value / target : 0);

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // strokeDashoffset isn't native-driver-safe
    }).start();
  }, [pct, anim]);

  const dashOffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, 0],
  });

  const accent = colorAccent ?? color;
  const ringId = `ring-${label}`;

  return (
    <View
      style={[
        styles.card,
        hero && styles.cardHero,
        {
          backgroundColor: C.card,
          borderColor: hero ? C.borderHi : C.border,
          ...shadow(isDark, hero ? 2 : 1),
        },
      ]}
      testID={`macro-ring-${label.toLowerCase()}`}
    >
      <Text style={[styles.label, { color: C.textDim }]}>{label}</Text>

      <View style={{ alignItems: "center", marginVertical: 6 }}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={color} />
              <Stop offset="100%" stopColor={accent} />
            </LinearGradient>
          </Defs>
          {/* Track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={C.border}
            strokeWidth={SW}
            fill="none"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={`url(#${ringId})`}
            strokeWidth={SW}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRC} ${CIRC}`}
            strokeDashoffset={dashOffset as any}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>

        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.value, { color: C.text, fontSize: hero ? 24 : 20 }]}>
            {Math.round(value)}
          </Text>
          <Text style={[styles.target, { color: C.textMute }]}>
            / {Math.round(target)} {unit}
          </Text>
        </View>
      </View>

      <Text style={[styles.pct, { color }]}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  cardHero: {
    width: "100%",
    paddingVertical: 16,
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
    alignSelf: "flex-start",
  },
  center: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  target: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  pct: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 2,
  },
});
