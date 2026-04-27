/**
 * PRIMALFORGE — ImageCard
 * Loads an Unsplash image asynchronously with a gradient fallback.
 * Shows a loading shimmer, then fades in the image.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { getMealImage, getWorkoutHeroImage, getGradientFallback } from "../imageService";
import { useTheme } from "../theme";

type ImageCardProps = {
  query: string;
  type: "meal" | "workout";
  focus?: string;
  height?: number;
  label?: string;
  sublabel?: string;
};

export function ImageCard({
  query,
  type,
  focus,
  height = 140,
  label,
  sublabel,
}: ImageCardProps) {
  const { C } = useTheme();
  const [uri, setUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [grad] = useState<[string, string]>(() => getGradientFallback(query));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url =
        type === "meal"
          ? await getMealImage(query)
          : await getWorkoutHeroImage(focus ?? query);
      if (!cancelled && url) {
        setUri(url);
      }
    })();
    return () => { cancelled = true; };
  }, [query, type, focus]);

  const handleLoad = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[s.container, { height }]}>
      {/* Gradient fallback — always shown beneath the image */}
      <LinearGradient colors={grad} style={StyleSheet.absoluteFill} />

      {/* Real image fades in over gradient */}
      {uri && (
        <Animated.Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
          resizeMode="cover"
          onLoad={handleLoad}
        />
      )}

      {/* Dark gradient overlay so text is always legible */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.72)"]}
        style={[StyleSheet.absoluteFill, { justifyContent: "flex-end", padding: 12 }]}
      >
        {label && <Text style={[s.label, { color: "#fff" }]} numberOfLines={1}>{label}</Text>}
        {sublabel && <Text style={[s.sublabel, { color: "rgba(255,255,255,0.75)" }]} numberOfLines={1}>{sublabel}</Text>}
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: "700",
  },
});
