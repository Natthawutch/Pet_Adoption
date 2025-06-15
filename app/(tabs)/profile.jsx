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
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const screenWidth = Dimensions.get("window").width;
const imageSize = (screenWidth - 6) / 3; // Adjusted for spacing

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();
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
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "การอนุญาตถูกปฏิเสธ",
        "กรุณาอนุญาตให้เข้าถึงรูปภาพเพื่อเปลี่ยนรูปโปรไฟล์"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUploading(true);
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: base64Image },
      });

      if (error) {
        Alert.alert("อัพเดทล้มเหลว", error.message);
      } else {
        setUser((prev) => ({
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            avatar_url: base64Image,
          },
        }));
        Alert.alert("สำเร็จ", "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
      }
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจหรือไม่ที่จะออกจากระบบ?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            router.replace("/login");
          } else {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
          }
        },
      },
    ]);
  };

  const fetchPosts = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("posts")
      .select("id, media_url, caption, created_at, likes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data || []);
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;

    // เพิ่มการดึงข้อมูล followers และ following ในอนาคต
    // const { data: followersData } = await supabase
    //   .from("follows")
    //   .select("id")
    //   .eq("following_id", user.id);
    // setFollowers(followersData?.length || 0);

    // const { data: followingData } = await supabase
    //   .from("follows")
    //   .select("id")
    //   .eq("follower_id", user.id);
    // setFollowing(followingData?.length || 0);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.id) {
      fetchPosts();
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick} disabled={uploading}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      user?.user_metadata?.avatar_url ||
                      "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&h=200&fit=crop&crop=face",
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
              <Text style={styles.statNumber}>{followers}</Text>
              <Text style={styles.statLabel}>ผู้ติดตาม</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{following}</Text>
              <Text style={styles.statLabel}>กำลังติดตาม</Text>
            </View>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>
            {user?.user_metadata?.full_name || "ยังไม่ได้ตั้งชื่อ"}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.bio}>
            {user?.user_metadata?.bio ||
              "🐾 คนรักสัตว์ มาช่วยกันหาบ้านให้น้องๆ กันเถอะ!"}
          </Text>
        </View>

        {/* Action Buttons */}
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

        {/* Posts Section */}
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
                  style={[
                    styles.postItem,
                    {
                      marginRight: (index + 1) % 3 === 0 ? 0 : 2,
                      marginBottom: 2,
                    },
                  ]}
                >
                  <Image
                    source={{ uri: item.media_url }}
                    style={styles.postImage}
                  />
                  {item.likes > 0 && (
                    <View style={styles.likesOverlay}>
                      <Ionicons name="heart" size={12} color="#fff" />
                      <Text style={styles.likesText}>{item.likes}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={60} color="#ccc" />
              <Text style={styles.emptyStateTitle}>ยังไม่มีโพสต์</Text>
              <Text style={styles.emptyStateSubtitle}>
                เริ่มแชร์รูปสัตว์เลี้ยงน่ารักของคุณกันเถอะ!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/create-post")}
                style={styles.createPostButton}
              >
                <Text style={styles.createPostButtonText}>สร้างโพสต์แรก</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = {
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
    marginTop: 10,
    fontFamily: "outfit",
    color: "#666",
  },
  header: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    paddingTop: 60,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.PURPLE,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.PURPLE,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "outfit-bold",
    fontSize: 20,
    color: "#333",
  },
  statLabel: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  fullName: {
    fontFamily: "outfit-bold",
    fontSize: 18,
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontFamily: "outfit",
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    gap: 6,
  },
  editButtonText: {
    fontFamily: "outfit-medium",
    color: Colors.PURPLE,
    fontSize: 14,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ff4757",
    borderRadius: 8,
    gap: 6,
  },
  logoutButtonText: {
    fontFamily: "outfit-medium",
    color: "#fff",
    fontSize: 14,
  },
  postsSection: {
    paddingHorizontal: 20,
  },
  postsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 8,
  },
  postsSectionTitle: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "#333",
  },
  postItem: {
    position: "relative",
  },
  postImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 4,
  },
  likesOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  likesText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "outfit-medium",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontFamily: "outfit-bold",
    fontSize: 18,
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  emptyStateSubtitle: {
    fontFamily: "outfit",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: Colors.PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createPostButtonText: {
    color: "#fff",
    fontFamily: "outfit-medium",
    fontSize: 14,
  },
};
