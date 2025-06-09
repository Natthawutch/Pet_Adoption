import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import Color from "../../constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Color.BLACK,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
          height: 60,
          paddingBottom: 5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-sharp" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="add-pet"
        options={{
          title: "Add Pet",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={25} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications" // เปลี่ยนตรงนี้
        options={{
          title: "Notifications", // เปลี่ยน title
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications" size={25} color={color} /> // เปลี่ยนไอคอนเป็น notifications
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-circle-sharp" size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
