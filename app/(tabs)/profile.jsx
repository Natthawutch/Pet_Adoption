import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const screenWidth = Dimensions.get("window").width;
const imageSize = screenWidth / 3 - 2;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) setUser(null);
      else setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        data: { avatar_url: base64Image },
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.replace("/login");
    else Alert.alert("Error", "ไม่สามารถออกจากระบบได้");
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("media_url")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
  };

  useEffect(() => {
    if (user?.id) fetchPosts();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", padding: 20, alignItems: "center" , paddingTop: 50 }}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={{
              uri:
                user?.user_metadata?.avatar_url ||
                user?.avatar_url ||
                "https://placekitten.com/200/200",
            }}
            style={{ width: 70, height: 70, borderRadius: 99 }}
          />
        </TouchableOpacity>

        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "outfit-bold", fontSize: 18 }}>{posts.length}</Text>
            <Text>Posts</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "outfit-bold", fontSize: 18 }}>0</Text>
            <Text>Followers</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: "outfit-bold", fontSize: 18 }}>0</Text>
            <Text>Following</Text>
          </View>
        </View>
      </View>

      {/* Username + Bio */}
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontFamily: "outfit-bold", fontSize: 18 }}>
          {user?.user_metadata?.full_name || user?.full_name || "No Name"}
        </Text>
        <Text style={{ fontFamily: "outfit", color: Colors.GRAY }}>
          {user?.email}
        </Text>
        <Text style={{ fontFamily: "outfit", marginTop: 4 }}>
          {user?.user_metadata?.bio || "🐾 Animal lover. Let’s find them homes!"}
        </Text>
      </View>

      {/* Edit Profile + Logout */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={{
            flex: 1,
            marginRight: 5,
            padding: 10,
            borderWidth: 1,
            borderColor: Colors.GRAY,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "outfit-medium" }}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flex: 1,
            marginLeft: 5,
            padding: 10,
            backgroundColor: Colors.PURPLE,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: Colors.WHITE, fontFamily: "outfit-medium" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Grid View */}
      <FlatList
        data={posts}
        numColumns={3}
        scrollEnabled={false}
        keyExtractor={(_, index) => index.toString()}
        columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 2 }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.media_url }}
            style={{
              width: imageSize,
              height: imageSize,
              margin: 1,
            }}
          />
        )}
      />
    </ScrollView>
  );
}
