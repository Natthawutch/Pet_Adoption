import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store"; // เพิ่มการ import SecureStore

// การกำหนด tokenCache ใหม่
const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`Token found for key: ${key}`);
      } else {
        console.log(`Token not found for key: ${key}`);
      }
      return item;
    } catch (error) {
      console.error(`Error getting token for key: ${key}`, error);
      // ใช้การลบ item เมื่อเกิดข้อผิดพลาด
      await SecureStore.deleteItemAsync(key); // แก้ไขการพิมพ์ผิด
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return await SecureStore.setItemAsync(key, value); // ต้องใช้ await ที่นี่ด้วย
    } catch (error) {
      console.error(`Error saving token for key: ${key}`, error);
    }
  },
};

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const [fontsLoaded] = useFonts({
    oswald: require("../assets/fonts/Oswald-Regular.ttf"),
    "oswald-medium": require("../assets/fonts/Oswald-Medium.ttf"),
    "oswald-bold": require("../assets/fonts/Oswald-Bold.ttf"),
    Itim: require("../assets/fonts/Itim-Regular.ttf"),
  });

  // ตรวจสอบว่า fonts โหลดสำเร็จแล้วหรือยัง
  if (!fontsLoaded) {
    return null; // หรือแสดง Splash screen หากต้องการ
  }

  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }} // ซ่อน header ของ stack
        />
        <Stack.Screen name="Login/index" options={{ headerShown: false }} />
      </Stack>
    </ClerkProvider>
  );
}
