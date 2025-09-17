import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

const customStorage = {
  getItem: async (key) =>
    (await SecureStore.getItemAsync(key)) || (await AsyncStorage.getItem(key)),
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
    await AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: { schema: "public" },
});

export const createClerkSupabaseClient = (clerkToken) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: { storage: customStorage },
    global: { headers: { Authorization: `Bearer ${clerkToken}` } },
  });
