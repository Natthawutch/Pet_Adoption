import { View, Image, Text, TouchableOpacity } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import { useRouter } from "expo-router";
import MarkFav from "../MarkFav";

export default function PetListItem({ pet }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/pet-details",
          params: pet,
        })
      }
      style={{
        padding: 10,
        marginRight: 15,
        borderRadius: 10,
        backgroundColor: Colors.BLUE,
      }}
    >
      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: 150,
          height: 130,
          objectFit: "cover",
          borderRadius: 10,
        }}
      />
      <View style={{ position: "absolute", zIndex: 10, top: 10, right: 10 }}>
        <MarkFav pet={pet} color={"white"}/>
      </View>
      <Text
        style={{
          fontFamily: "oswald-medium",
          fontSize: 16,
          color: Colors.WHITE,
        }}
      >
        {pet?.name}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: "oswald", color: Colors.WHITE }}>
          {pet?.breed}
        </Text>

        <Text
          style={{
            fontFamily: "oswald",
            fontSize: 12,
            color: Colors.BLACK,
            backgroundColor: Colors.WHITE,
            paddingHorizontal: 7,
            borderRadius: 10,
          }}
        >
          {pet?.age} YRS
        </Text>
      </View>
    </TouchableOpacity>
  );
}
