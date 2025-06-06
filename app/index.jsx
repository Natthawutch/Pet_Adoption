import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      router.replace("/(tabs)/home");
    });
  }, []);

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Intro.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[styles.progressBar, { width: animatedWidth }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6CCFF", // เปลี่ยนพื้นหลังเป็นขาวเพื่อให้ตัดกับแถบสี
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  progressBarContainer: {
    width: 220,
    height: 10,
    backgroundColor: "#000000", // พื้นหลังหลอด (สีเทาอ่อน)
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#ffffff", // สีเขียวสด (แถบโหลด)
  },
});
