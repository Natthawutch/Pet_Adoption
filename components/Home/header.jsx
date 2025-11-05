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

export default function Header() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [inboxCount, setInboxCount] = useState(3);
  const [locationText, setLocationText] = useState("Detecting location...");
  const { isSignedIn } = useAuth();
  const { user: clerkUser, isLoaded } = useUser();
  const router = useRouter();

  // ✅ โหลดข้อมูลผู้ใช้ Clerk
  useEffect(() => {
    if (isLoaded) {
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
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  // 📍 โหลดตำแหน่งจริงจาก GPS
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
        } else {
          setLocationText("Unknown Location");
        }
      } catch (error) {
        console.error(error);
        setLocationText("Location unavailable");
      }
    })();
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
      {/* 📸 Avatar + Name + Location */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={45} color="#fff" />
          )}
        </TouchableOpacity>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.userName}>
            {user?.full_name?.toUpperCase() || "USER"}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color="#fff" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>
      </View>

      {/* ❤️ 💬 Favorite + Inbox */}
      <View style={styles.rightIcons}>
        <TouchableOpacity
          style={styles.icon}
          onPress={() => router.push("/Favorite/favorite")}
        >
          <Ionicons name="heart" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.icon}
          onPress={() => router.push("/Inbox/inbox")}
        >
          <MaterialCommunityIcons name="message-badge" size={24} color="#fff" />
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
    backgroundColor: "#b226beff", // สีพีชอ่อนแบบในภาพ
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 18,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    color: "#fff",
    fontSize: 13,
    marginLeft: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "relative",
    marginLeft: 15,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
