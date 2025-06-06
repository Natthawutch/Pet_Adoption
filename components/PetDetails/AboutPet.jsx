import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Colors from "../../constants/Colors";

export default function AboutPet({ pet }) {
  const [readMode, setReadMode] = useState(true);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 20 }}>
        About {pet?.name}
      </Text>

      <Text
        numberOfLines={readMode ? 3 : undefined}
        style={{
          fontFamily: "outfit",
          fontSize: 14,
          color: Colors.GRAY,
          marginTop: 6,
        }}
      >
        {pet?.about}
      </Text>

      <Pressable onPress={() => setReadMode(!readMode)}>
        <Text
          style={{
            fontFamily: "outfit-medium",
            fontSize: 14,
            color: Colors.SECONDARY,
            marginTop: 6,
          }}
        >
          {readMode ? "Read More" : "Read Less"}
        </Text>
      </Pressable>
    </View>
  );
}
