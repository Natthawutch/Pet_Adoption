import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Colors from "../../constants/Colors";

export default function AboutPet({ pet }) {
  const [readMode, setReadMode] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0.7));

  const handleToggle = () => {
    setReadMode(!readMode);

    // Subtle animation for read more/less
    Animated.timing(fadeAnim, {
      toValue: readMode ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Header with icon */}
      <View style={styles.header}>
        <Ionicons
          name="information-circle-outline"
          size={24}
          color={Colors.PRIMARY}
          style={styles.icon}
        />
        <Text style={styles.title}>About {pet?.name || "Pet"}</Text>
      </View>

      {/* Content area with subtle background */}
      <View style={styles.contentContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text
            numberOfLines={readMode ? 3 : undefined}
            style={styles.description}
          >
            {pet?.about || "No description available for this pet."}
          </Text>
        </Animated.View>

        {/* Read more/less button with improved styling */}
        <Pressable
          style={({ pressed }) => [
            styles.toggleButton,
            pressed && styles.toggleButtonPressed,
          ]}
          onPress={handleToggle}
        >
          <Text style={styles.toggleText}>
            {readMode ? "Read More" : "Read Less"}
          </Text>
          <Ionicons
            name={readMode ? "chevron-down" : "chevron-up"}
            size={16}
            color={Colors.SECONDARY}
            style={styles.chevron}
          />
        </Pressable>
      </View>

      {/* Decorative bottom border */}
      <View style={styles.bottomBorder} />
    </View>
  );
}

const styles = {
  container: {
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  icon: {
    marginRight: 8,
    color: Colors.BLACK || "#333",
  },

  title: {
    fontFamily: "outfit-bold",
    fontSize: 22,
    color: Colors.BLACK || "#333",
    flex: 1,
  },

  contentContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.LIGHT_PURPLE || "#007AFF",
  },

  description: {
    fontFamily: "outfit",
    fontSize: 15,
    lineHeight: 22,
    color: Colors.GRAY || "#666",
    marginBottom: 12,
  },

  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.SECONDARY ? `${Colors.SECONDARY}10` : "#007AFF10",
    borderWidth: 1,
    borderColor: Colors.SECONDARY || "#007AFF",
  },

  toggleButtonPressed: {
    backgroundColor: Colors.SECONDARY ? `${Colors.SECONDARY}20` : "#007AFF20",
    transform: [{ scale: 0.98 }],
  },

  toggleText: {
    fontFamily: "outfit-medium",
    fontSize: 14,
    color: Colors.SECONDARY || "#007AFF",
    marginRight: 4,
  },

  chevron: {
    marginLeft: 2,
  },

  bottomBorder: {
    height: 2,
    backgroundColor: Colors.PRIMARY ? `${Colors.PRIMARY}20` : "#007AFF20",
    borderRadius: 1,
    marginTop: 16,
    width: "100%",
  },
};
