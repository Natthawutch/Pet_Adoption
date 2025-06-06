import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

export default function Profile() {
  const Menu = [
    { id: 1, name: "Add New Pet", icon: "add-circle", path: "/add-new-pet" },
    { id: 5, name: "My Post", icon: "bookmark", path: "/../user-post" },
    { id: 2, name: "Favorite Pets", icon: "heart", path: "/(tabs)/favorite" },

    {
      id: 9,
      name: "Help & Support",
      icon: "help-circle",
      path: "/help-support",
    },

    { id: 4, name: "Logout", icon: "exit", path: "/login" },
  ];

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          setUser(null);
        } else {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user]);

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "กรุณาอนุญาตให้เข้าถึงรูปภาพ");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: base64Image,
        },
      });

      if (error) {
        Alert.alert("Update Failed", error.message);
      } else {
        setUser((prev) => ({
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            avatar_url: base64Image,
          },
        }));
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
      </View>
    );
  }

  const onPressMenu = async (menu) => {
    if (menu.name.toLowerCase() === "logout") {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.replace("/login");
      } else {
        Alert.alert("Error", "ไม่สามารถออกจากระบบได้");
      }
      return;
    }

    router.push(menu.path);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text
        style={{
          paddingTop: 20,
          fontFamily: "outfit-medium",
          fontSize: 30,
        }}
      >
        Profile
      </Text>

      <View style={{ alignItems: "center", marginVertical: 25 }}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={{
              uri:
                user?.user_metadata?.avatar_url ||
                user?.avatar_url ||
                "https://placekitten.com/200/200",
            }}
            style={{ width: 80, height: 80, borderRadius: 99 }}
          />
        </TouchableOpacity>

        <Text style={{ fontFamily: "outfit-bold", fontSize: 20, marginTop: 6 }}>
          {user?.user_metadata?.full_name || user?.full_name || "No Name"}
        </Text>
        <Text
          style={{ fontFamily: "outfit", fontSize: 16, color: Colors.GRAY }}
        >
          {user?.email}
        </Text>

        {/* ปุ่มแก้ไขโปรไฟล์ */}
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={{
            marginTop: 12,
            backgroundColor: Colors.PURPLE,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: Colors.WHITE,
              fontFamily: "outfit-medium",
              fontSize: 16,
            }}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onPressMenu(item)}
            style={{
              marginVertical: 5,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: Colors.PURPLE,
              padding: 9,
              borderRadius: 10,
            }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={Colors.PURPLE}
              style={{
                padding: 10,
                backgroundColor: Colors.LIGHT_PURPLE,
                borderRadius: 8,
              }}
            />

            <Text
              style={{
                fontFamily: "outfit-medium",
                fontSize: 16,
                color: Colors.WHITE,
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
