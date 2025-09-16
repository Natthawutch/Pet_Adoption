import { useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createClerkSupabaseClient, supabase } from "../../config/supabaseClient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const googleOAuth = useOAuth({ strategy: "oauth_google" });
  const facebookOAuth = useOAuth({ strategy: "oauth_facebook" });
  const { getToken } = useAuth();
  const { user } = useUser();

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      Alert.alert("Login Success", `Welcome ${data.user.email}`);
      router.replace("/home");
    } catch (err) {
      Alert.alert("Login Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    try {
      const { startOAuthFlow } =
        provider === "google" ? googleOAuth : facebookOAuth;
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (!createdSessionId) throw new Error("No session");

      await setActive({ session: createdSessionId });

      const token = await getToken({ template: "supabase" });
      if (!token) throw new Error("No Clerk token");

      await SecureStore.setItemAsync("clerkToken", token);

      const supabaseClerk = createClerkSupabaseClient(token);

      if (user) {
        const { error: upsertError } = await supabaseClerk
          .from("users")
          .upsert({
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            full_name: user.fullName,
            avatar_url: user.imageUrl,
          });

        if (upsertError) throw upsertError;
        Alert.alert("Login Success", `Welcome ${user.fullName}`);
        router.replace("/home");
      }
    } catch (err) {
      Alert.alert(`${provider} Login Error`, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={handleEmailLogin}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login with Email</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleOAuthLogin("google")}
        style={[styles.button, { backgroundColor: "#DB4437" }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Login with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleOAuthLogin("facebook")}
        style={[styles.button, { backgroundColor: "#4267B2" }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Login with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
