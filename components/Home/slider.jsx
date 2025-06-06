import { Image } from "expo-image";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import { db } from "../../config/FirebaseConfig";

export default function Slider() {
  const [sliderList, setSliderList] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    GetSlider();
  }, []);

  useEffect(() => {
    if (sliderList.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % sliderList.length;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); // 4 วินาที

    return () => clearInterval(interval);
  }, [currentIndex, sliderList]);

  const GetSlider = async () => {
    setSliderList([]);
    const snapshot = await getDocs(collection(db, "Sliders"));
    const sliders = snapshot.docs.map((doc) => doc.data());
    setSliderList(sliders);
  };

  return (
    <View style={{ marginTop: 15 }}>
      <FlatList
        ref={flatListRef}
        data={sliderList}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Image
              source={{ uri: item?.imageUrl }}
              style={styles.sliderImage}
              contentFit="cover"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderImage: {
    width: Dimensions.get("window").width * 1.2,
    height: 170,
    borderRadius: 15,
    marginRight: 10,
  },
});
