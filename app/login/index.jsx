import { useAuth, useOAuth, useSignIn, useUser } from "@clerk/clerk-expo";
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
  TouchableOpacity
} from "react-native";

import { createClerkSupabaseClient } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";
import { saveAdminStatus } from "../utils/admin storage";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();

  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });

  /* ---------------- ROLE CHECK ---------------- */
  const checkUserRole = async (token, clerkUser) => {
    try {
      const supabase = createClerkSupabaseClient(token);

      const { data: existingUser } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", clerkUser.id)
        .single();

      if (existingUser) return existingUser.role;

      const adminEmails = ["admin@gmail.com"];
      const isAdmin = adminEmails.includes(
        clerkUser.primaryEmailAddress?.emailAddress
      );

      await supabase.from("users").insert({
        clerk_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        full_name: clerkUser.fullName ?? "User",
        role: isAdmin ? "admin" : "user",
      });

      return isAdmin ? "admin" : "user";
    } catch (error) {
      console.log("❌ checkUserRole error:", error);
      return "user";
    }
  };

  /* ---------------- EMAIL LOGIN ---------------- */
  const onSignInPress = async () => {
    if (!isLoaded || isSignedIn) {
      Alert.alert("คุณเข้าสู่ระบบอยู่แล้ว");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const token = await getToken({ template: "supabase" });
        const role = await checkUserRole(token, user);

        await saveAdminStatus(role === "admin");
        router.replace(role === "admin" ? "/admin" : "/(tabs)/home");
      }
    } catch (err) {
      console.error("❌ Sign in error:", err);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        err.errors?.[0]?.message || "บัญชีนี้กำลังล็อกอินอยู่"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
  const handleGoogleLogin = async () => {
    if (isSignedIn) {
      Alert.alert("คุณเข้าสู่ระบบอยู่แล้ว");
      return;
    }

    try {
      const { createdSessionId, setActive } = await startGoogleOAuth();

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.error("❌ Google OAuth error:", err);
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>ยินดีต้อนรับกลับ</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมล"
          value={emailAddress}
          onChangeText={setEmailAddress}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={onSignInPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.googleText}>เข้าสู่ระบบด้วย Google</Text>
        </TouchableOpacity>

        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>สมัครสมาชิก</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: Colors.PURPLE || "#8B5CF6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.PURPLE || "#8B5CF6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  googleButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  googleText: { fontWeight: "600" },
  link: {
    marginTop: 24,
    textAlign: "center",
    color: Colors.PURPLE || "#8B5CF6",
    fontWeight: "600",
  },
});
