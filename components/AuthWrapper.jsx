import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createClerkSupabaseClient } from "../config/supabaseClient";
import { saveUserRole } from "../utils/roleStorage";

export default function AuthWrapper({ children }) {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!isLoaded) return; // รอ Clerk โหลด

      if (!isSignedIn) {
        setLoading(false);
        if (segments[0] !== "login") router.replace("/login");
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // 🔹 สร้าง Supabase client ด้วย Clerk token
        const token = await getToken({ template: "supabase" });
        const supabase = createClerkSupabaseClient(token);

        // ----------------- ลบได้้ ถ้าไม่ต้องการ upsert profiles---------------------------
        // 🔹 Upsert profiles
        // await supabase.from("profiles").upsert({
        //   id: user.id,
        //   display_name: user.fullName || user.username || "User",
        //   email: user.primaryEmailAddress?.emailAddress || "",
        //   avatar_url: user.imageUrl || "",
        //   last_sign_in_at: new Date().toISOString(),
        // });

        //-------------------------------------------------------------------------------

        // 🔹 Upsert users
        // ถ้า account ใหม่ จะสร้าง row พร้อม role = "user"
        await supabase.from("users").upsert(
          {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            full_name: user.fullName || user.username || "User",
            avatar_url: user.imageUrl || "",
            role: "user", // default role
            created_at: new Date().toISOString(),
          },
          { onConflict: ["clerk_id"] }
        );

        // 🔹 Check role
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("clerk_id", user.id)
          .single();

        if (error || !data?.role) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        const role = data.role;
        await saveUserRole(role);

        // 🔹 Redirect ตาม role
        const currentGroup = segments[0];
        if (role === "admin" && currentGroup !== "admin") {
          router.replace("/admin/dashboard");
        } else if (role === "volunteer" && currentGroup !== "volunteer") {
          router.replace("/volunteer");
        } else if (role === "user" && currentGroup !== "(tabs)") {
          router.replace("/(tabs)/home");
        }
      } catch (err) {
        console.error("AuthWrapper error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkRoleAndRedirect();
  }, [isLoaded, isSignedIn, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
}
