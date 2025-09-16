import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const floatingAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Floating animations for background elements
    const createFloatingAnimation = (animValue, duration, delay = 0) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    createFloatingAnimation(floatingAnim1, 3000, 0);
    createFloatingAnimation(floatingAnim2, 4000, 500);
    createFloatingAnimation(floatingAnim3, 3500, 1000);

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        router.replace("/(tabs)/home");
      });
    }, 800);
  }, []);

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const getFloatingStyle = (animValue, translateRange) => ({
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: translateRange,
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {/* Animated background bubbles */}
      <Animated.View
        style={[
          styles.floatingBubble,
          styles.bubble1,
          getFloatingStyle(floatingAnim1, [-20, 20]),
        ]}
      />
      <Animated.View
        style={[
          styles.floatingBubble,
          styles.bubble2,
          getFloatingStyle(floatingAnim2, [20, -20]),
        ]}
      />
      <Animated.View
        style={[
          styles.floatingBubble,
          styles.bubble3,
          getFloatingStyle(floatingAnim3, [-15, 15]),
        ]}
      />

      {/* Main content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Glassmorphism card */}
        <View style={styles.glassCard}>
          <Image
            source={require("../assets/images/Intro.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Modern progress section */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[styles.progressFill, { width: animatedWidth }]}
              />
              <Animated.View
                style={[styles.progressShine, { width: animatedWidth }]}
              />
            </View>
          </View>

          {/* Animated dots indicator */}
          <View style={styles.indicatorContainer}>
            {[...Array(5)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  {
                    opacity: progress.interpolate({
                      inputRange: [index * 0.2, (index + 1) * 0.2],
                      outputRange: [0.3, 1],
                      extrapolate: "clamp",
                    }),
                    transform: [
                      {
                        scale: progress.interpolate({
                          inputRange: [index * 0.2, (index + 1) * 0.2],
                          outputRange: [0.5, 1],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingBubble: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.1,
  },
  bubble1: {
    width: 200,
    height: 200,
    backgroundColor: "#ff6b6b",
    top: height * 0.1,
    left: -50,
  },
  bubble2: {
    width: 150,
    height: 150,
    backgroundColor: "#4ecdc4",
    top: height * 0.2,
    right: -30,
  },
  bubble3: {
    width: 120,
    height: 120,
    backgroundColor: "#45b7d1",
    bottom: height * 0.15,
    left: width * 0.1,
  },
  contentContainer: {
    alignItems: "center",
    width: width * 0.85,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 30,
    padding: 40,
    marginBottom: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    backdropFilter: "blur(10px)",
  },
  logo: {
    width: 160,
    height: 160,
  },
  progressSection: {
    width: "100%",
    alignItems: "center",
  },
  progressContainer: {
    width: "80%",
    marginBottom: 25,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "absolute",
    shadowColor: "#00d4aa",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  progressShine: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    position: "absolute",
    top: 0,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    marginHorizontal: 5,
    shadowColor: "#00d4aa",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
