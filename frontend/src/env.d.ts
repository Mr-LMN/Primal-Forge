// Type declarations for EXPO_PUBLIC_* environment variables.
// Expo replaces these at build time via Babel — declaring them here
// so TypeScript knows they exist at compile time.
declare const process: {
  env: {
    EXPO_PUBLIC_USDA_API_KEY?: string;
    EXPO_PUBLIC_NUTRITIONIX_APP_ID?: string;
    EXPO_PUBLIC_NUTRITIONIX_APP_KEY?: string;
    EXPO_PUBLIC_EXERCISEDB_API_KEY?: string;
    EXPO_PUBLIC_GEMINI_API_KEY?: string;
    NODE_ENV: string;
  };
};
