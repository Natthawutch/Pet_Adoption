import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import Colors from "../../constants/Colors";
import Feather from "@expo/vector-icons/Feather";

export default function Ownerlnfo({ pet }) {
  return (
    <View style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 20,
        }}
      >
        <Image
          source={{ uri: pet?.userImage || "https://i.pravatar.cc/150?img=12" }} // fallback image
          style={{ width: 60, height: 60, borderRadius: 99 }}
        />
        <View>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "oswald-medium",
              color: Colors.WHITE,
            }}
          >
            {pet?.username || "Unknown User"}
          </Text>
          <Text style={{ color: Colors.WHITE, fontFamily: "oswald" }}>
            Pet Owner
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => {}}>
        <Feather name="send" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    paddingHorizontal: 20,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.BLUE,
    backgroundColor: Colors.BLUE,
    justifyContent: "space-between",
  },
});
