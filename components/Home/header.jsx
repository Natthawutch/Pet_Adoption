import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const navigation = useNavigation();

  // โหลดข้อมูลผู้ใช้ Clerk
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

  // โหลดตำแหน่งจริงจาก GPS
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Location Permission",
            "Please enable location permissions in settings."
          );
          setLocationText("Location unavailable");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let reverseGeocode = await Location.reverseGeocodeAsync({
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
    <BlurView intensity={40} tint="light" style={styles.container}>
      <View style={styles.inner}>
        {/* 👤 Avatar (ซ้าย) */}
        <TouchableOpacity onPress={() => navigation.navigate("(tabs)/profile")}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={36} color="#555" />
          )}
        </TouchableOpacity>

        {/* 📍 Location (กลาง) */}
        <View style={styles.centerSection}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={18} color="#0077FF" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>

        {/* ❤️ 💬 Favorite + Inbox (ขวา) */}
        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.icon}
            onPress={() => navigation.navigate("Favorite/favorite")}
          >
            <Ionicons name="heart" size={24} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.icon}
            onPress={() => navigation.navigate("Inbox/inbox")}
          >
            <MaterialCommunityIcons
              name="message-badge"
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
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 55,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  centerSection: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "90%",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e1e1e",
    marginLeft: 4,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    position: "relative",
    marginLeft: 10,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
