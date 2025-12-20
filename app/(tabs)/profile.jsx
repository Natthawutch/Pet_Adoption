import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function Profile() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken, signOut } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      const { data: petPosts } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProfile(userData);
      setPosts(petPosts || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  /* ---------------- AVATAR ---------------- */

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    try {
      setUploading(true);
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const uri = result.assets[0].uri;
      const filePath = `avatars/${user.id}.jpg`;

      await supabase.storage
        .from("user-avatars")
        .upload(
          filePath,
          { uri, type: "image/jpeg", name: filePath },
          { upsert: true }
        );

      const { data } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("clerk_id", user.id);

      setProfile((p) => ({ ...p, avatar_url: data.publicUrl }));
    } catch {
      Alert.alert("เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- POST ACTIONS ---------------- */

  const openPostMenu = (pet) => {
    Alert.alert("จัดการโพสต์", pet.name, [
      {
        text: "แก้ไข",
        onPress: () =>
          router.push({
            pathname: "/edit-pet",
            params: { id: pet.id },
          }),
      },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => confirmDeletePet(pet),
      },
      { text: "ยกเลิก" },
    ]);
  };

  const confirmDeletePet = (pet) => {
    Alert.alert("ลบโพสต์", "คุณแน่ใจหรือไม่? การลบไม่สามารถกู้คืนได้", [
      { text: "ยกเลิก" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => deletePet(pet),
      },
    ]);
  };

  const deletePet = async (pet) => {
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      // ลบรูปจาก storage
      if (pet.image_url) {
        const path = pet.image_url.split("/storage/v1/object/public/")[1];
        if (path) {
          await supabase.storage.from("pet-images").remove([path]);
        }
      }

      // ลบข้อมูล
      await supabase.from("pets").delete().eq("id", pet.id);

      // update UI
      setPosts((prev) => prev.filter((p) => p.id !== pet.id));
    } catch {
      Alert.alert("ลบไม่สำเร็จ");
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const logout = () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจหรือไม่?", [
      { text: "ยกเลิก" },
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

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
      </View>
    );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={pickAvatar} disabled={uploading}>
          <Image
            source={{
              uri:
                profile?.avatar_url ||
                user?.imageUrl ||
                "https://www.gravatar.com/avatar/?d=mp",
            }}
            style={styles.avatar}
          />
          <View style={styles.camera}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.name}>{user?.fullName || "ผู้ใช้งาน"}</Text>

        <View style={styles.badge}>
          <Ionicons name="paw" size={14} color="#fff" />
          <Text style={styles.badgeText}>ผู้ใช้งานทั่วไป</Text>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Stat title="โพสต์สัตว์" value={posts.length} icon="paw" />
        <Stat title="รับเลี้ยง" value="0" icon="heart" />
        <Stat title="ดูแลอยู่" value="0" icon="medkit" />
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <Tab
          label="โพสต์สัตว์"
          active={tab === "posts"}
          onPress={() => setTab("posts")}
        />
        <Tab
          label="ประวัติรับเลี้ยง"
          active={tab === "history"}
          onPress={() => setTab("history")}
        />
      </View>

      {/* POSTS */}
      {tab === "posts" && (
        <FlatList
          data={posts}
          scrollEnabled={false}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <TouchableOpacity
                style={{ flexDirection: "row", flex: 1 }}
                onPress={() =>
                  router.push({
                    pathname: "/pet-details",
                    params: { id: item.id },
                  })
                }
              >
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.petImage}
                />
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{item.name}</Text>
                  <Text style={styles.petStatus}>{item.post_status}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moreBtn}
                onPress={() => openPostMenu(item)}
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#555" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {tab === "history" && (
        <Text style={styles.empty}>ยังไม่มีประวัติการรับเลี้ยง</Text>
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color="#fff" />
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={Colors.PURPLE} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

const Tab = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: Colors.PURPLE,
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  camera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0008",
    borderRadius: 12,
    padding: 6,
  },
  name: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 12 },
  badge: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
    alignItems: "center",
    gap: 4,
  },
  badgeText: { color: "#fff", fontSize: 12 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -20,
  },
  statCard: {
    backgroundColor: "#fff",
    width: "30%",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    elevation: 3,
  },
  statValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  statLabel: { fontSize: 12, color: "#777" },

  tabs: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#eee",
    borderRadius: 14,
  },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#fff", borderRadius: 14 },
  tabText: { color: "#777" },
  tabTextActive: { color: Colors.PURPLE, fontWeight: "600" },

  petCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 14,
    elevation: 2,
  },
  petImage: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  petInfo: { padding: 10, justifyContent: "center", flex: 1 },
  petName: { fontWeight: "700", fontSize: 16 },
  petStatus: { color: "#22c55e", marginTop: 4 },

  moreBtn: { paddingHorizontal: 12, justifyContent: "center" },

  empty: { textAlign: "center", marginTop: 40, color: "#777" },

  logout: {
    margin: 20,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  logoutText: { color: "#fff", fontWeight: "600" },
});
