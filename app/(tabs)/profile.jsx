import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { createClerkSupabaseClient } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 8) / 3;

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken, signOut } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [user]);

  const fetchPosts = async (supabase, userId) => {
    const { data, error } = await supabase
      .from("pets")
      .select(
        `
      id,
      image_url,
      images,
      video_url,
      name,
      post_status,
      created_at
    `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setPosts(data || []);
  };

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "กรุณาอนุญาตเข้าถึงคลังภาพ");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploading(true);

      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);
      const uri = result.assets[0].uri;
      const filename = `avatars/${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(
          filename,
          { uri, type: "image/jpeg", name: filename },
          { upsert: true }
        );

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filename);
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfileUser((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      Alert.alert("สำเร็จ", "อัปเดตรูปโปรไฟล์แล้ว");
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);
      if (user?.id) await fetchPosts(supabase, user.id);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !profileUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 🪪 Profile Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri:
                  user?.imageUrl ||
                  profileUser.avatar_url ||
                  "https://www.gravatar.com/avatar/?d=mp",
              }}
              style={styles.avatar}
            />
            {uploading && (
              <View style={styles.overlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>
          {user?.fullName || profileUser?.full_name || "ผู้ใช้ไม่ระบุชื่อ"}
        </Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
        <Text style={styles.bio}>
          {profileUser.bio || "ยังไม่มีคำอธิบายส่วนตัว"}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>โพสต์</Text>
          </View>
        </View>

        {/* ปุ่ม */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile/EditProfile")}
            style={styles.primaryButton}
          >
            <Ionicons name="create-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>แก้ไขโปรไฟล์</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🖼️ โพสต์ */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>โพสต์ของฉัน</Text>

        {posts.length ? (
          <FlatList
            data={posts}
            numColumns={3}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/pet-details",
                    params: { id: item.id },
                  })
                }
                style={styles.postItem}
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.postImage}
                />
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={50} color="#aaa" />
            <Text style={styles.emptyText}>ยังไม่มีโพสต์</Text>
            <TouchableOpacity
              onPress={() => router.push("/add-new-pet")}
              style={styles.newPostButton}
            >
              <Text style={styles.newPostText}>สร้างโพสต์แรก</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA", paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: Colors.PURPLE },

  profileCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 25,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PURPLE,
    borderRadius: 14,
    padding: 6,
  },
  name: { fontSize: 20, fontWeight: "700", marginTop: 12, color: "#333" },
  email: { color: "#777", fontSize: 14, marginTop: 2 },
  bio: {
    color: "#555",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-around",
    width: "80%",
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: Colors.PURPLE },
  statLabel: { color: "#666", fontSize: 13, marginTop: 3 },

  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.PURPLE,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  logoutButton: {
    backgroundColor: "#f35b5b",
    padding: 10,
    borderRadius: 10,
  },

  postsSection: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  postItem: {
    width: imageSize,
    height: imageSize,
    margin: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  postImage: { width: "100%", height: "100%" },
  emptyState: { alignItems: "center", paddingVertical: 50 },
  emptyText: { color: "#777", marginTop: 10, fontSize: 16 },
  newPostButton: {
    backgroundColor: Colors.PURPLE,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
  },
  newPostText: { color: "#fff", fontWeight: "600" },
});
