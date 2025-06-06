import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

export default function OwnerInfo({ pet }) {
  const imageUrl = pet?.imageUrl || "https://via.placeholder.com/50";
  const username = pet?.username || "Unknown";

  return (
    <View style={styles.container}>
      <View style={styles.ownerInfo}>
        <Image source={{ uri: imageUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.label}>Pet Owner</Text>
        </View>
      </View>
      <Ionicons name="send-sharp" size={24} color={Colors.PURPLE} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    borderColor: Colors.PURPLE,
    backgroundColor: Colors.LIGHT_PURPLE,
    justifyContent: "space-between",
  },
  ownerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  name: {
    fontFamily: "outfit-medium",
    fontSize: 17,
  },
  label: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.GRAY,
  },
});
