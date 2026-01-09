import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";

export default function Header() {
  const { isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inboxCount, setInboxCount] = useState(0);
  const [locationText, setLocationText] = useState("Detecting location...");

  /* ========================= Load Clerk user ========================= */
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        full_name: clerkUser.fullName || clerkUser.firstName || "User",
        avatar_url: clerkUser.imageUrl,
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [isLoaded, isSignedIn, clerkUser]);

  /* ========================= REAL unread inbox count ========================= */
  const loadInboxCount = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("chat_id", { count: "exact" })
        .neq("sender_id", user.id)
        .is("read_at", null);

      if (error) {
        setInboxCount(0);
        return;
      }

      const uniqueChats = [...new Set(data.map((msg) => msg.chat_id))];
      setInboxCount(uniqueChats.length);
    } catch (err) {
      console.error("loadInboxCount error:", err);
      setInboxCount(0);
    }
  };

  useEffect(() => {
    if (user?.id) loadInboxCount();
  }, [user?.id]);

  /* ========================= Realtime inbox ========================= */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`header-inbox-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", table: "messages", schema: "public" },
        () => loadInboxCount()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", table: "messages", schema: "public" },
        () => loadInboxCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* ========================= Location ========================= */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationText("Location unavailable");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const { city, region, country } = reverseGeocode[0];
          setLocationText(`${city || region || "Unknown"}, ${country || ""}`);
        }
      } catch {
        setLocationText("Location unavailable");
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Overlay Effect (optional - can add LinearGradient) */}

      {/* LEFT SECTION */}
      <TouchableOpacity
        style={styles.leftSection}
        onPress={() => router.push("/(tabs)/profile")}
        activeOpacity={0.7}
      >
        {/* Avatar with status indicator */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.avatar_url || "https://via.placeholder.com/100",
            }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.full_name}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-sharp"
              size={12}
              color="rgba(255,255,255,0.8)"
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* RIGHT SECTION */}
      <View style={styles.rightIcons}>
        {/* Favorite Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/Favorite/favorite")}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <Ionicons name="heart" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Inbox Button with Badge */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/Inbox/inbox")}
          activeOpacity={0.7}
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="message-text"
              size={22}
              color="#fff"
            />
            {inboxCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {inboxCount > 99 ? "99+" : inboxCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    backgroundColor: "#8B5CF6",
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#8B5CF6",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  greeting: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 2,
  },
  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "400",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  iconWrapper: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#8B5CF6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});
