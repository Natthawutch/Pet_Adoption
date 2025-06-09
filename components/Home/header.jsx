import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inboxCount, setInboxCount] = useState(2);
  const navigation = useNavigation();

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ซ้าย: ชื่อแอป */}

      <Text style={styles.appTitle}>Stray Dog Care</Text>

      {/* ขวา: Favorites + Inbox */}
      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => navigation.navigate("Favorite/favorite")}
        >
          <Ionicons name="heart-outline" size={26} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => navigation.navigate("Inbox/inbox")}
        >
          <MaterialCommunityIcons
            name="facebook-messenger"
            size={26}
            color="#333"
          />
          {inboxCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {inboxCount > 9 ? "9+" : inboxCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 5,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e1e1e",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "relative",
    padding: 5,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e63946",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
