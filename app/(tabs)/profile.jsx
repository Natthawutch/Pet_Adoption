import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

      // 1. ดึงข้อมูล User
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      // 2. ดึงข้อมูลโพสต์สัตว์ของ User นี้
      const { data: petPosts } = await supabase
        .from("pets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProfile(userData);
      setPosts(petPosts || []);
    } catch (e) {
      console.log("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  /* ---------------- AVATAR ACTIONS ---------------- */

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "ขออภัย",
        "เราต้องการสิทธิ์การเข้าถึงคลังรูปภาพเพื่อเปลี่ยนรูปโปรไฟล์"
      );
      return;
    }

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
      const fileExt = uri.split(".").pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      await supabase
        .from("users")
        .update({ avatar_url: data.publicUrl })
        .eq("clerk_id", user.id);

      setProfile((p) => ({ ...p, avatar_url: data.publicUrl }));
      Alert.alert("สำเร็จ", "เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (e) {
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- VOLUNTEER ACTIONS ---------------- */

  const applyVolunteer = () => {
    Alert.alert(
      "สมัครอาสาสมัคร",
      "คุณต้องการส่งคำขอสมัครเป็นอาสาสมัครเพื่อช่วยตรวจสอบสัตว์จรจัดใช่หรือไม่?",
      [{ text: "ยกเลิก" }, { text: "สมัคร", onPress: submitVolunteer }]
    );
  };

  const submitVolunteer = async () => {
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      await supabase
        .from("users")
        .update({ role: "volunteer_pending" })
        .eq("clerk_id", user.id);

      Alert.alert("สำเร็จ", "ส่งคำขอสมัครอาสาแล้ว รอการอนุมัติจากผู้ดูแลระบบ");
      loadProfile();
    } catch {
      Alert.alert("เกิดข้อผิดพลาด");
    }
  };

  /* ---------------- POST ACTIONS ---------------- */

  const openPostMenu = (pet) => {
    Alert.alert("จัดการโพสต์", pet.name, [
      {
        text: "แก้ไข",
        onPress: () =>
          router.push({ pathname: "/edit-pet", params: { id: pet.id } }),
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
    Alert.alert("ลบโพสต์", `คุณแน่ใจหรือไม่ที่จะลบ "${pet.name}"?`, [
      { text: "ยกเลิก" },
      { text: "ลบ", style: "destructive", onPress: () => deletePet(pet) },
    ]);
  };

  const deletePet = async (pet) => {
    try {
      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      if (pet.image_url) {
        const path = pet.image_url.split(
          "/storage/v1/object/public/pet-images/"
        )[1];
        if (path) await supabase.storage.from("pet-images").remove([path]);
      }

      await supabase.from("pets").delete().eq("id", pet.id);
      setPosts((prev) => prev.filter((p) => p.id !== pet.id));
      Alert.alert("สำเร็จ", "ลบโพสต์เรียบร้อยแล้ว");
    } catch {
      Alert.alert("เกิดข้อผิดพลาด", "ลบไม่สำเร็จ");
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

  const isVolunteer = profile?.role === "volunteer";
  const isPending = profile?.role === "volunteer_pending";

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
      showsVerticalScrollIndicator={false}
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
          {uploading ? (
            <ActivityIndicator
              style={styles.camera}
              color="#fff"
              size="small"
            />
          ) : (
            <View style={styles.camera}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{user?.fullName || "ผู้ใช้งาน"}</Text>

        {/* ROLE BADGE */}
        <View
          style={[
            styles.badge,
            isPending && { backgroundColor: "#f59e0b" },
            isVolunteer && { backgroundColor: "#3b82f6" },
          ]}
        >
          <Ionicons
            name={isVolunteer ? "shield-checkmark" : "paw"}
            size={14}
            color="#fff"
          />
          <Text style={styles.badgeText}>
            {profile?.role === "user" && "ผู้ใช้งานทั่วไป"}
            {profile?.role === "volunteer_pending" && "รออนุมัติอาสา"}
            {profile?.role === "volunteer" && "อาสาสมัคร"}
            {profile?.role === "admin" && "ผู้ดูแลระบบ"}
          </Text>
        </View>

        {/* APPLY VOLUNTEER BUTTON */}
        {profile?.role === "user" && (
          <TouchableOpacity
            style={styles.volunteerBtn}
            onPress={applyVolunteer}
          >
            <Ionicons name="heart" size={16} color="#fff" />
            <Text style={styles.volunteerText}>สมัครเป็นอาสาสมัคร</Text>
          </TouchableOpacity>
        )}

        {isPending && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳ กำลังรอการอนุมัติ</Text>
          </View>
        )}
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Stat title="โพสต์สัตว์" value={posts.length} icon="paw" />
        <Stat title="รับเลี้ยง" value="0" icon="heart" />
        {isVolunteer && <Stat title="ดูแลอยู่" value="0" icon="medkit" />}
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

      {/* POSTS LIST */}
      <View style={{ paddingBottom: 20 }}>
        {tab === "posts" ? (
          posts.length > 0 ? (
            posts.map((item) => (
              <View key={item.id} style={styles.petCard}>
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
                    <Text
                      style={[
                        styles.petStatus,
                        {
                          color:
                            item.post_status === "Available"
                              ? "#22c55e"
                              : "#6b7280",
                        },
                      ]}
                    >
                      {item.post_status || "สถานะไม่ระบุ"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => openPostMenu(item)}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color="#555" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>ยังไม่มีโพสต์สัตว์เลี้ยงของคุณ</Text>
          )
        ) : (
          <Text style={styles.empty}>ยังไม่มีประวัติการรับเลี้ยง</Text>
        )}
      </View>

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
    paddingBottom: 35,
    paddingTop: 60,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
  },
  camera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 12 },

  badge: {
    flexDirection: "row",
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    alignItems: "center",
    gap: 4,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  volunteerBtn: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 15,
    alignItems: "center",
    gap: 8,
    elevation: 4,
  },
  volunteerText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  pendingBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pendingText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: -25,
    paddingHorizontal: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    width: "28%",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statValue: { fontSize: 20, fontWeight: "800", marginTop: 4, color: "#333" },
  statLabel: { fontSize: 12, color: "#888", fontWeight: "500" },

  tabs: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { backgroundColor: "#fff", borderRadius: 12, elevation: 2 },
  tabText: { color: "#888", fontWeight: "500" },
  tabTextActive: { color: Colors.PURPLE, fontWeight: "700" },

  petCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  petImage: {
    width: 90,
    height: 90,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  petInfo: { padding: 12, justifyContent: "center", flex: 1 },
  petName: { fontWeight: "700", fontSize: 17, color: "#333" },
  petStatus: { fontSize: 13, marginTop: 4, fontWeight: "600" },
  moreBtn: { paddingHorizontal: 15, justifyContent: "center" },

  empty: { textAlign: "center", marginTop: 30, color: "#aaa", fontSize: 15 },

  logout: {
    margin: 20,
    backgroundColor: "#ef4444",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
