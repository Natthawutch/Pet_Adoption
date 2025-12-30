import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VolunteerHome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>โหมดอาสาสมัคร</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/volunteer/reports")}
      >
        <Ionicons name="alert-circle" size={28} color="#ef4444" />
        <Text style={styles.cardText}>รายงานสัตว์ต้องการความช่วยเหลือ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
