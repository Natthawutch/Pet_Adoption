import React, { useCallback, useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import Colors from "../../constants/Colors.ts";
import * as WebBrowser from "expo-web-browser";
import { useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  useWarmUpBrowser();

  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri(),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        
      } else {
        // If there is no `createdSessionId`,
        // there are missing requirements, such as MFA
        // Use the `signIn` or `signUp` returned from `startSSOFlow`
        // to handle next steps
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [])

  return (
    <View style={{ backgroundColor: Colors.WHITE, height: "100%" }}>
      <Image
        source={require("../../assets/images/login.png")}
        style={{ width: "100%", height: 400, resizeMode: "contain" }}
      />

      <View style={{ padding: 10, display: "flex", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 30,
            fontFamily: "oswald-bold",
            textAlign: "center",
          }}
        >
          Ready to make a new friend?
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "oswald",
            textAlign: "center",
            color: Colors.GRAY,
            marginTop: 10,
          }}
        >
          Let's adopt the pet which you like and make their life happy again.
        </Text>
        <Pressable
          onPress={onPress}
          style={{
            padding: 12,
            marginTop: 80,
            backgroundColor: Colors.PRIMARY,
            width: "100%",
            borderRadius: 14,
          }}
        >
          <Text
            style={{
              fontFamily: "oswald-medium",
              fontSize: 16,
              textAlign: "center",
              color: Colors.WHITE,
            }}
          >
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
