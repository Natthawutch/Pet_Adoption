import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PetListItem from "../../components/Home/petlistitem";
import { createClerkSupabaseClient } from "../../config/supabaseClient";

export default function Favorite() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigation = useNavigation();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const { data: favs, error } = await supabase
        .from("favorites")
        .select("pet_id")
        .eq("user_id", user.id);

      if (error) throw error;

      if (!favs?.length) {
        setPets([]);
        return;
      }

      const petIds = favs.map((f) => f.pet_id);

      const { data: petsData } = await supabase
        .from("pets")
        .select("*")
        .in("id", petIds);

      setPets(petsData || []);
    } catch (err) {
      console.log("Favorite error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loading State
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>กำลังโหลดรายการโปรด...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🔙 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>รายการโปรด</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* 🐾 Empty State */}
      {!pets.length ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={70} color="#ff6b6b" />
          <Text style={styles.emptyTitle}>ยังไม่มีรายการโปรด</Text>
          <Text style={styles.emptySub}>
            ลองกดหัวใจสัตว์เลี้ยงที่คุณสนใจดูนะ 💕
          </Text>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <PetListItem pet={item} />
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySub: {
    textAlign: "center",
    color: "#777",
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
