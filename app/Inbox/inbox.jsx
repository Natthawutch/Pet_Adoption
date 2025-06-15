import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import UserItem from "../../components/Inbox/UserItem";
import { supabase } from "../../config/supabaseClient";

export default function Inbox() {
  const router = useRouter();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
    if (!initialLoading) {
      setLoader(true);
    }
    setUserList([]);

    const { data: chatroomUsers, error } = await supabase
      .from("chatroom_users")
      .select("chatroom_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching chatroom_users:", error);
      setLoader(false);
      setInitialLoading(false);
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
    setInitialLoading(false);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>ยังไม่มีแชท</Text>
      <Text style={styles.emptySubtitle}>
        เริ่มต้นการสนทนาใหม่กับเพื่อนของคุณ
      </Text>
    </View>
  );

  const renderSeparator = () => <View style={styles.separator} />;

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#1F2937" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Inbox</Text>

        {/* สามารถเพิ่มปุ่ม action อื่นๆ ได้ เช่น search */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Ionicons name="search-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <View style={styles.listContainer}>
        <FlatList
          data={userList}
          keyExtractor={(item) => item.docId}
          renderItem={({ item }) => <UserItem userInfo={item} />}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={loader}
              onRefresh={GetUserList}
              colors={["#3B82F6"]}
              tintColor="#3B82F6"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            userList.length === 0 && styles.emptyListContent,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "outfit-medium",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },

  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontFamily: "outfit-medium",
    color: "#1F2937",
    textAlign: "center",
    marginHorizontal: 16,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },

  listContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  listContent: {
    paddingTop: 8,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  separator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 76, // เว้นระยะเท่ากับ avatar + padding
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 24,
    fontFamily: "outfit-medium",
    color: "#374151",
    marginTop: 24,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});
