import { AntDesign } from "@expo/vector-icons";
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

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // แก้เป็น false ตอนเริ่มต้น

  const parseTokensFromUrl = (url) => {
    try {
      const delimiter = url.includes("#") ? "#" : "?";
      const fragment = url.split(delimiter)[1];
      if (!fragment) return null;

      const params = new URLSearchParams(fragment);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (!access_token || !refresh_token) return null;
      return { access_token, refresh_token };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace("/(tabs)/home");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
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
      const redirectUri = makeRedirectUri({
        scheme: "petadoption", // ต้องตรงกับที่ใส่ไว้ใน app.config.js
        useProxy: true, // สำหรับ Expo Go หรือ dev
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error || !data.url) throw error ?? new Error("OAuth URL not found");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri
      );
      if (result.type !== "success" || !result.url) {
        throw new Error("ผู้ใช้ยกเลิกการล็อกอินหรือเกิดปัญหา");
      }

      const tokens = parseTokensFromUrl(result.url);
      if (!tokens) {
        throw new Error("ไม่สามารถรับ access token และ refresh token ได้");
      }

      const { access_token, refresh_token } = tokens;
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError) throw sessionError;

      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("ล็อกอินไม่สำเร็จ", error.message || "เกิดข้อผิดพลาด");
      console.error("[Login] Error:", error);
      setLoading(false);
    }
  };

  // ตัวอย่างฟังก์ชันสำหรับปุ่มอีเมล (เปลี่ยนเป็นลิงก์หรือฟังก์ชันของคุณเอง)
  const handleEmailLogin = () => {
    router.push("/login/email"); // สมมติว่ามีหน้า login ด้วยอีเมล
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/Intro.png")}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Ready to welcome a new furry friend into your life?
        </Text>

        <Pressable
          style={[styles.emailButton, loading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          <View style={styles.buttonContent}>
            <AntDesign
              name="mail"
              size={20}
              color="#fff"
              style={styles.emailIcon}
            />
            <Text style={styles.emailButtonText}>Continue with Email</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <AntDesign
                name="google"
                size={20}
                color="#fff"
                style={styles.googleIcon}
              />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.subtitle}>
          Give hope. Share happiness. Your love has the power to change the
          lives of these animals forever.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emailIcon: {
    marginRight: 30,
  },

  container: {
    paddingTop: 48,
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  image: {
    width: "100%",
    height: 300,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    textAlign: "center",
    color: Colors.DARK,
    maxWidth: 320,
  },
  subtitle: {
    marginTop: 60,
    fontFamily: "outfit",
    fontSize: 16,
    textAlign: "center",
    color: Colors.GRAY,
    lineHeight: 22,
    maxWidth: 320,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: Colors.WHITE,
  },

  googleButton: {
    marginTop: 15,
    backgroundColor: "#DB4437",
    width: width * 0.85,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 75,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    marginRight: 25,
  },

  emailButton: {
    marginTop: 16,
    backgroundColor: Colors.DARK_BLUE,
    width: width * 0.85,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emailButtonText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: Colors.WHITE,
  },
});
