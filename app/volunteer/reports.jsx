import { useRouter } from "expo-router";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const MOCK_REPORTS = [
  {
    id: "1",
    title: "ลูกสุนัขถูกรถชน",
    location: "เชียงใหม่",
    status: "open",
  },
  {
    id: "2",
    title: "แมวเจ็บขาหลัง",
    location: "กรุงเทพ",
    status: "open",
  },
];

export default function VolunteerReports() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_REPORTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/volunteer/reports-detail",
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.location}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700" },
  sub: { color: "#6b7280", marginTop: 4 },
});
