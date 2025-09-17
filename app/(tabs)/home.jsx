import { useUser } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Home/header";
import Slider from "../../components/Home/slider";
import {
  createClerkSupabaseClient,
  supabase,
} from "../../config/supabaseClient";

export default function Home() {
  const { user } = useUser();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [upsertingUser, setUpsertingUser] = useState(false);

  // -------------------------------
  // Upsert Clerk user ลง Supabase
  // -------------------------------
  useEffect(() => {
    const upsertUser = async () => {
      if (!user) return;

      setUpsertingUser(true);
      try {
        const token = await SecureStore.getItemAsync("clerkToken");
        if (!token) return;

        const supabaseClerk = createClerkSupabaseClient(token);

        const { error } = await supabaseClerk
          .from("users")
          .upsert({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            full_name: user.fullName || "",
            avatar_url: user.imageUrl || "",
            bio: "",
          })
          .select();

        if (error) console.log("Supabase upsert error:", error);
        else console.log("User upserted to Supabase");
      } catch (err) {
        console.log("Upsert user error:", err);
      } finally {
        setUpsertingUser(false);
      }
    };

    upsertUser();
  }, [user]);

  // -------------------------------
  // ดึง Pet list จาก Supabase
  // -------------------------------
  useEffect(() => {
    const fetchPets = async () => {
      setLoadingPets(true);
      try {
        const { data, error } = await supabase.from("pets").select("*");
        if (error) console.log("Error fetching pets:", error);
        else setPets(data);
      } catch (err) {
        console.log("Fetch pets error:", err);
      } finally {
        setLoadingPets(false);
      }
    };

    fetchPets();
  }, []);

  // -------------------------------
  // Render pet item
  // -------------------------------
  const renderPetItem = ({ item }) => (
    <TouchableOpacity style={styles.petItem}>
      <Image source={{ uri: item.image_url }} style={styles.petImage} />
      <Text style={styles.petName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <Header />
      {upsertingUser && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text>กำลังบันทึกข้อมูลผู้ใช้...</Text>
        </View>
      )}
      <FlatList
        ListHeaderComponent={<Slider />}
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loadingPets && (
            <Text style={styles.emptyText}>ไม่มีสัตว์ให้แสดง</Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  petItem: { marginBottom: 20, alignItems: "center" },
  petImage: { width: 200, height: 150, borderRadius: 15, marginBottom: 10 },
  petName: { fontSize: 16, fontWeight: "600", color: "#333" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -75 }, { translateY: -40 }],
    width: 150,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
