import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router"; // ✅ ใช้ router จาก expo-router
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function EditProfile() {
  const router = useRouter(); // ✅ ใช้แทน navigation
  const [user, setUser] = useState(null);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setUser(user);
          setEmail(user.email);
        } else {
          Alert.alert("ข้อผิดพลาด", "ไม่พบข้อมูลผู้ใช้");
        }
      } else {
        setUser(user);
        setFullname(data.fullname || "");
        setEmail(user.email || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("ขออภัย", "กรุณาอนุญาตการเข้าถึงรูปภาพ");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploading(true);
        const file = result.assets[0];
        const fileExtension = file.uri.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExtension}`;
        const filePath = `avatars/${fileName}`;

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, {
            contentType: `image/${fileExtension}`,
            upsert: true,
          });

        if (error) {
          Alert.alert("อัพโหลดล้มเหลว", error.message);
        } else {
          const { data: publicURLData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          setAvatarUrl(publicURLData.publicUrl);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการเลือกรูปภาพ");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullname.trim()) {
      Alert.alert("กรุณากรอกข้อมูล", "กรุณากรอกชื่อ-นามสกุล");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        fullname: fullname.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        Alert.alert("บันทึกล้มเหลว", error.message);
      } else {
        Alert.alert("สำเร็จ", "บันทึกโปรไฟล์เรียบร้อยแล้ว", [
          {
            text: "ตกลง",
            onPress: () => router.push("/(tabs)/profile"), // ✅ กลับหน้าโปรไฟล์
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
              <Text style={styles.headerSubtitle}>อัปเดตข้อมูลส่วนตัวของคุณ</Text>
            </View>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}
              disabled={uploading}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>📷</Text>
                  <Text style={styles.avatarPlaceholderSubtext}>เลือกรูป</Text>
                </View>
              )}
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={pickImage}
              disabled={uploading}
            >
              <Text style={styles.changePhotoText}>
                {uploading ? "กำลังอัปโหลด..." : "เปลี่ยนรูปภาพ"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อ - นามสกุล *</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกชื่อ-นามสกุล"
                value={fullname}
                onChangeText={setFullname}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>อีเมล</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="อีเมล"
                value={email}
                editable={false}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.inputHelper}>อีเมลไม่สามารถแก้ไขได้</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
              <TextInput
                style={styles.input}
                placeholder="กรอกเบอร์โทรศัพท์"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>บันทึกข้อมูล</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  avatarSection: {
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholderText: {
    fontSize: 30,
    marginBottom: 5,
  },
  avatarPlaceholderSubtext: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  changePhotoText: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "500",
  },
  formSection: {
    backgroundColor: "#fff",
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  disabledInput: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
  },
  inputHelper: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: "#6366f1",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 16,
  },
});
