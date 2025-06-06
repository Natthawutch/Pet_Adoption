import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import Color from "../../constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Color.PURPLE,
        tabBarStyle: {
          backgroundColor: "#fff", // สีพื้นหลัง tab bar
          borderTopWidth: 0,       // ลบเส้นขอบบนออกเพื่อความเรียบง่าย
          elevation: 5,            // เงาเบาๆ เพื่อให้ดูลอยขึ้นเล็กน้อย (Android)
          shadowColor: "#000",     // เงาสำหรับ iOS
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          height: 60,              // ความสูงของ tab bar
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false, // ซ่อน header ของทุกหน้าที่อยู่ใน tab
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-sharp" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-pet"
        options={{
          title: "Add Pet",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-circle-sharp" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
