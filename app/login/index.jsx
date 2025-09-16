import { useOAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";

const { width, height } = Dimensions.get("window");

// ฟังก์ชันตรวจสอบ email และ password
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 6;

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef(null);

  // ใช้ Clerk OAuth สำหรับ Google
  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });

  // animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);

  // animation เมื่อ component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.back(1.2),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ฟังก์ชันเข้าสู่ระบบด้วย Google (แก้ไขใหม่)
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);

      // เริ่มกระบวนการ OAuth
      const { createdSessionId, setActive, signIn } =
        await startGoogleOAuthFlow();

      if (!createdSessionId) {
        throw new Error("ไม่สามารถสร้าง session ได้");
      }

      // ตั้งค่า session
      await setActive({ session: createdSessionId });

      // รอให้ Clerk อัปเดต state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ดึงข้อมูลผู้ใช้จาก Clerk
      const user = signIn;
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");

      const clerkId = user.id; // ID จาก Clerk (รูปแบบ sia_xxx)
      const email =
        user.emailAddresses[0]?.emailAddress ||
        `${clerkId}@temp.googleauth.com`;
      const fullName = user.fullName || "Google User";
      const avatarUrl = user.imageUrl || "";

      // ตรวจสอบว่าผู้ใช้มีอยู่แล้วในตาราง users
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      let userId;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // สร้างผู้ใช้ใหม่ด้วย UUID
        const newUserId = crypto.randomUUID();
        const { error } = await supabase.from("users").insert({
          id: newUserId,
          clerk_id: clerkId,
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          provider: "google",
        });

        if (error) throw error;
        userId = newUserId;
      }

      // บันทึก session
      await AsyncStorage.setItem(
        "userSession",
        JSON.stringify({
          userId,
          clerkId,
          email,
          name: fullName,
          avatar: avatarUrl,
        })
      );

      router.replace("/home");
    } catch (error) {
      console.error("Sign-in Error:", error);
      Alert.alert(
        "เข้าสู่ระบบไม่สำเร็จ",
        error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // ตรวจสอบฟอร์ม
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }

    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // เปลี่ยนข้อมูลฟอร์ม
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  // เข้าสู่ระบบด้วย email/password
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      if (error) {
        let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
        }

        Alert.alert("เข้าสู่ระบบไม่สำเร็จ", errorMessage);
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          router.replace("/(tabs)/home");
        });
      }
    } catch (err) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, router, fadeAnim]);

  // Social login ที่รองรับปัจจุบันคือ Google เท่านั้น
  const handleSocialLogin = useCallback(
    (provider) => {
      if (provider === "Google") {
        handleGoogleSignIn();
      } else {
        Alert.alert("Coming Soon", `${provider} login จะเปิดให้ใช้เร็วๆ นี้!`);
      }
    },
    [handleGoogleSignIn]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background blobs */}
      <View style={styles.background}>
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <View style={[styles.blob, styles.blob3]} />
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/images/Intro.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>ยินดีต้อนรับ</Text>
              <Text style={styles.subtitle}>
                เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
              </Text>
            </View>

            {/* Glass Card */}
            <BlurView intensity={20} tint="light" style={styles.glassCard}>
              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={[
                    styles.socialButton,
                    googleLoading && styles.socialButtonDisabled,
                  ]}
                  onPress={() => handleSocialLogin("Google")}
                  disabled={loading || googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator size="small" color="#db4437" />
                  ) : (
                    <Ionicons name="logo-google" size={20} color="#db4437" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin("Apple")}
                  disabled={loading || googleLoading}
                >
                  <Ionicons name="logo-apple" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => handleSocialLogin("Facebook")}
                  disabled={loading || googleLoading}
                >
                  <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>หรือ</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Form */}
              <View style={styles.formSection}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "email" && styles.inputFocused,
                      errors.email && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={20}
                      color={focusedField === "email" ? "#667eea" : "#9ca3af"}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="อีเมล"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={formData.email}
                      onChangeText={(text) => handleInputChange("email", text)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      editable={!loading && !googleLoading}
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                  {errors.email && (
                    <Animated.Text style={styles.errorText}>
                      {errors.email}
                    </Animated.Text>
                  )}
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      focusedField === "password" && styles.inputFocused,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={20}
                      color={
                        focusedField === "password" ? "#667eea" : "#9ca3af"
                      }
                    />
                    <TextInput
                      ref={passwordRef}
                      style={styles.input}
                      placeholder="รหัสผ่าน"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={formData.password}
                      onChangeText={(text) =>
                        handleInputChange("password", text)
                      }
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      editable={!loading && !googleLoading}
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      disabled={loading || googleLoading}
                    >
                      <Ionicons
                        name={showPassword ? "eye" : "eye-off"}
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Animated.Text style={styles.errorText}>
                      {errors.password}
                    </Animated.Text>
                  )}
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => router.push("/forgot-password")}
                  disabled={loading || googleLoading}
                  style={styles.forgotButton}
                >
                  <Text style={styles.forgotText}>ลืมรหัสผ่าน?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    (loading || googleLoading) && styles.buttonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading || googleLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.buttonContent}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                disabled={loading || googleLoading}
              >
                <Text style={styles.footerLink}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/home")}
              disabled={loading || googleLoading}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={16}
                color="rgba(255, 255, 255, 0.8)"
              />
              <Text style={styles.backButtonText}>กลับหน้าหลัก</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e2e",
  },
  background: {
    position: "absolute",
    width,
    height,
  },
  blob: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.2,
  },
  blob1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: "#667eea",
    top: -width * 0.3,
    left: -width * 0.2,
  },
  blob2: {
    width: width * 0.6,
    height: width * 0.6,
    backgroundColor: "#764ba2",
    bottom: -width * 0.2,
    right: -width * 0.1,
  },
  blob3: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: "#6B46C1",
    top: height * 0.4,
    right: width * 0.2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  glassCard: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 24,
    marginBottom: 24,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  formSection: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputFocused: {
    borderColor: "#667eea",
    backgroundColor: "rgba(102, 126, 234, 0.1)",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#667eea",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  footerLink: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginLeft: 4,
  },
});
