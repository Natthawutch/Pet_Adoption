import { useOAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const googleAuth = useOAuth({ strategy: "oauth_google" });

  // Sync Clerk user -> Supabase
  const syncUserToSupabase = async () => {
    try {
      if (!user) return;
      const token = await user.getToken({ template: "supabase" });
      if (!token) throw new Error("No token from Clerk");

      supabase.auth.setAuth(token);

      const { data, error } = await supabase.from("users").upsert({
        clerk_id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        full_name: user.fullName,
        avatar_url: user.imageUrl,
        bio: "",
      });

      if (error) {
        console.log("❌ Supabase upsert error:", error);
      } else {
        console.log("✅ Supabase upsert success:", data);
      }
    } catch (err) {
      console.error("❌ Sync failed:", err);
    }
  };

  useEffect(() => {
    if (user) {
      syncUserToSupabase();
      router.replace("/home");
    }
  }, [user]);

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await googleAuth.startOAuthFlow();
      if (result?.createdSessionId) {
        console.log("✅ Google login success");
      } else {
        Alert.alert("Login failed", "No session created");
      }
    } catch (err) {
      console.error("❌ Google OAuth error:", err);
      Alert.alert("Error", "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Email Login
  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Upsert user to Supabase table
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || "",
        avatar_url: data.user.user_metadata?.avatar_url || "",
        bio: "",
      });

      console.log("✅ Email login success");
      router.replace("/home");
    } catch (err) {
      console.error("❌ Email login error:", err);
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1000&q=80",
          }}
          style={styles.backgroundImage}
          imageStyle={{ opacity: 0.3 }}
        >
          <View style={styles.overlay}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="heart" size={40} color="#FF6B6B" />
                <Ionicons name="paw" size={35} color="#4ECDC4" />
              </View>
              <Text style={styles.title}>Stray Dog Care</Text>
              <Text style={styles.subtitle}>ร่วมกันช่วยเหลือสัตว์น้อย</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="อีเมล"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="รหัสผ่าน"
                  placeholderTextColor="#999"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleEmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.orText}>หรือ</Text>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={[styles.buttonText, { color: "#333" }]}>
                  เข้าสู่ระบบด้วย Google
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { flex: 1, width, height },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  header: { alignItems: "center", marginBottom: 30 },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#333" },
  eyeIcon: { padding: 5 },
  primaryButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 14,
    borderRadius: 15,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  orText: {
    textAlign: "center",
    marginVertical: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 15,
    gap: 10,
  },
});
