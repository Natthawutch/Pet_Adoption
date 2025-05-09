import { Text, View } from "react-native";
import { Link, Redirect } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function Index() {
  const { user } = useUser();
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Text>{user?.FullName}</Text>
      {user ? <Redirect href={"/(tabs)/home"} /> : <Redirect href={"/login"} />}
    </View>
  );
}
