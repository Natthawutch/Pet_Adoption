import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const { width, height } = Dimensions.get("window");

export default function AddNewPet() {
  const [categoryList, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Dogs");
  const navigation = useNavigation();
  const router = useRouter();

  // Initial form data state
  const initialFormData = {
    category: "Dogs",
    sex: "Male",
    name: "",
    breed: "",
    age: "",
    weight: "",
    address: "",
    about: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [gender, setGender] = useState("Male");
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [user, setUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const totalSteps = 3;
  const stepTitles = [
    "รูปภาพและข้อมูลพื้นฐาน",
    "ข้อมูลสุขภาพและที่อยู่",
    "รายละเอียดเพิ่มเติม",
  ];

  useEffect(() => {
    requestPermissions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "เพิ่มสัตว์เลี้ยงใหม่",
      headerTitleStyle: {
        fontFamily: "outfit-medium",
        fontSize: 18,
      },
      headerStyle: {
        backgroundColor: Colors.WHITE,
        elevation: 0,
        shadowOpacity: 0,
      },
    });
    getCategories();
    fetchUser();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "ต้องการสิทธิ์การเข้าถึง",
          "แอปต้องการสิทธิ์ในการเข้าถึงรูปภาพเพื่อเลือกรูปสัตว์เลี้ยง",
          [{ text: "ตกลง" }]
        );
      }
    } catch (error) {
      console.log("Permission error:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.replace("/login");
      }
    } catch (error) {
      console.log("User fetch error:", error);
    }
  };

  const getCategories = async () => {
    try {
      const { data, error } = await supabase.from("category").select("*");
      if (data) {
        setCategories(data);
      }
      if (error) {
        console.log("Error fetching categories:", error);
        ToastAndroid.show("ไม่สามารถโหลดหมวดหมู่ได้", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log("Categories error:", error);
    }
  };

  // Function to reset the form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedCategory("Dogs");
    setGender("Male");
    setImage(null);
    setFormErrors({});
    setCurrentStep(1);
    setShowCategoryModal(false);
    setShowGenderModal(false);

    // Reset animation
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const imagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        if (
          selectedImage.fileSize &&
          selectedImage.fileSize > 5 * 1024 * 1024
        ) {
          ToastAndroid.show(
            "รูปภาพใหญ่เกินไป กรุณาเลือกรูปที่เล็กกว่า 5MB",
            ToastAndroid.LONG
          );
          return;
        }

        setImage(selectedImage.uri);
        setFormErrors((prev) => ({ ...prev, image: null }));
      }
    } catch (error) {
      console.log("Image picker error:", error);
      ToastAndroid.show("ไม่สามารถเลือกรูปภาพได้", ToastAndroid.SHORT);
    }
  };

  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));

    if (formErrors[fieldName]) {
      setFormErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 1:
        if (!image) errors.image = "กรุณาเลือกรูปภาพ";
        if (!formData.name.trim()) errors.name = "กรุณากรอกชื่อสัตว์เลี้ยง";
        if (!formData.breed.trim()) errors.breed = "กรุณากรอกสายพันธุ์";
        break;
      case 2:
        if (
          !formData.age ||
          isNaN(formData.age) ||
          parseFloat(formData.age) <= 0
        ) {
          errors.age = "กรุณากรอกอายุที่ถูกต้อง";
        }
        if (
          !formData.weight ||
          isNaN(formData.weight) ||
          parseFloat(formData.weight) <= 0
        ) {
          errors.weight = "กรุณากรอกน้ำหนักที่ถูกต้อง";
        }
        if (!formData.address.trim()) errors.address = "กรุณากรอกที่อยู่";
        break;
      case 3:
        if (!formData.about.trim()) errors.about = "กรุณากรอกรายละเอียด";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        onSubmit();
      }
    } else {
      ToastAndroid.show("กรุณาตรวจสอบข้อมูลให้ครบถ้วน", ToastAndroid.SHORT);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    setLoader(true);
    try {
      await uploadImageToSupabase();
    } catch (error) {
      console.log("Submit error:", error);
      ToastAndroid.show("เกิดข้อผิดพลาด กรุณาลองใหม่", ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const uploadImageToSupabase = async () => {
    try {
      const fileUri = image;
      const fileType = fileUri.split(".").pop().toLowerCase();
      const timestamp = Date.now();
      const fileName = `pets/${timestamp}.${fileType}`;

      const file = {
        uri: fileUri,
        type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
        name: `pet_${timestamp}.${fileType}`,
      };

      const { data, error } = await supabase.storage
        .from("pets")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("pets")
        .getPublicUrl(fileName);

      await saveToDatabase(publicUrlData.publicUrl);
    } catch (error) {
      console.log("Upload error:", error);
      ToastAndroid.show("ไม่สามารถอัปโหลดรูปภาพได้", ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const saveToDatabase = async (imageUrl) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        ToastAndroid.show("กรุณาเข้าสู่ระบบใหม่", ToastAndroid.SHORT);
        router.replace("/login");
        return;
      }

      const petData = {
        ...formData,
        image_url: imageUrl,
        username: user.user_metadata?.full_name || user.email,
        email: user.email,
        userImage: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("pets")
        .insert(petData)
        .select();

      if (error) throw error;

      ToastAndroid.show("เพิ่มสัตว์เลี้ยงสำเร็จ!", ToastAndroid.SHORT);

      // Reset form after successful submission
      resetForm();

      // Navigate back to home after a short delay to show the success message
      setTimeout(() => {
        router.replace("/(tabs)/home");
      }, 1500);
    } catch (error) {
      console.error("Database error:", error);
      ToastAndroid.show("เกิดข้อผิดพลาด: " + error.message, ToastAndroid.LONG);
    } finally {
      setLoader(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(currentStep / totalSteps) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep} จาก {totalSteps}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>📷 รูปภาพสัตว์เลี้ยง</Text>
        <Pressable style={styles.imagePicker} onPress={imagePicker}>
          {!image ? (
            <View style={styles.imagePickerContent}>
              <View style={styles.imagePickerIcon}>
                <Ionicons
                  name="camera"
                  size={32}
                  color={Colors.PRIMARY || "#6366f1"}
                />
              </View>
              <Text style={styles.imagePickerText}>แตะเพื่อเลือกรูปภาพ</Text>
              <Text style={styles.imagePickerSubtext}>รองรับไฟล์ JPG, PNG</Text>
            </View>
          ) : (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <View style={styles.imageOverlay}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.SUCCESS || "#10b981"}
                />
              </View>
            </View>
          )}
        </Pressable>
        {formErrors.image && (
          <Text style={styles.errorText}>{formErrors.image}</Text>
        )}
      </View>

      <EnhancedFormInput
        label="🐾 ชื่อสัตว์เลี้ยง"
        field="name"
        value={formData.name}
        onChange={handleInputChange}
        error={formErrors.name}
        placeholder="เช่น มิโกะ, บอล, แมวเหมียว"
        icon="heart"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>🐕 ประเภทสัตว์เลี้ยง</Text>
        <TouchableOpacity
          style={styles.customPickerButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.customPickerText}>{selectedCategory}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.GRAY} />
        </TouchableOpacity>
      </View>

      <EnhancedFormInput
        label="🎯 สายพันธุ์"
        field="breed"
        value={formData.breed}
        onChange={handleInputChange}
        error={formErrors.breed}
        placeholder="เช่น ชิวาว่า, เปอร์เซีย, ไทยหลังอาน"
        icon="paw"
      />
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <EnhancedFormInput
            label="📅 อายุ (ปี)"
            field="age"
            value={formData.age}
            onChange={handleInputChange}
            error={formErrors.age}
            keyboardType="numeric"
            placeholder="2"
            icon="time"
          />
        </View>
        <View style={styles.halfWidth}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>⚥ เพศ</Text>
            <TouchableOpacity
              style={styles.customPickerButton}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.customPickerText}>
                {gender === "Male" ? "ผู้" : "เมีย"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.GRAY} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <EnhancedFormInput
        label="⚖️ น้ำหนัก (กิโลกรัม)"
        field="weight"
        value={formData.weight}
        onChange={handleInputChange}
        error={formErrors.weight}
        keyboardType="numeric"
        placeholder="3.5"
        icon="fitness"
      />

      <EnhancedFormInput
        label="📍 ที่อยู่"
        field="address"
        value={formData.address}
        onChange={handleInputChange}
        error={formErrors.address}
        placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
        icon="location"
      />
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: fadeAnim }]}>
      <EnhancedFormInput
        label="📝 รายละเอียดเพิ่มเติม"
        field="about"
        value={formData.about}
        onChange={handleInputChange}
        error={formErrors.about}
        multiline
        placeholder="บอกเล่าเกี่ยวกับสัตว์เลี้ยงของคุณ เช่น นิสัย สุขภาพ ความชอบ หรือความต้องการพิเศษ..."
        icon="document-text"
      />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>สรุปข้อมูล</Text>
        <View style={styles.summaryRow}>
          <Ionicons name="paw" size={16} color={Colors.PRIMARY} />
          <Text style={styles.summaryText}>
            {formData.name} • {formData.breed}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="time" size={16} color={Colors.PRIMARY} />
          <Text style={styles.summaryText}>
            {formData.age} ปี • {gender === "Male" ? "ผู้" : "เมีย"} •{" "}
            {formData.weight} กก.
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Ionicons name="location" size={16} color={Colors.PRIMARY} />
          <Text style={styles.summaryText}>{formData.address}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{stepTitles[currentStep - 1]}</Text>
        {renderProgressBar()}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={prevStep}>
            <Ionicons name="chevron-back" size={20} color={Colors.PRIMARY} />
            <Text style={styles.backButtonText}>ย้อนกลับ</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 1 && styles.nextButtonFull,
          ]}
          disabled={loader}
          onPress={nextStep}
        >
          {loader ? (
            <ActivityIndicator size="small" color={Colors.WHITE} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === totalSteps ? "เพิ่มสัตว์เลี้ยง" : "ต่อไป"}
              </Text>
              <Ionicons
                name={
                  currentStep === totalSteps ? "checkmark" : "chevron-forward"
                }
                size={20}
                color={Colors.WHITE}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือกประเภทสัตว์เลี้ยง</Text>
            {categoryList.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(cat.name);
                  handleInputChange("category", cat.name);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{cat.name}</Text>
                {selectedCategory === cat.name && (
                  <Ionicons name="checkmark" size={20} color={Colors.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Gender Modal */}
      <Modal visible={showGenderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือกเพศ</Text>
            {["Male", "Female"].map((sex, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalOption}
                onPress={() => {
                  setGender(sex);
                  handleInputChange("sex", sex);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {sex === "Male" ? "ผู้" : "เมีย"}
                </Text>
                {gender === sex && (
                  <Ionicons name="checkmark" size={20} color={Colors.PRIMARY} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EnhancedFormInput({
  label,
  field,
  value,
  onChange,
  error,
  keyboardType = "default",
  multiline = false,
  placeholder = "",
  icon = "document",
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputIconContainer}>
          <Ionicons name={icon} size={18} color={Colors.GRAY} />
        </View>
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.textInputMultiline,
            error && styles.textInputError,
          ]}
          value={value}
          onChangeText={(val) => onChange(field, val)}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor={Colors.GRAY}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingTop: 40, // เพิ่มช่องว่างด้านบนเพื่อไม่ให้ทับกับสถานะบาร์
  },
  headerTitle: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    color: "#1f2937",
    marginBottom: 15,
    textAlign: "center",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
  },
  progressText: {
    fontFamily: "outfit-medium",
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContainer: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: "outfit-bold",
    fontSize: 18,
    color: "#1f2937",
    marginBottom: 15,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    backgroundColor: Colors.WHITE,
    overflow: "hidden",
  },
  imagePickerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f4f6",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  imagePickerText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "#374151",
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#9ca3af",
  },
  selectedImageContainer: {
    flex: 1,
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: "outfit-bold",
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: "outfit",
    fontSize: 16,
    color: "#1f2937",
  },
  textInputMultiline: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  textInputError: {
    borderColor: "#ef4444",
  },
  customPickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customPickerText: {
    fontFamily: "outfit",
    fontSize: 16,
    color: "#1f2937",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  summaryCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontFamily: "outfit-bold",
    fontSize: 18,
    color: "#1f2937",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    flex: 0.4,
  },
  backButtonText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: Colors.PRIMARY || "#6366f1",
    marginLeft: 5,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    flex: 0.55,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontFamily: "outfit-bold",
    fontSize: 16,
    color: Colors.WHITE,
    marginRight: 8,
  },
  errorText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#ef4444",
    marginTop: 5,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalOptionText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "#374151",
  },
});
