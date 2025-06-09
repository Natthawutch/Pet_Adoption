import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MarFav from "../../components/MarkFav";
import Colors from "../../constants/Colors";

export default function Petlistitem({ pet }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/pet-details",
          params: pet,
        })
      }
      style={styles.card}
      activeOpacity={0.8}
    >
      {/* Favorite icon top right */}
      <View style={styles.favIconWrapper}>
        <MarFav pet={pet} color={"white"} />
      </View>

      {/* Pet Image */}
      <Image source={{ uri: pet?.imageUrl }} style={styles.petImage} />

      {/* Pet Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{pet?.name}</Text>

        {/* ราคาเพิ่มมา */}
        <Text style={styles.petPrice}>
          {pet?.price ? `$${pet.price.toFixed(2)}` : "Price N/A"}
        </Text>

        <View style={styles.subInfoRow}>
          <Text style={styles.petBreed}>{pet?.breed}</Text>
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>{pet?.age} years</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 8, // ให้มีช่องว่างระหว่าง item
    overflow: "hidden",

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,

    // Elevation for Android
    elevation: 5,

    width: "45%", // ใช้ประมาณ 48% ของ container เพื่อให้พอดีกับ 2 คอลัมน์
  },
  favIconWrapper: {
    position: "absolute",
    zIndex: 10,
    right: 10,
    top: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 5,
  },
  petImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 10,
  },
  petName: {
    fontFamily: "outfit-medium",
    fontSize: 18,
    color: Colors.BLACK,
    marginBottom: 2,
  },
  petPrice: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.PURPLE,
    marginBottom: 8,
  },
  subInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petBreed: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.DARK_GRAY || "#555",
    flexShrink: 1,
  },
  ageBadge: {
    backgroundColor: Colors.PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  ageText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.WHITE,
  },
});
