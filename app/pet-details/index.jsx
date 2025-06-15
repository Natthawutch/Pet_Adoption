import { Ionicons } from "@expo/vector-icons";
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
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

export default function PetDetails() {
  const pet = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerTintColor: Colors.WHITE,
      headerStyle: {
        backgroundColor: "transparent",
      },
    });
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.log("Error fetching user:", error.message);
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        return;
      }
      setUser(user);
    } catch (error) {
      console.error("Unexpected error:", error);
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

  const InitiateChat = async () => {
    if (!user || !pet?.email) {
      Alert.alert(
        "ข้อมูลไม่ครบถ้วน",
        "กรุณาเข้าสู่ระบบและตรวจสอบข้อมูลสัตว์เลี้ยง",
        [{ text: "ตกลง", style: "default" }]
      );
      return;
    }

    setIsLoading(true);
    animateButton();

    const userEmail = user.email;
    const docId1 = userEmail + "_" + pet.email;
    const docId2 = pet.email + "_" + userEmail;

    try {
      // เช็คว่ามีห้องแชทอยู่แล้วไหม
      let { data: existingChats1, error: error1 } = await supabase
        .from("Chat")
        .select("*")
        .eq("id", docId1)
        .limit(1);

      if (error1) throw error1;

      if (existingChats1 && existingChats1.length > 0) {
        router.push({
          pathname: "/chat",
          params: { id: docId1 },
        });
        return;
      }

      let { data: existingChats2, error: error2 } = await supabase
        .from("Chat")
        .select("*")
        .eq("id", docId2)
        .limit(1);

      if (error2) throw error2;

      if (existingChats2 && existingChats2.length > 0) {
        router.push({
          pathname: "/chat",
          params: { id: docId2 },
        });
        return;
      }

      // ถ้าไม่มี ให้สร้างแชทใหม่
      const { error: insertError } = await supabase.from("Chat").insert([
        {
          id: docId1,
          users: [
            {
              email: userEmail,
              imageUrl: user.user_metadata?.avatar_url || "",
              name: user.user_metadata?.full_name || "",
            },
            {
              email: pet.email,
              imageUrl: pet.userImage,
              name: pet.username,
            },
          ],
          userIds: [userEmail, pet.email],
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) throw insertError;

      // แสดงข้อความสำเร็จก่อนไปหน้าแชท
      Alert.alert("สำเร็จ!", "เริ่มการสนทนากับเจ้าของแล้ว", [
        {
          text: "ไปที่แชท",
          onPress: () => {
            router.push({
              pathname: "/chat",
              params: { id: docId1 },
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error.message || "ไม่สามารถเริ่มการสนทนาได้",
        [{ text: "ลองใหม่", style: "default" }]
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = () => {
    // Add favorite functionality here
    Alert.alert(
      "เพิ่มในรายการโปรด",
      "คุณต้องการเพิ่มสัตว์เลี้ยงนี้ในรายการโปรดหรือไม่?"
    );
  };

  const handleShare = () => {
    // Add share functionality here
    Alert.alert("แชร์", "แชร์ข้อมูลสัตว์เลี้ยงนี้");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <PetInfo pet={pet} />
        <View style={styles.contentContainer}>
          <PetSubInfo pet={pet} />
          <AboutPet pet={pet} />
          <OwnerInfo pet={pet} />
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Action Buttons Container */}
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.95)",
            "rgba(255,255,255,1)",
          ]}
          style={styles.gradientOverlay}
        />

        <View style={styles.actionContainer}>
          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={24} color={Colors.PURPLE} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={24} color={Colors.PURPLE} />
            </TouchableOpacity>
          </View>

          {/* Main Action Button */}
          <Animated.View
            style={[
              styles.adoptButtonContainer,
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            <TouchableOpacity
              onPress={InitiateChat}
              style={[styles.adoptBtn, isLoading && styles.adoptBtnDisabled]}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <LinearGradient
                colors={
                  isLoading ? ["#ccc", "#999"] : [Colors.PURPLE, "#8B5FBF"]
                }
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Colors.WHITE} size="small" />
                    <Text style={styles.adoptBtnText}>กำลังดำเนินการ...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={Colors.WHITE}
                    />
                    <Text style={styles.adoptBtnText}>สนใจรับเลี้ยง</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: Colors.WHITE,
  },
  bottomContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  gradientOverlay: {
    height: 60,
    width: "100%",
  },
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  adoptButtonContainer: {
    flex: 1,
    marginLeft: 16,
  },
  adoptBtn: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: Colors.PURPLE,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  adoptBtnDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adoptBtnText: {
    textAlign: "center",
    fontFamily: "outfit-medium",
    fontSize: 18,
    color: Colors.WHITE,
    fontWeight: "600",
  },
});
