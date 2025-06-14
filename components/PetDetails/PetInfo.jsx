import { Image, Text, View } from "react-native";
import MarkFav from "../../components/MarkFav"; // สมมุติมี component นี้อยู่แล้ว
import Colors from "../../constants/Colors";

export default function PetInfo({ pet }) {
  return (
    <View>
      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: "100%",
          height: 400,
          borderRadius: 10,
          resizeMode: "cover",
        }}
      />
      <View
        style={{
          padding: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontFamily: "outfit-bold", fontSize: 27 }}>
            {pet?.name}
          </Text>
          <Text
            style={{ fontFamily: "outfit", fontSize: 16, color: Colors.GRAY }}
          >
            {pet?.address}
          </Text>
        </View>
        <MarkFav pet={pet} />
      </View>
    </View>
  );
}
