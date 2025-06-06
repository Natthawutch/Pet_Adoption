import { createClient } from "@supabase/supabase-js";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import PetListItem from "../../components/Home/petlistitem";
import Colors from "../../constants/Colors";

// สร้าง Supabase client (เปลี่ยนเป็น URL และ ANON KEY ของคุณ)
const supabaseUrl = "https://YOUR_SUPABASE_PROJECT_URL.supabase.co";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserPost() {
  const navigation = useNavigation();
  const [loader, setLoader] = useState(false);
  const [userPostList, setUserPostList] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "User Post",
    });
    getCurrentUser();
  }, []);

  // ดึงข้อมูล user ปัจจุบันจาก Supabase Auth
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fetching user:", error.message);
      return;
    }
    setUser(user);
    if (user) {
      GetUserPost(user.email);
    }
  };

  // ดึงโพสต์ของ user จาก Supabase Database
  const GetUserPost = async (email) => {
    setLoader(true);
    setUserPostList([]);

    const { data, error } = await supabase
      .from("Pets")
      .select("*")
      .eq("email", email);

    if (error) {
      console.log("Error fetching posts:", error.message);
    } else {
      setUserPostList(data);
    }
    setLoader(false);
  };

  // ลบโพสต์จาก Supabase
  const deletePost = async (postId) => {
    const { error } = await supabase
      .from("Pets")
      .delete()
      .eq("id", postId);

    if (error) {
      Alert.alert("Error", "Cannot delete post: " + error.message);
      return;
    }

    Alert.alert("Deleted", "Post deleted successfully");
    if (user) {
      GetUserPost(user.email);
    }
  };

  const OnDeletePost = (postId) => {
    Alert.alert(
      "Confirm Delete",
      "Do you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deletePost(postId),
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 30 }}>
        User Post
      </Text>

      <FlatList
        data={userPostList}
        numColumns={2}
        refreshing={loader}
        onRefresh={() => user && GetUserPost(user.email)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <Text style={{ fontFamily: "outfit", textAlign: "center", marginTop: 20 }}>
            No Post Found
          </Text>
        )}
        renderItem={({ item }) => (
          <View>
            <PetListItem pet={item} />
            <Pressable
              onPress={() => OnDeletePost(item.id)}
              style={styles.deleteButton}
            >
              <Text style={{ color: Colors.WHITE, fontFamily: "outfit", textAlign: "center" }}>
                Delete
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: Colors.PURPLE,
    padding: 5,
    borderRadius: 7,
    marginTop: 5,
    marginRight: 10,
  },
});
