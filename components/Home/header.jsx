import { useAuth, useUser } from "@clerk/clerk-expo";
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

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inboxCount, setInboxCount] = useState(2);
  const { isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        setUser({
          id: clerkUser.id,
          full_name: clerkUser.fullName || clerkUser.firstName || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress,
          avatar_url: clerkUser.imageUrl,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#555" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>Stray Dog Care</Text>
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
  appTitle: { fontSize: 20, fontWeight: "bold", color: "#1e1e1e" },
  rightIcons: { flexDirection: "row", alignItems: "center" },
  icon: { position: "relative", padding: 5 },
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
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
});
