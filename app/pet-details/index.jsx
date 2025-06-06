import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
    });
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fetching user:", error.message);
      return;
    }
    setUser(user);
  };

  const InitiateChat = async () => {
    if (!user || !pet?.email) {
      alert("User or Pet info is missing");
      return;
    }

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

      router.push({
        pathname: "/chat",
        params: { id: docId1 },
      });
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + error.message);
      console.error(error);
    }
  };

  return (
    <View>
      <ScrollView>
        <PetInfo pet={pet} />
        <PetSubInfo pet={pet} />
        <AboutPet pet={pet} />
        <OwnerInfo pet={pet} />
        <View style={{ height: 70 }} />
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={InitiateChat} style={styles.adopBtn}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: "outfit-medium",
              fontSize: 20,
              color: Colors.WHITE,
            }}
          >
            Adopt Me
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adopBtn: { padding: 15, backgroundColor: Colors.PURPLE },
  bottomContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
