import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Header from "../../components/Home/header";
import Petlistbycatgory from "../../components/Home/petlistbycatgory";
import Slider from "../../components/Home/slider";
import Colors from "../../constants/Colors";

export default function Home() {
  return (
    <View style={{ padding: 20 }}>
      {/* Header */}
      <Header />
      {/* Slider */}
      <Slider />
      {/*PetList + Category */}
      <Petlistbycatgory />

      {/* Add New Pet Option */}

      <Link href="/add-new-pet" style={styles.addNewPetContainer}>
        <MaterialIcons name="pets" size={24} color={Colors.PURPLE} />
        <Text
          style={{
            fontFamily: "outfit-medium",
            fontSize: 18,
            color: Colors.PURPLE,
          }}
        >
          Add New Pet
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  addNewPetContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 10,
    marginTop: 20,
    textAlign: "center",
    backgroundColor: Colors.LIGHT_PURPLE,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.PURPLE,
    borderStyle: "dashed",
    justifyContent: "center",
  },
});
