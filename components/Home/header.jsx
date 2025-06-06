import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import defaultAvatar from "../../assets/images/user.png";
import { supabase } from "../../config/supabaseClient";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session)
          throw sessionError || new Error("No active session");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        setUser({
          ...user,
          full_name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUserData();
      else setUser(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* รูป user พร้อมเมนูเมื่อกด */}
      <TouchableOpacity onPress={() => setShowMenu(true)}>
        <Image
          source={user?.avatar_url ? { uri: user.avatar_url } : defaultAvatar}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* ไอคอนทางขวา */}
      <View style={styles.iconsContainer}>
        <Ionicons name="heart-outline" size={30} color="black" />
        <MaterialIcons name="help-outline" size={30} color="black" />
      </View>

      {/* Modal เมนู Logout */}
      <Modal
        transparent={true}
        visible={showMenu}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuBox}>
            {user && <Text style={styles.userName}>{user.full_name}</Text>}
            <Pressable onPress={handleLogout}>
              <Text style={styles.logoutButton}>Logout</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 25,
    paddingLeft: 5,
    paddingRight: 10,
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 80,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 99,
  },
  iconsContainer: {
    flexDirection: "row",
    gap: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 70,
    paddingLeft: 10,
  },
  menuBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  userName: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  logoutButton: {
    fontSize: 16,
    color: "red",
  },
});
