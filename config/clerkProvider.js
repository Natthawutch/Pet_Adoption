import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ClerkWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("clerkToken");
      setToken(storedToken);
      setIsLoading(false);
    };
    loadToken();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ClerkProvider
      frontendApi="https://gentle-amoeba-9.clerk.accounts.dev"
      token={token} // ใช้ token ที่เก็บไว้ถ้ามี
      navigate={(to) => {
        // Optional: integrate with expo-router navigation
      }}
    >
      {children}
    </ClerkProvider>
  );
}
