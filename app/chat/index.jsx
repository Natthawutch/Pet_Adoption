import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { supabase } from "../../config/supabaseClient";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ดึง user จาก Supabase Auth
    const currentUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    fetchChatMessages();

    // สมัครฟัง realtime changes จากตาราง messages ของ chat room นี้
    const subscription = supabase
      .channel(`public:messages:id=eq.${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${id}`,
        },
        (payload) => {
          const newMessage = mapMessage(payload.new);
          setMessages((previous) => GiftedChat.append(previous, [newMessage]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id]);

  // ฟังก์ชันดึงข้อความจาก Supabase
  const fetchChatMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "Failed to fetch messages.");
      return;
    }

    const mappedMessages = data.map(mapMessage);
    setMessages(mappedMessages);
  };

  // แปลงโครงสร้าง message จาก DB ให้เข้ากับ GiftedChat
  const mapMessage = (msg) => ({
    _id: msg.id,
    text: msg.text,
    createdAt: new Date(msg.created_at),
    user: {
      _id: msg.user_id,
      name: msg.user_name,
      avatar: msg.user_avatar_url,
    },
  });

  // ฟังก์ชันส่งข้อความใหม่
  const onSend = async (newMessages = []) => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const message = {
      chat_id: id,
      text: newMessages[0].text,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || "Unknown",
      user_avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
    };

    // Optimistic update UI
    setMessages((previous) =>
      GiftedChat.append(previous, [mapMessage({ id: Math.random(), ...message })])
    );

    // ส่งข้อมูลไปยัง Supabase
    const { error } = await supabase.from("messages").insert([message]);

    if (error) {
      Alert.alert("Error", "Failed to send message.");
      console.error(error);
    }
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: user?.id,
        name: user?.user_metadata?.full_name,
        avatar: user?.user_metadata?.avatar_url,
      }}
      showUserAvatar
      alwaysShowSend
    />
  );
}
