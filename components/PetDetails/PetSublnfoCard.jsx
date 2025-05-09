import { View, Text, Image } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";

export default function PetSublnfoCard({ icon, title, value }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.BLUE,
        padding: 10,
        margin: 5,
        borderRadius: 8,
        gap: 10,
        flex: 1,
      }}
    >
      <Image source={icon} style={{ width: 40, height: 40 }} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "oswald",
            fontSize: 12,
            color: Colors.WHITE,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: "oswald-medium",
            fontSize: 15,
            color: Colors.LAVENDER,
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
