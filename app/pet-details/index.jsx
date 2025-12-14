import { useAuth, useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AboutPet from "../../components/PetDetails/AboutPet";
import OwnerInfo from "../../components/PetDetails/OwnerInfo";
import PetInfo from "../../components/PetDetails/PetInfo";
import PetSubInfo from "../../components/PetDetails/PetSubInfo";
import { createClerkSupabaseClient, supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

export default function PetDetails() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  const { user } = useUser();
  const { getToken } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerTintColor: Colors.WHITE,
    });

    fetchPet();
  }, [id]);

  useEffect(() => {
    if (user && pet) checkFavorite();
  }, [user, pet]);

  // 🔹 ดึงข้อมูลสัตว์
  const fetchPet = async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      Alert.alert("ไม่พบข้อมูลสัตว์เลี้ยง");
      return;
    }

    setPet(data);
    setLoading(false);
  };

  // ❤️ เช็ค Favorite
  const checkFavorite = async () => {
    const token = await getToken({ template: "supabase" });
    const supabaseAuth = createClerkSupabaseClient(token);

    const { data } = await supabaseAuth
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("pet_id", pet.id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  // ❤️ Toggle Favorite
  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    const token = await getToken({ template: "supabase" });
    const supabaseAuth = createClerkSupabaseClient(token);

    if (isFavorite) {
      await supabaseAuth
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("pet_id", pet.id);

      setIsFavorite(false);
    } else {
      await supabaseAuth.from("favorites").insert([
        {
          user_id: user.id,
          pet_id: pet.id,
        },
      ]);

      setIsFavorite(true);
    }
  };

  // 💬 เริ่มแชท
  const InitiateChat = async () => {
    if (!user) {
      Alert.alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    animateButton();
    setIsLoading(true);

    const chatId = `${user.id}_${pet.user_id}`;

    try {
      router.push({
        pathname: "/chat",
        params: { id: chatId },
      });
    } catch (err) {
      Alert.alert("ไม่สามารถเริ่มแชทได้");
    } finally {
      setIsLoading(false);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading || !pet) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PetInfo pet={pet} />
        <PetSubInfo pet={pet} />
        <AboutPet pet={pet} />
        <OwnerInfo pet={pet} />
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ❤️ Favorite Button */}
      <TouchableOpacity style={styles.favoriteBtn} onPress={toggleFavorite}>
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={26}
          color={isFavorite ? "#EF4444" : "#6B7280"}
        />
      </TouchableOpacity>

      {/* 🟣 Bottom Button */}
      <View style={styles.bottomContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.adoptBtn}
            onPress={InitiateChat}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.PURPLE, "#8B5FBF"]}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.adoptBtnText}>สนใจรับเลี้ยง</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  adoptBtn: { borderRadius: 30, overflow: "hidden" },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  adoptBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  favoriteBtn: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 999,
    elevation: 6,
  },
});
