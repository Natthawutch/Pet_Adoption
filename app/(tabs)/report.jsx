import { useAuth, useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { createClerkSupabaseClient } from "../../config/supabaseClient";

const ANIMAL_OPTIONS = ["สุนัข", "แมว", "อื่นๆ"];

export default function Report() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [animalType, setAnimalType] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    (async () => {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "ไม่สามารถเข้าถึงตำแหน่งได้",
          "กรุณาเปิดการเข้าถึงตำแหน่งในการตั้งค่า"
        );
        setLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLocating(false);
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!animalType || !image || !location) {
      Alert.alert(
        "ข้อมูลไม่ครบ",
        "กรุณาเลือกประเภทสัตว์ เพิ่มรูป และระบุตำแหน่ง"
      );
      return;
    }

    try {
      setLoading(true);
      const supabase = createClerkSupabaseClient({ getToken });

      const fileExt = image.uri.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const img = await fetch(image.uri);
      const blob = await img.blob();

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(fileName, blob, { contentType: `image/${fileExt}` });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from("report-images")
        .getPublicUrl(fileName);

      const { error } = await supabase.from("reports").insert({
        user_id: user.id,
        animal_type: animalType,
        detail,
        image_url: publicUrl.publicUrl,
        latitude: location.latitude,
        longitude: location.longitude,
        status: "pending",
      });

      if (error) throw error;

      Alert.alert(
        "สำเร็จ",
        "เจ้าหน้าที่จะรีบตรวจสอบพิกัด ขอบคุณที่ช่วยเหลือน้องๆ ครับ ❤️"
      );
      setAnimalType("");
      setDetail("");
      setImage(null);
    } catch (err) {
      Alert.alert("ผิดพลาด", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>แจ้งช่วยเหลือสัตว์</Text>
        <Text style={styles.headerSubtitle}>
          ระบุรายละเอียดเพื่อให้อาสาเข้าถึงพื้นที่ได้แม่นยำ
        </Text>

        {/* Upload Section */}
        <Pressable
          style={[styles.imageBox, image && styles.imageBoxActive]}
          onPress={pickImage}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.cameraCircle}>
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
              <Text style={styles.uploadText}>กดเพื่อถ่ายรูปหรือเลือกรูป</Text>
            </View>
          )}
        </Pressable>

        {/* Animal Type Section */}
        <Text style={styles.sectionLabel}>ประเภทสัตว์</Text>
        <View style={styles.chipGroup}>
          {ANIMAL_OPTIONS.map((type) => (
            <Pressable
              key={type}
              style={[styles.chip, animalType === type && styles.chipActive]}
              onPress={() => setAnimalType(type)}
            >
              <Text
                style={[
                  styles.chipText,
                  animalType === type && styles.chipTextActive,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Detail Section */}
        <Text style={styles.sectionLabel}>
          รายละเอียด (เช่น อาการบาดเจ็บ, จุดสังเกต)
        </Text>
        <TextInput
          placeholder="ระบุเพิ่มเติม..."
          style={[styles.input, styles.textArea]}
          multiline
          value={detail}
          onChangeText={setDetail}
          placeholderTextColor="#9ca3af"
        />

        {/* Status Location Section */}
        <View style={styles.locationContainer}>
          <Ionicons
            name="location"
            size={20}
            color={location ? "#10b981" : "#ef4444"}
          />

          {locating ? (
            <>
              <Text style={[styles.locationText, { color: "#6b7280" }]}>
                กำลังดึงตำแหน่ง GPS...
              </Text>
              <ActivityIndicator
                size="small"
                color="#6b7280"
                style={{ marginLeft: 8 }}
              />
            </>
          ) : location ? (
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationText, { color: "#065f46" }]}>
                พิกัดที่แจ้ง
              </Text>
              <Text style={styles.coordText}>
                Lat: {location.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordText}>
                Lng: {location.longitude.toFixed(6)}
              </Text>

              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
                  )
                }
                style={styles.mapLink}
              >
                <Ionicons name="map" size={14} color="#2563eb" />
                <Text style={styles.mapLinkText}>ดูตำแหน่งบนแผนที่</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={[styles.locationText, { color: "#b91c1c" }]}>
              ไม่สามารถเข้าถึงพิกัดได้
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          style={[
            styles.button,
            (loading || locating) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || locating}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>ส่งรายงาน</Text>
              <Ionicons
                name="send"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#1f2937" },
  headerSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 25,
    marginTop: 4,
  },
  imageBox: {
    height: 220,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  imageBoxActive: { borderStyle: "solid", borderColor: "#ef4444" },
  image: { width: "100%", height: "100%" },
  uploadPlaceholder: { alignItems: "center" },
  cameraCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  uploadText: { color: "#6b7280", fontWeight: "600" },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  chipGroup: { flexDirection: "row", gap: 10, marginBottom: 20 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#ef4444", borderColor: "#ef4444" },
  chipText: { color: "#4b5563", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  input: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 25,
  },
  locationText: { marginLeft: 8, fontWeight: "600", fontSize: 14 },
  button: {
    backgroundColor: "#ef4444",
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  coordText: {
    fontSize: 13,
    color: "#065f46",
    marginLeft: 28,
    marginTop: 2,
  },
  mapLink: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 28,
    marginTop: 6,
  },
  mapLinkText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },

  buttonDisabled: { backgroundColor: "#fda4af" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
