import { View, Text, Image } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import MarkFav from "../MarkFav";

export default function PetInfo({ pet }) {

  return (
    <View>
      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: "100%",
          height: 300,
          resizeMode: "cover", // แก้จาก objectFit เป็น resizeMode (react-native ไม่มี objectFit)
        }}
      />
      <View
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, fontFamily: "oswald-bold" }}>
            {pet?.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "oswald",
              color: Colors.GRAY,
            }}
          >
            {pet?.address}
          </Text>
        </View>
        <MarkFav pet={pet}/>
      </View>
    </View>
  );
}
