import { View, Text, Image } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import PetSublnfoCard from "./PetSublnfoCard";

export default function PetSublnfo({ pet }) {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <PetSublnfoCard
          icon={require("../../assets/images/calendar.png")}
          title={"Age"}
          value={pet?.age + " years"}
        />
        <PetSublnfoCard
          icon={require("../../assets/images/bone.png")}
          title={"Breed"}
          value={pet?.breed}
        />
      </View>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <PetSublnfoCard
          icon={require("../../assets/images/sex.png")}
          title={"Sex"}
          value={pet?.sex}
        />
        <PetSublnfoCard
          icon={require("../../assets/images/weight.png")}
          title={"Weight"}
          value={pet?.weight + " kg"}
        />
      </View>
    </View>
  );
}
