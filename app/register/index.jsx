import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";

const { width, height } = Dimensions.get('window');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Progress animation based on form completion
  useEffect(() => {
    let progress = 0;
    if (email && isValidEmail(email)) progress += 0.33;
    if (password && password.length >= 6) progress += 0.33;
    if (confirmPassword && confirmPassword === password) progress += 0.34;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [email, password, confirmPassword]);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showCustomAlert("ข้อมูลไม่ครบถ้วน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (!isValidEmail(email)) {
      showCustomAlert("อีเมลไม่ถูกต้อง", "กรุณาใส่อีเมลที่ถูกต้อง");
      return;
    }

    if (password.length < 6) {
      showCustomAlert("รหัสผ่านสั้นเกินไป", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      showCustomAlert("รหัสผ่านไม่ตรงกัน", "กรุณาตรวจสอบรหัสผ่านอีกครั้ง");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        let errorMsg = "เกิดข้อผิดพลาดในการสมัครสมาชิก";
        if (error.message.includes("already registered")) {
          errorMsg = "อีเมลนี้ถูกใช้งานแล้ว";
        }
        showCustomAlert("สมัครสมาชิกไม่สำเร็จ", errorMsg);
      } else {
        showSuccessAlert();
      }
    } catch (err) {
      showCustomAlert("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อได้ในขณะนี้");
    } finally {
      setLoading(false);
    }
  };

  const showCustomAlert = (title, message) => {
    Alert.alert(title, message, [{ text: "ตลก", style: "default" }]);
  };

  const showSuccessAlert = () => {
    Alert.alert(
      "🎉 สมัครสมาชิกสำเร็จ!",
      "กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี",
      [{ text: "เข้าสู่ระบบ", onPress: () => router.replace("/login") }]
    );
  };

  const getFormProgress = () => {
    let completed = 0;
    if (email && isValidEmail(email)) completed++;
    if (password && password.length >= 6) completed++;
    if (confirmPassword && confirmPassword === password) completed++;
    return (completed / 3) * 100;
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />
        
        {/* Floating shapes for visual interest */}
        <View style={styles.shape1} />
        <View style={styles.shape2} />
        <View style={styles.shape3} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      { translateY: slideAnim }
                    ]
                  }
                ]}
              >
                {/* Glass Card Effect */}
                <BlurView intensity={20} style={styles.glassCard}>
                  {/* Header */}
                  <View style={styles.header}>
                    <View style={styles.logoContainer}>
                      <View style={styles.logoWrapper}>
                        <Image
                          source={require("../../assets/images/Intro.png")}
                          style={styles.logo}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.title}>สร้างบัญชีใหม่</Text>
                    <Text style={styles.subtitle}>เริ่มต้นการเดินทางของคุณ</Text>
                    
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressTrack}>
                        <Animated.View 
                          style={[
                            styles.progressFill,
                            {
                              width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                                extrapolate: 'clamp',
                              })
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(getFormProgress())}% เสร็จสิ้น
                      </Text>
                    </View>
                  </View>

                  {/* Form Fields */}
                  <View style={styles.formFields}>
                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>อีเมล</Text>
                      <View style={[
                        styles.inputContainer,
                        email && isValidEmail(email) && styles.inputValid,
                        email && !isValidEmail(email) && email.length > 0 && styles.inputInvalid
                      ]}>
                        <MaterialIcons name="email" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                          style={styles.input}
                          placeholder="your@email.com"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={email}
                          onChangeText={setEmail}
                        />
                        {email && isValidEmail(email) && (
                          <Feather name="check-circle" size={20} color="#4ade80" />
                        )}
                      </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>รหัสผ่าน</Text>
                      <View style={[
                        styles.inputContainer,
                        password && password.length >= 6 && styles.inputValid,
                        password && password.length > 0 && password.length < 6 && styles.inputInvalid
                      ]}>
                        <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                          style={styles.input}
                          placeholder="อย่างน้อย 6 ตัวอักษร"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          secureTextEntry={!showPassword}
                          value={password}
                          onChangeText={setPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          style={styles.eyeButton}
                        >
                          <Feather 
                            name={showPassword ? "eye" : "eye-off"} 
                            size={20} 
                            color="rgba(255,255,255,0.7)" 
                          />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Password Strength */}
                      {password && (
                        <View style={styles.passwordStrength}>
                          <View style={styles.strengthDots}>
                            {[1, 2, 3, 4].map((dot) => (
                              <View
                                key={dot}
                                style={[
                                  styles.strengthDot,
                                  password.length >= dot * 2 && styles.strengthDotActive,
                                  password.length >= 8 && dot <= 4 && styles.strengthDotStrong
                                ]}
                              />
                            ))}
                          </View>
                          <Text style={styles.strengthText}>
                            {password.length < 4 ? 'อ่อน' : 
                             password.length < 8 ? 'ปานกลาง' : 'แข็งแกร่ง'}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
                      <View style={[
                        styles.inputContainer,
                        confirmPassword && confirmPassword === password && styles.inputValid,
                        confirmPassword && confirmPassword !== password && confirmPassword.length > 0 && styles.inputInvalid
                      ]}>
                        <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" />
                        <TextInput
                          style={styles.input}
                          placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          secureTextEntry={!showConfirmPassword}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeButton}
                        >
                          <Feather 
                            name={showConfirmPassword ? "eye" : "eye-off"} 
                            size={20} 
                            color="rgba(255,255,255,0.7)" 
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        loading && styles.registerButtonDisabled
                      ]}
                      onPress={handleRegister}
                      disabled={loading}
                      activeOpacity={0.9}
                    >
                      <LinearGradient
                        colors={loading ? ['#94a3b8', '#64748b'] : ['#f093fb', '#f5576c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                      >
                        {loading ? (
                          <View style={styles.loadingContent}>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.buttonText}>กำลังสมัคร...</Text>
                          </View>
                        ) : (
                          <Text style={styles.buttonText}>สมัครสมาชิก</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>มีบัญชีอยู่แล้ว? </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                      <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height * 1.2,
  },
  shape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: height * 0.1,
    left: -50,
  },
  shape2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: height * 0.6,
    right: -30,
  },
  shape3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: height * 0.3,
    right: width * 0.3,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 24,
    padding: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logo: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  formFields: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputValid: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  inputInvalid: {
    borderColor: '#f87171',
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 4,
  },
  strengthDotActive: {
    backgroundColor: '#fbbf24',
  },
  strengthDotStrong: {
    backgroundColor: '#4ade80',
  },
  strengthText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  registerButton: {
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#f5576c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  loginLink: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});