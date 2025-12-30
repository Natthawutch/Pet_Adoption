import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { getUserRole } from "../utils/roleStorage";

export default function VolunteerLayout() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserRole().then(setRole);
  }, []);

  if (!role) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (role !== "volunteer") {
    return <Redirect href="/(tabs)/profile" />;
  }

  return <Stack />;
}
