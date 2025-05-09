import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import Colors from "../../constants/Colors";

export default function AdoutPet({ pet }) {
  const [readMord, setReadMord] = useState(true);
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontFamily: "oswald-medium" }}>
        Adout {pet?.name}
      </Text>
      <Text
        numberOfLines={readMord ? 3 : 20}
        style={{ fontFamily: "oswald", fontSize: 12, color: Colors.GRAY }}
      >
        {pet?.adout}
      </Text>
      {readMord && (
        <Pressable onPress={() => setReadMord(false)}>
          <Text
            style={{
              fontFamily: "oswald-medium",
              fontSize: 12,
              color: Colors.BLUE,
            }}
          >
            ReadMord
          </Text>
        </Pressable>
      )}
    </View>
  );
}
