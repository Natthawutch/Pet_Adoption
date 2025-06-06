import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const { width } = Dimensions.get("screen");

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.replace("/(tabs)/home");
      }
    };
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace("/(tabs)/home");
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      // สร้าง Redirect URL
      const redirectUrl = makeRedirectUri({
        useProxy: true,
        native: "yourapp://redirect",
      });
      console.log("Redirect URL:", redirectUrl);

      // เริ่มกระบวนการ OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;

      // เปิดหน้าล็อกอินของ Google
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );

      if (result.type === "success") {
        const url = result.url;
        const params = url.split("#")[1];
        const accessToken = new URLSearchParams(params).get("access_token");
        const refreshToken = new URLSearchParams(params).get("refresh_token");

        if (!accessToken || !refreshToken) {
          throw new Error("ไม่สามารถรับ Token จาก URL ได้");
        }

        // ตั้งค่า Session ด้วย Token ที่ได้
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) throw sessionError;

        // ตรวจสอบผู้ใช้
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        router.replace("/(tabs)/home");
      } else {
        throw new Error("ผู้ใช้ยกเลิกการล็อกอิน");
      }
    } catch (error) {
      Alert.alert(
        "ล็อกอินไม่สำเร็จ",
        error.message || "เกิดข้อผิดพลาดในการล็อกอิน"
      );
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/login.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>พร้อมที่จะหาเพื่อนใหม่แล้วหรือยัง?</Text>

        <Text style={styles.subtitle}>
          มอบความหวัง. แบ่งปันความสุข.
          ความรักของคุณสามารถเปลี่ยนชีวิตสัตว์เหล่านี้ได้
        </Text>

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} size="small" />
          ) : (
            <Text style={styles.buttonText}>เริ่มต้นใช้งานด้วย Google</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingTop: 50,
  },
  image: {
    width: "100%",
    height: 400,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 10,
    color: Colors.DARK,
  },
  subtitle: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 80,
    backgroundColor: Colors.PURPLE,
    paddingVertical: 14,
    width: width * 0.9,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: "outfit-medium",
    fontSize: 18,
    color: Colors.WHITE,
    textAlign: "center",
  },
});
