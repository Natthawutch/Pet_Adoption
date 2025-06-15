import { Image, StyleSheet, Text, View } from "react-native";
import MarkFav from "../../components/MarkFav";
import Colors from "../../constants/Colors";

export default function PetInfo({ pet }) {
  return (
    <View style={styles.container}>
      {/* Pet Image Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: pet?.image_url }} style={styles.petImage} />
        {/* Overlay gradient effect */}
        <View style={styles.imageOverlay} />

        {/* Favorite button positioned on image */}
        <View style={styles.favButtonContainer}>
          <MarkFav pet={pet} />
        </View>
      </View>

      {/* Pet Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.petName} numberOfLines={2}>
            {pet?.name}
          </Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.petAddress} numberOfLines={1}>
              {pet?.address}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom shadow effect */}
      <View style={styles.bottomShadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  imageContainer: {
    position: "relative",
    height: 280,
    overflow: "hidden",
  },

  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    background: "linear-gradient(transparent, rgba(0,0,0,0.3))",
  },

  favButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 50,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  infoContainer: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  textContainer: {
    flex: 1,
  },

  petName: {
    fontFamily: "outfit-bold",
    fontSize: 28,
    color: "#1a1a1a",
    lineHeight: 34,
    marginBottom: 8,
  },

  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  addressIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  petAddress: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.GRAY,
    flex: 1,
    lineHeight: 22,
  },

  bottomShadow: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});
