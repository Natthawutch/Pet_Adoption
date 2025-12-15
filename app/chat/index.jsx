import { useAuth, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { createClerkSupabaseClient } from "../../config/supabaseClient";

export default function ChatScreen() {
  const { id } = useLocalSearchParams(); // chat_id
  const { user } = useUser();
  const { getToken } = useAuth();

  const [messages, setMessages] = useState([]);
  const [supabase, setSupabase] = useState(null);

  // ✅ สร้าง Supabase client จาก Clerk token
  useEffect(() => {
    const initSupabase = async () => {
      const token = await getToken({ template: "supabase" });
      if (!token) return;
      setSupabase(createClerkSupabaseClient(token));
    };

    initSupabase();
  }, []);

  // ✅ โหลดข้อความ + realtime
  useEffect(() => {
    if (!id || !supabase) return;

    fetchMessages();

    const channel = supabase
      .channel(`chat-${id}`)
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
          setMessages((prev) => GiftedChat.append(prev, [newMessage]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, supabase]);

  // ✅ ดึงข้อความเก่า
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "โหลดข้อความไม่สำเร็จ");
      return;
    }

    setMessages(data.map(mapMessage));
  };

  // ✅ แปลง message ให้ GiftedChat
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

  // ✅ ส่งข้อความ
  const onSend = useCallback(
    async (newMessages = []) => {
      if (!user || !supabase) return;

      const newMessage = newMessages[0];

      const messageData = {
        chat_id: id,
        text: newMessage.text,
        user_id: user.id,
        user_name: user.fullName || "Unknown",
        user_avatar_url: user.imageUrl || null,
      };

      // optimistic UI
      setMessages((prev) =>
        GiftedChat.append(prev, [
          {
            ...newMessage,
            user: {
              _id: user.id,
              name: user.fullName,
              avatar: user.imageUrl,
            },
          },
        ])
      );

      const { error } = await supabase.from("messages").insert([messageData]);

      if (error) {
        Alert.alert("Error", "ส่งข้อความไม่สำเร็จ");
        console.error(error);
      }
    },
    [user, supabase]
  );

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: user?.id,
        name: user?.fullName,
        avatar: user?.imageUrl,
      }}
      showUserAvatar
      alwaysShowSend
    />
  );
}
