import { Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import MarkFav from "../../components/MarkFav";
import Colors from "../../constants/Colors";

export default function PetInfo({ pet }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const videoRef = useRef(null);

  /* =======================
     Build media list
  ======================= */
  const mediaList = [];

  if (pet?.video_url) {
    mediaList.push({
      type: "video",
      uri: pet.video_url,
    });
  }

  let images = [];
  if (pet?.images) {
    try {
      images = JSON.parse(pet.images);
    } catch {
      images = pet.image_url ? [pet.image_url] : [];
    }
  } else if (pet?.image_url) {
    images = [pet.image_url];
  }

  images.forEach((img) => {
    mediaList.push({
      type: "image",
      uri: img,
    });
  });

  /* =======================
     Auto play / pause video
  ======================= */
  useEffect(() => {
    if (!videoRef.current) return;
    if (mediaList[0]?.type !== "video") return;

    if (currentIndex === 0) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      {/* Media Gallery */}
      <View
        style={styles.imageContainer}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / containerWidth
              );
              setCurrentIndex(index);
            }}
          >
            {mediaList.map((item, index) => (
              <View
                key={index}
                style={{
                  width: containerWidth,
                  height: 280,
                }}
              >
                {item.type === "video" ? (
                  <Video
                    ref={videoRef}
                    source={{ uri: item.uri }}
                    style={styles.media}
                    resizeMode="cover"
                    useNativeControls
                    shouldPlay={index === 0}
                    isLooping
                  />
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.media} />
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Overlay */}
        <View style={styles.imageOverlay} />

        {/* Indicators */}
        {mediaList.length > 1 && (
          <View style={styles.indicators}>
            {mediaList.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}

        {/* Favorite */}
        <View style={styles.favButtonContainer}>
          <MarkFav pet={pet} />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{pet?.name}</Text>

        <View style={styles.addressContainer}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text style={styles.petAddress} numberOfLines={1}>
            {pet?.address}
          </Text>
        </View>
      </View>

      <View style={styles.bottomShadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  imageContainer: {
    height: 280,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },

  imageOverlay: {
    position: "absolute",
    bottom: 0,
    height: 40,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  indicators: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
  },

  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  activeIndicator: {
    width: 24,
    backgroundColor: "#fff",
  },

  favButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 50,
    padding: 8,
  },

  infoContainer: {
    padding: 20,
  },

  petName: {
    fontFamily: "outfit-bold",
    fontSize: 28,
    marginBottom: 8,
    color: "#1a1a1a",
  },

  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  addressIcon: {
    marginRight: 6,
  },

  petAddress: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.GRAY,
    flex: 1,
  },

  bottomShadow: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});
