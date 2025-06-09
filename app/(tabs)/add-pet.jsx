import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRouter } from "expo-router";
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
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

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
  const [user, setUser] = useState(null);

  // ขอ permission สำหรับ media library
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
      }
    })();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Add New Pet",
    });
    getCategories();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
    } else {
      router.replace("/login");
    }
  };

  const getCategories = async () => {
    const { data, error } = await supabase.from("category").select("*");
    if (data) setCategories(data);
    if (error) console.log("Error fetching categories:", error);
  };

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

  const onsubmit = async () => {
    // เช็คครบทุกฟิลด์
    const requiredFields = [
      "name",
      "category",
      "breed",
      "age",
      "sex",
      "weight",
      "address",
      "about",
    ];
    const allFilled = requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
    if (!allFilled) {
      ToastAndroid.show("Enter All Details", ToastAndroid.SHORT);
      return;
    }
    if (!image) {
      ToastAndroid.show("Please select an image", ToastAndroid.SHORT);
      return;
    }
    setLoader(true);
    await uploadImageToSupabase();
  };

  const uploadImageToSupabase = async () => {
    try {
      const resp = await fetch(image);
      const blob = await resp.blob();
      const filename = `pets/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from("pets")
        .upload(filename, blob, {
          contentType: "image/jpeg",
        });

      if (error) throw error;

      // ดึง public url ให้ถูกต้อง
      const { data: publicUrlData } = supabase.storage
        .from("pets")
        .getPublicUrl(filename);
      const publicUrl = publicUrlData.publicUrl;

      await saveToDatabase(publicUrl);
    } catch (err) {
      console.log("Upload error:", err);
      ToastAndroid.show("Upload failed", ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const saveToDatabase = async (imageUrl) => {
    const { error } = await supabase.from("pets").insert([
      {
        ...formData,
        imageUrl: imageUrl,
        username: user?.user_metadata?.full_name || user?.email,
        email: user?.email,
        userImage: user?.user_metadata?.avatar_url || null,
      },
    ]);

    setLoader(false);
    if (error) {
      console.log("Insert DB error:", error);
      ToastAndroid.show("Failed to save data", ToastAndroid.SHORT);
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text
        style={{
          paddingTop: 20,
          fontFamily: "outfit-medium",
          fontSize: 20,
          paddingBottom: 10,
        }}
      >
        Add New Pet for Adoption
      </Text>

      <Pressable onPress={imagePicker}>
        {!image ? (
          <Image
            source={require("../../assets/images/Intro.png")}
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
            style={{ width: 100, height: 100, borderRadius: 15 }}
          />
        )}
      </Pressable>

      <FormInput label="Pet Name*" field="name" onChange={handleInputChange} />
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pet Category*</Text>
        <Picker
          selectedValue={selectedCategory}
          style={styles.input}
          onValueChange={(itemValue) => {
            setSelectedCategory(itemValue);
            handleInputChange("category", itemValue);
          }}
        >
          {categoryList.map((cat, idx) => (
            <Picker.Item key={idx} label={cat.name} value={cat.name} />
          ))}
        </Picker>
      </View>

      <FormInput label="Breed*" field="breed" onChange={handleInputChange} />
      <FormInput
        label="Age*"
        field="age"
        onChange={handleInputChange}
        keyboardType="number-pad"
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender*</Text>
        <Picker
          selectedValue={gender}
          style={styles.input}
          onValueChange={(val) => {
            setGender(val);
            handleInputChange("sex", val);
          }}
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <FormInput
        label="Weight*"
        field="weight"
        onChange={handleInputChange}
        keyboardType="number-pad"
      />
      <FormInput
        label="Address*"
        field="address"
        onChange={handleInputChange}
      />
      <FormInput
        label="About*"
        field="about"
        onChange={handleInputChange}
        multiline
      />

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

function FormInput({
  label,
  field,
  onChange,
  keyboardType = "default",
  multiline = false,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 100 }]}
        onChangeText={(val) => onChange(field, val)}
        keyboardType={keyboardType}
        multiline={multiline}
      />
    </View>
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
