import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AuthWrapper from "../../components/AuthWrapper";
import { supabase } from "../../config/supabaseClient";

export default function AddNewPetForm() {
  const { user } = useUser();
  const [petName, setPetName] = useState("");
  const [category, setCategory] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState("");
  const [address, setAddress] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadImageToSupabase = async (uri) => {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    const fileName = `${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from("pets-images")
      .upload(fileName, arrayBuffer, {
        contentType: "image/jpeg",
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from("pets-images")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const submitPet = async () => {
    if (
      !petName ||
      !category ||
      !breed ||
      !age ||
      !weight ||
      !sex ||
      !address ||
      !desc ||
      !image
    ) {
      return Alert.alert("ไม่สำเร็จ", "กรุณากรอกข้อมูลให้ครบทุกช่องนะคะ 😊");
    }

    setUploading(true);

    try {
      const imageUrl = await uploadImageToSupabase(image.uri);

      const { error } = await supabase.from("pets").insert([
        {
          name: petName,
          category: category,
          breed: breed,
          age: parseInt(age),
          weight: parseFloat(weight),
          sex: sex,
          address: address,
          about: desc,
          image_url: imageUrl,
          username: user.fullName || user.firstName || "Unknown",
          email: user.primaryEmailAddress?.emailAddress || "",
          userImage: user.imageUrl || "",
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      Alert.alert("สำเร็จ! 🎉", "เพิ่มข้อมูลสัตว์เลี้ยงเรียบร้อยแล้ว");

      setPetName("");
      setCategory("");
      setBreed("");
      setAge("");
      setWeight("");
      setSex("");
      setAddress("");
      setDesc("");
      setImage(null);
    } catch (error) {
      Alert.alert("เกิดข้อผิดพลาด", error.message);
    }

    setUploading(false);
  };

  const CategoryButton = ({ icon, label, value }) => (
    <TouchableOpacity
      style={[
        styles.categoryBtn,
        category === value && styles.categoryBtnActive,
      ]}
      onPress={() => setCategory(value)}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text
        style={[
          styles.categoryText,
          category === value && styles.categoryTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SexButton = ({ label, value }) => (
    <TouchableOpacity
      style={[styles.sexBtn, sex === value && styles.sexBtnActive]}
      onPress={() => setSex(value)}
    >
      <Text style={[styles.sexText, sex === value && styles.sexTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AuthWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>เพิ่มสัตว์เลี้ยง</Text>
            <Text style={styles.subtitle}>กรอกข้อมูลน้องสัตว์ของคุณ</Text>
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageIcon}>📸</Text>
                <Text style={styles.imageText}>แตะเพื่อเลือกรูปภาพ</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Pet Name */}
          <View style={styles.section}>
            <Text style={styles.label}>ชื่อ</Text>
            <TextInput
              placeholder="ชื่อของน้องสัตว์"
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>ประเภท</Text>
            <View style={styles.categoryContainer}>
              <CategoryButton icon="🐕" label="สุนัข" value="Dog" />
              <CategoryButton icon="🐈" label="แมว" value="Cat" />
              <CategoryButton icon="🐦" label="นก" value="Bird" />
              <CategoryButton icon="🐰" label="อื่นๆ" value="Other" />
            </View>
          </View>

          {/* Breed */}
          <View style={styles.section}>
            <Text style={styles.label}>สายพันธุ์</Text>
            <TextInput
              placeholder="เช่น โกลเด้น รีทรีฟเวอร์"
              style={styles.input}
              value={breed}
              onChangeText={setBreed}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Age and Weight */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>อายุ (ปี)</Text>
              <TextInput
                placeholder="0"
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>น้ำหนัก (kg)</Text>
              <TextInput
                placeholder="0.0"
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Sex */}
          <View style={styles.section}>
            <Text style={styles.label}>เพศ</Text>
            <View style={styles.sexContainer}>
              <SexButton label="ผู้" value="Male" />
              <SexButton label="เมีย" value="Female" />
            </View>
          </View>

          {/* Address */}
          <View style={styles.section}>
            <Text style={styles.label}>ที่อยู่</Text>
            <TextInput
              placeholder="เช่น กรุงเทพมหานคร"
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              placeholder="บอกเล่าเกี่ยวกับน้องสัตว์ของคุณ..."
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              value={desc}
              onChangeText={setDesc}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
            onPress={submitPet}
            disabled={uploading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitText}>
              {uploading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>
    </AuthWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imageText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 10,
  },
  categoryBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  categoryBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#8B5CF6",
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
  },
  sexContainer: {
    flexDirection: "row",
    gap: 12,
  },
  sexBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  sexBtnActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#8B5CF6",
  },
  sexText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  sexTextActive: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
