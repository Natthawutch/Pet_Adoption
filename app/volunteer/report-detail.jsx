import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const handleAccept = () => {
    Alert.alert("รับเคส", "คุณต้องการรับผิดชอบเคสนี้หรือไม่?", [
      { text: "ยกเลิก" },
      {
        text: "ยืนยัน",
        onPress: () => {
          Alert.alert("สำเร็จ", "คุณรับเคสนี้แล้ว");
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เคส #{id}</Text>

      <Text style={styles.text}>สัตว์ต้องการความช่วยเหลือด่วน</Text>
      <Text style={styles.text}>📍 พื้นที่: ไม่ระบุ</Text>

      <TouchableOpacity style={styles.btn} onPress={handleAccept}>
        <Text style={styles.btnText}>รับเคสนี้</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  text: { fontSize: 15, marginBottom: 8 },
  btn: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
