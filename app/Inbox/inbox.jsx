import { Ionicons } from "@expo/vector-icons"; // import ไอคอนจาก expo vector icons
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router"; // <-- นำเข้า useRouter
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import UserItem from "../../components/Inbox/UserItem";
import { supabase } from "../../config/supabaseClient";

export default function Inbox() {
  const router = useRouter(); // <-- เรียกใช้ useRouter
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      GetUserList();
    }
  }, [user]);

  const GetUserList = async () => {
    setLoader(true);
    setUserList([]);

    const { data: chatroomUsers, error } = await supabase
      .from("chatroom_users")
      .select("chatroom_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching chatroom_users:", error);
      setLoader(false);
      return;
    }

    const chatroomIds = chatroomUsers.map((cu) => cu.chatroom_id);
    const enrichedList = [];

    for (const chatroomId of chatroomIds) {
      const { data: participants, error: participantsError } = await supabase
        .from("chatroom_users")
        .select("user_id")
        .eq("chatroom_id", chatroomId);

      if (participantsError) {
        console.error("Error fetching participants:", participantsError);
        continue;
      }

      const otherUser = participants.find((p) => p.user_id !== user.id);
      if (!otherUser) continue;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUser.user_id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        continue;
      }

      enrichedList.push({
        docId: chatroomId,
        ...profile,
      });
    }

    setUserList(enrichedList);
    setLoader(false);
  };

  return (
    <View style={{ padding: 20, paddingTop: 40, flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        {/* ปุ่มลูกศรกลับ */}
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <Text
          style={{
            paddingLeft: 10,
            fontFamily: "outfit-medium",
            fontSize: 30,
          }}
        >
          Inbox
        </Text>
      </View>

      <FlatList
        data={userList}
        refreshing={loader}
        onRefresh={GetUserList}
        style={{ marginTop: 20 }}
        keyExtractor={(item) => item.docId}
        renderItem={({ item }) => <UserItem userInfo={item} />}
      />
    </View>
  );
}
