import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { saveAdminStatus } from "../app/utils/admin storage";
import { createClerkSupabaseClient } from "../config/supabaseClient";

export default function SyncUser() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const sync = async () => {
      try {
        const token = await getToken({ template: "supabase" });
        const supabase = createClerkSupabaseClient(token);

        let { data } = await supabase
          .from("users")
          .select("role")
          .eq("clerk_id", user.id)
          .single();

        if (!data) {
          const isAdmin =
            user.primaryEmailAddress?.emailAddress === "admin@gmail.com";

          await supabase.from("users").insert({
            clerk_id: user.id,
            email: user.primaryEmailAddress.emailAddress,
            full_name: user.fullName,
            role: isAdmin ? "admin" : "user",
          });

          data = { role: isAdmin ? "admin" : "user" };
        }

        await saveAdminStatus(data.role === "admin");

        router.replace(data.role === "admin" ? "/admin" : "/(tabs)/home");
      } catch (err) {
        console.error("❌ sync user error:", err);
      }
    };

    sync();
  }, [isLoaded, user]);

  return null;
}
