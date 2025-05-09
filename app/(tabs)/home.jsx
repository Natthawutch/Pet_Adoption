import { View, Text ,StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Header from "../../components/Home/Header";
import Slider from "../../components/Home/Slider";
import PetListByCategory from "../../components/Home/PetListByCategory";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Colors from "../../constants/Colors";

export default function Home() {
  return (
    <View
      style={{
        padding: 20,
      }}
    >
      {/* Header */}
      <Header />
      {/* Slider */}
      <Slider />
      {/*PetListByCategory + Category */}
      <PetListByCategory />

      {/* Add New Pet Option */}

      <TouchableOpacity style={styles.addNewPetContainer}>
        <MaterialIcons name="pets" size={24} color={Colors.WHITE} />
        <Text
          style={{
            fontFamily: "oswald-medium",
            color: Colors.WHITE,
            fontSize: 14,
          }}
        >
          Add New Pet
        </Text>
      </TouchableOpacity>
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
    marginTop: 10,
    backgroundColor: Colors.BLUE,
    borderWidth: 1,
    borderColor: Colors.BLUE,
    borderRadius: 15,
    borderStyle: "dashed",
    justifyContent: "center",
  },
});
