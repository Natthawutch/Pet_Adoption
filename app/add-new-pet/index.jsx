import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { db, storage } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

import { supabase } from "../../config/supabaseClient"; // import supabase client

export default function AddNewPet() {
  const [categoryList, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Dogs");
  const navigation = useNavigation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    category: "Dogs",
    sex: "Male",
  });
  const [gender, setGender] = useState("Male");
  const [image, setImage] = useState(null);
  const [loader, setLoader] = useState(false);

  // State เก็บข้อมูล user จาก Supabase
  const [user, setUser] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Add New Pet",
    });
    GetCategories();

    // ดึงข้อมูล user จาก Supabase Auth
    const sessionUser = supabase.auth.user();
    if (sessionUser) {
      setUser(sessionUser);
    } else {
      router.replace("/login"); // ถ้าไม่ login ให้ไปหน้า login
    }
  }, []);

  const GetCategories = async () => {
    setCategories([]);
    const snapshot = await getDocs(collection(db, "Category"));
    snapshot.forEach((doc) => {
      setCategories((prevList) => [...prevList, doc.data()]);
    });
  };

  /**
   * used to pick image from gallery
   */
  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const onsubmit = () => {
    // ตรวจสอบครบ 8 ฟิลด์ไหม
    if (Object.keys(formData).length !== 8) {
      ToastAndroid.show("Enter All Details", ToastAndroid.SHORT);
      return;
    }
    if (!image) {
      ToastAndroid.show("Please select an image", ToastAndroid.SHORT);
      return;
    }
    UploadImage();
  };

  /**
   * Used to upload Pet Image to Firebase Storage (server)
   */
  const UploadImage = async () => {
    setLoader(true);

    try {
      const resp = await fetch(image);
      const blobImage = await resp.blob();
      const storageRef = ref(storage, "/PetAdopt" + Date.now() + ".jpg");

      await uploadBytes(storageRef, blobImage);

      const downloadUrl = await getDownloadURL(storageRef);
      SaveFormData(downloadUrl);
    } catch (error) {
      ToastAndroid.show("Upload failed: " + error.message, ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const SaveFormData = async (imageUrl) => {
    const docId = Date.now().toString();
    await setDoc(doc(db, "Pets", docId), {
      ...formData,
      imageUrl: imageUrl,
      username: user?.user_metadata?.full_name || user?.email,
      email: user?.email,
      userImage: user?.user_metadata?.avatar_url || null,
      id: docId,
    });
    setLoader(false);
    router.replace("/(tabs)/home");
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 20 }}>
        Add New Pet for Adoption
      </Text>

      <Pressable onPress={imagePicker}>
        {!image ? (
          <Image
            source={require("../../assets/images/placeholder.png")}
            style={{
              width: 100,
              height: 100,
              borderRadius: 15,
              borderWidth: 1,
              borderColor: Colors.GRAY,
            }}
          />
        ) : (
          <Image
            source={{ uri: image }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 15,
            }}
          />
        )}
      </Pressable>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pet Name*</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleInputChange("name", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pet Category*</Text>
        <Picker
          selectedValue={selectedCategory}
          style={styles.input}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedCategory(itemValue);
            handleInputChange("category", itemValue);
          }}
        >
          {categoryList.map((category, index) => (
            <Picker.Item key={index} label={category.name} value={category.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Breed*</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleInputChange("breed", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age*</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => handleInputChange("age", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender*</Text>
        <Picker
          selectedValue={gender}
          style={styles.input}
          onValueChange={(itemValue, itemIndex) => {
            setGender(itemValue);
            handleInputChange("sex", itemValue);
          }}
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Weight*</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => handleInputChange("weight", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address*</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleInputChange("address", value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>About*</Text>
        <TextInput
          style={styles.input}
          numberOfLines={5}
          multiline={true}
          onChangeText={(value) => handleInputChange("about", value)}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        disabled={loader}
        onPress={onsubmit}
      >
        {loader ? (
          <ActivityIndicator size={"large"} />
        ) : (
          <Text
            style={{
              color: Colors.WHITE,
              textAlign: "center",
              fontFamily: "outfit-medium",
              fontSize: 16,
            }}
          >
            Submit
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 5,
  },
  input: {
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderColor: Colors.WHITE,
    borderRadius: 5,
    fontFamily: "outfit",
  },

  label: { marginVertical: 5, fontFamily: "outfit", fontSize: 16 },

  button: {
    padding: 15,
    backgroundColor: Colors.PURPLE,
    borderRadius: 7,
    marginVertical: 15,
    marginBottom: 50,
  },
});
