import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function Category({ category }) {
  const [categoryList, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Dogs");

  useEffect(() => {
    GetCategories();
  }, []);

  const GetCategories = async () => {
    setCategories([]);
    const snapshot = await getDocs(collection(db, "Category"));
    snapshot.forEach((doc) => {
      setCategories((prevList) => [...prevList, doc.data()]);
    });
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 20 }}>
        Category
      </Text>
      <FlatList
        data={categoryList}
        keyExtractor={(item, index) => index.toString()}
        numColumns={4}
        renderItem={({ item }) => (
          <View style={{ flex: 1, alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory(item?.name);
                category(item?.name); // เรียก callback
              }}
              style={[
                styles.container,
                selectedCategory === item?.name &&
                  styles.selectedCategoryContainer,
              ]}
            >
              <Image
                source={{ uri: item?.imageUrl }}
                style={{ width: 40, height: 40 }}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: "outfit",
                textAlign: "center",
                marginTop: 5,
              }}
            >
              {item?.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.LIGHT_PURPLE,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.LIGHT_PURPLE,
    margin: 5,
  },
  selectedCategoryContainer: {
    backgroundColor: Colors.PURPLE,
    borderColor: Colors.PURPLE,
  },
});
