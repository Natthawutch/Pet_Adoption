import { useOAuth, useSignIn } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons"; // เพิ่ม import ไอคอน
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({
    strategy: "oauth_facebook",
  });

  // ฟังก์ชันสำหรับกลับไปหน้า Home
  const handleBack = () => {
    router.replace("/home"); // หรือใช้ router.back() เพื่อกลับไปหน้าก่อนหน้า
  };

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // 🔥 CHECK ADMIN
        const adminEmails = ["admin@gmail.com"];
        if (adminEmails.includes(emailAddress)) {
          router.replace("/admin");
        } else {
          router.replace("/home");
        }
      } else {
        console.log("Incomplete login:", result);
      }
    } catch (err) {
      console.error("Sign in error:", err);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        err.errors?.[0]?.message || "กรุณาตรวจสอบอีเมลหรือรหัสผ่านอีกครั้ง"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      const startOAuth =
        provider === "google" ? startGoogleOAuth : startFacebookOAuth;

      const {
        createdSessionId,
        signIn,
        signUp,
        setActive: oauthSetActive,
      } = await startOAuth();

      if (createdSessionId) {
        await oauthSetActive({ session: createdSessionId });
        router.replace("/home");
      } else {
        console.log("OAuth incomplete:", signIn, signUp);
      }
    } catch (err) {
      console.error(`${provider} OAuth error:`, err);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        `ไม่สามารถเข้าสู่ระบบด้วย ${
          provider === "google" ? "Google" : "Facebook"
        } ได้`
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* เพิ่มปุ่มย้อนกลับด้านบน */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Ionicons
          name="arrow-back"
          size={24}
          color={Colors.PURPLE || "#8B5CF6"}
        />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.pawIcon}>🐾</Text>
          </View>
          <Text style={styles.title}>ยินดีต้อนรับกลับ</Text>
          <Text style={styles.subtitle}>
            เข้าสู่ระบบเพื่อช่วยเหลือน้องหมาแมวจรจัด
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Text style={styles.iconEmoji}>✉️</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.label}>อีเมล</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === "email" && styles.inputFocused,
                ]}
                placeholder="your@email.com"
                placeholderTextColor="#B0B0B0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Text style={styles.iconEmoji}>🔒</Text>
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === "password" && styles.inputFocused,
                ]}
                placeholder="••••••••"
                placeholderTextColor="#B0B0B0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignInPress}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>หรือ</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleOAuthSignIn("google")}
            activeOpacity={0.7}
          >
            <View style={styles.socialButtonContent}>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>
                เข้าสู่ระบบด้วย Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.petIcons}></View>
          <Text style={styles.footerText}>ยังไม่มีบัญชี? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>สมัครสมาชิกฟรี</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  // เพิ่มสไตล์ปุ่มย้อนกลับ
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: Colors.PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  pawIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.PURPLE || "#8B5CF6",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  inputContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: "#1A1A1A",
    padding: 0,
    fontWeight: "500",
  },
  inputFocused: {
    color: Colors.PURPLE || "#8B5CF6",
  },
  button: {
    backgroundColor: Colors.PURPLE || "#8B5CF6",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 8,
    shadowColor: Colors.PURPLE || "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
    marginRight: 8,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8E8E8",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 13,
    fontWeight: "600",
  },
  socialButton: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
  },
  petIcons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  petIcon: {
    fontSize: 28,
  },
  footerText: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  linkText: {
    fontSize: 16,
    color: Colors.PURPLE || "#8B5CF6",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
