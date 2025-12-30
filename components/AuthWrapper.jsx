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

      try {
        console.log("🔍 User ID:", user.id);

        const token = await getToken({ template: "supabase" });
        console.log("🔍 Token:", token ? "exists" : "null");

        const supabase = createClerkSupabaseClient(token);

        // ลอง query ทั้งหมดก่อน
        const { data: allUsers, error: allError } = await supabase
          .from("users")
          .select("*");

        console.log("🔍 ALL USERS:", allUsers, allError);

        // query ตามปกติ
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("clerk_id", user.id)
          .single();

        console.log("🔍 Query result:", { data, error, userId: user.id });

        if (error || !data?.role) {
          console.log("❌ Role not found", error);
          router.replace("/login");
          return;
        }

        const role = data.role;
        await saveUserRole(role);

        console.log("✅ USER ROLE:", role);

        if (role === "admin") {
          router.replace("/admin/dashboard");
        } else if (role === "volunteer") {
          router.replace("/volunteer");
        } else {
          router.replace("/(tabs)/home");
        }
      } catch (e) {
        console.error("❌ AuthWrapper error:", e);
      } finally {
        setLoading(false);
      }
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
