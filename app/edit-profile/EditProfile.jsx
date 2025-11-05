import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
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
import { createClerkSupabaseClient } from "../../config/supabaseClient";

export default function EditProfile() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ✅ ดึงข้อมูลโปรไฟล์จาก Supabase
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const { data, error } = await supabase
        .from("profiles")
        .select("phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || user.imageUrl);
      } else {
        await supabase.from("profiles").insert([
          {
            id: user.id,
            display_name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
            avatar_url: user.imageUrl,
          },
        ]);
        setAvatarUrl(user.imageUrl);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  // ✅ อัปโหลดรูปภาพไปยัง Supabase Storage (ไม่ใช้ Buffer หรือ Base64)
  // ✅ อัปโหลดรูปภาพไปยัง Supabase Storage (เวอร์ชันใช้งานจริง)
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("กรุณาอนุญาตเข้าถึงคลังภาพ");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;
      setUploading(true);

      const uri = result.assets[0].uri;
      const filename = `${user.id}-${Date.now()}.jpg`;

      const token = await getToken({ template: "supabase" });
      const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });

      // ✅ อัปโหลดไปยัง bucket "avatars"
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/avatars/${filename}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_KEY,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Upload error:", errText);
        throw new Error("Upload failed: " + errText);
      }

      // ✅ public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${filename}`;

      const supabase = createClerkSupabaseClient(token);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      Alert.alert("สำเร็จ", "อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("เกิดข้อผิดพลาด", err.message || "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  // ✅ บันทึกข้อมูลโปรไฟล์
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        avatar_url: avatarUrl,
        phone: phone.trim(),
        last_sign_in_at: new Date().toISOString(),
      });

      if (error) throw error;

      Alert.alert("สำเร็จ", "บันทึกข้อมูลโปรไฟล์แล้ว", [
        { text: "ตกลง", onPress: () => router.push("/(tabs)/profile") },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("บันทึกล้มเหลว", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading && !user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
              <Ionicons name="arrow-back" size={26} color="#1e293b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploading}
              style={styles.avatarContainer}
            >
              <Image
                source={{
                  uri:
                    avatarUrl ||
                    user.imageUrl ||
                    "https://www.gravatar.com/avatar/?d=mp",
                }}
                style={styles.avatar}
              />
              {uploading && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator color="#fff" />
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
            <Text style={styles.label}>ชื่อ - นามสกุล</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#f9fafb" }]}
              value={user?.fullName || ""}
              editable={false}
            />

            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={[styles.input, { backgroundColor: "#f9fafb" }]}
              value={user?.primaryEmailAddress?.emailAddress || ""}
              editable={false}
            />

            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.input}
              placeholder="กรอกเบอร์โทรศัพท์"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
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
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
    color: "#1e293b",
  },
  avatarSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
  },
  avatarContainer: { position: "relative" },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  changePhotoText: { color: "#6366f1", fontWeight: "600" },
  formSection: { backgroundColor: "#fff", marginTop: 10, padding: 20 },
  label: { fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#1f2937",
  },
  saveButton: {
    backgroundColor: "#6366f1",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
