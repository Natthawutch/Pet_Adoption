import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { saveUserRole } from "../app/utils/roleStorage";
import { createClerkSupabaseClient } from "../config/supabaseClient";

export default function AuthWrapper({ children }) {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      const token = await getToken({ template: "supabase" });
      const supabase = createClerkSupabaseClient(token);

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", user.id)
        .single();

      if (error || !data?.role) {
        router.replace("/login");
        return;
      }

      const role = data.role;
      await saveUserRole(role);

      const currentGroup = segments[0];

      if (role === "admin" && currentGroup !== "admin") {
        router.replace("/admin/dashboard");
      }

      if (role === "volunteer" && currentGroup !== "volunteer") {
        router.replace("/volunteer");
      }

      if (role === "user" && currentGroup !== "(tabs)") {
        router.replace("/(tabs)/home");
      }

      setLoading(false);
    };

    checkRoleAndRedirect();
  }, [isLoaded, isSignedIn]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
