import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
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
      style={{
        padding: 10,
        marginRight: 15,
        backgroundColor: Colors.LIGHT_PURPLE,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 10,
          right: 10,
          top: 10,
        }}
      >
        <MarFav pet={pet} color={"white"} />
      </View>

      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: 150,
          height: 150,
          borderRadius: 10,
          objectFit: "cover",
        }}
      />
      <Text
        style={{
          fontFamily: "outfit-medium",
          fontSize: 18,
          color: Colors.BLACK,
        }}
      >
        {pet?.name}
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontFamily: "outfit", fontSize: 14, color: Colors.BLACK}}
        >
          {pet?.breed}
        </Text>
        <Text
          style={{
            fontFamily: "outfit",
            fontSize: 14,
            color: Colors.BLACK,
            paddingHorizontal: 7,
            borderRadius: 10,
            backgroundColor: Colors.PURPLE,
            textAlign: "center",
            color: Colors.WHITE,
            marginLeft: 3,
          }}
        >
          {pet?.age} years
        </Text>
      </View>
    </TouchableOpacity>
  );
}
