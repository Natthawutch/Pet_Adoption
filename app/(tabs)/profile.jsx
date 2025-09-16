import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 6) / 3;

export default function Profile() {
  const router = useRouter();

  const [authUser, setAuthUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // ดึงข้อมูลผู้ใช้และโปรไฟล์
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ตรวจสอบการล็อกอิน
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error(authError?.message || "User not authenticated");
        }

        // ดึงข้อมูลโปรไฟล์พร้อมจำนวนผู้ติดตาม
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select(
            `
            *,
            followers:follows!follows_following_id_fkey(count),
            following:follows!follows_follower_id_fkey(count)
          `
          )
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setAuthUser(user);
        setProfileUser({
          ...profile,
          followers: profile.followers[0]?.count || 0,
          following: profile.following[0]?.count || 0,
        });

        // ดึงโพสต์
        await fetchPosts(user.id);
      } catch (error) {
        console.error("Failed to load profile:", error);
        Alert.alert("Error", "Failed to load user data");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ดึงโพสต์ของผู้ใช้
  const fetchPosts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("id, media_url, caption, created_at, likes")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  // อัปโหลดรูปโปรไฟล์ใหม่
  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Need camera roll access to upload images"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploading(true);
      const uri = result.assets[0].uri;
      const filename = `avatars/${authUser.id}/${Date.now()}.jpg`;

      // อัปโหลดไปยัง Storage
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(
          filename,
          {
            uri,
            type: "image/jpeg",
            name: filename,
          },
          {
            cacheControl: "3600",
            upsert: true,
          }
        );

      if (uploadError) throw uploadError;

      // ได้ public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("user-avatars").getPublicUrl(filename);

      // อัปเดตในตาราง users
      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", authUser.id);

      if (updateError) throw updateError;

      setProfileUser((prev) => ({ ...prev, avatar_url: publicUrl }));
      Alert.alert("Success", "Profile picture updated");
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Upload failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  // ออกจากระบบ
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("userSession");
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout failed", "Please try again");
    }
  };

  // รีเฟรชข้อมูล
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (authUser?.id) {
        await Promise.all([
          fetchPosts(authUser.id),
          // สามารถเพิ่มการดึงข้อมูลอื่นๆ ที่ต้องการรีเฟรชที่นี่
        ]);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !profileUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
        <Text style={styles.loadingText}>กำลังโหลดโปรไฟล์...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.PURPLE]}
          />
        }
      >
        {/* ส่วนหัวโปรไฟล์ */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      profileUser.avatar_url ||
                      "https://www.gravatar.com/avatar/?d=mp",
                  }}
                  style={styles.avatar}
                />
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                <View style={styles.editIcon}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>โพสต์</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileUser.followers}</Text>
              <Text style={styles.statLabel}>ผู้ติดตาม</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileUser.following}</Text>
              <Text style={styles.statLabel}>กำลังติดตาม</Text>
            </View>
          </View>
        </View>

        {/* ข้อมูลผู้ใช้ */}
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {profileUser.full_name || "ผู้ใช้ไม่ระบุชื่อ"}
          </Text>
          {authUser?.email && (
            <Text style={styles.email}>{authUser.email}</Text>
          )}
          <Text style={styles.bio}>
            {profileUser.bio || "ยังไม่มีข้อมูลส่วนตัว"}
          </Text>
        </View>

        {/* ปุ่มดำเนินการ */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={18} color={Colors.PURPLE} />
            <Text style={styles.editButtonText}>แก้ไขโปรไฟล์</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={18} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutButtonText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>

        {/* ส่วนโพสต์ */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Ionicons name="grid-outline" size={20} color="#666" />
            <Text style={styles.postsSectionTitle}>โพสต์ของฉัน</Text>
          </View>

          {posts.length > 0 ? (
            <FlatList
              data={posts}
              numColumns={3}
              scrollEnabled={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/post/${item.id}`)}
                  style={{
                    width: imageSize,
                    height: imageSize,
                    marginRight: (index + 1) % 3 === 0 ? 0 : 2,
                    marginBottom: 2,
                  }}
                >
                  <Image
                    source={{ uri: item.media_url }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateTitle}>ยังไม่มีโพสต์</Text>
              <Text style={styles.emptyStateSubtitle}>
                เริ่มแชร์รูปภาพแรกของคุณเลย!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/create-post")}
                style={styles.createPostButton}
              >
                <Text style={styles.createPostButtonText}>สร้างโพสต์</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.PURPLE,
  },
  header: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarWrapper: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PURPLE,
    borderRadius: 15,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userInfo: {
    padding: 20,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  bio: {
    fontSize: 16,
    color: "#444",
    marginTop: 8,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
  },
  editButtonText: {
    marginLeft: 6,
    color: Colors.PURPLE,
    fontWeight: "500",
  },
  settingsButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    marginLeft: 6,
    color: "#fff",
    fontWeight: "500",
  },
  postsSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 16,
  },
  postsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  postsSectionTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  createPostButton: {
    marginTop: 20,
    backgroundColor: Colors.PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  createPostButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
