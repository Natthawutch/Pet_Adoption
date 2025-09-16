import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto"; // เพิ่มบรรทัดนี้

// ตรวจสอบ environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration:");
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key:", supabaseAnonKey ? "Exists" : "Missing");
  throw new Error("Missing Supabase environment variables!");
}

// Custom storage adapter สำหรับ React Native
const customStorage = {
  getItem: async (key) => {
    try {
      // ลองใช้ SecureStore ก่อน
      const secureItem = await SecureStore.getItemAsync(key);
      if (secureItem) return secureItem;

      // Fallback ไปใช้ AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      // พยายามบันทึกทั้งสองที่
      await SecureStore.setItemAsync(key, value);
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Storage setItem error:", error);
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage removeItem error:", error);
    }
  },
};

// สร้าง Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  global: {
    fetch: fetch,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },
});

// ฟังก์ชันทดสอบการเชื่อมต่อแบบปรับปรุงใหม่
export const testSupabaseConnection = async () => {
  try {
    // ทดสอบทั้ง auth และ database connection
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { data, error: dbError } = await supabase
      .from("users")
      .select("id, email")
      .limit(1);

    if (authError || dbError) {
      console.error("Connection test errors:", { authError, dbError });
      return false;
    }

    console.log("Supabase connection successful:", {
      user: user ? "Authenticated" : "Not authenticated",
      dbData: data,
    });
    return true;
  } catch (err) {
    console.error("Connection test failed:", err);
    return false;
  }
};

// ฟังก์ชันเสริมสำหรับจัดการ UUID
export const ensureUuidFormat = (id) => {
  if (!id) return null;
  // ถ้าเป็น UUID ที่ถูกต้องอยู่แล้ว
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )
  ) {
    return id;
  }
  // ถ้าเป็น text ที่สามารถแปลงเป็น UUID ได้
  if (typeof id === "string" && id.length === 36) {
    return id.toLowerCase(); // มาตรฐาน UUID ใช้ตัวพิมพ์เล็ก
  }
  // กรณีอื่นๆ สร้าง UUID ใหม่
  return crypto.randomUUID(); // หรือใช้วิธีอื่นในการสร้าง UUID
};
