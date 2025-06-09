import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient"; // ต้องสร้างไฟล์นี้ให้เชื่อม Supabase
import Colors from "../../constants/Colors";

export default function Category({ category }) {
  
  const [categoryList, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Dogs");

  useEffect(() => {
    GetCategories();
  }, []);

  const GetCategories = async () => {
    const { data, error } = await supabase.from("category").select("*");

    if (error) {
      console.error("Error fetching categories:", error.message);
      return;
    }

    if (data) {
      const desiredOrder = ["Dogs", "Cats", "Birds", "Rabbits"];
      const sortedData = desiredOrder
        .map((name) => data.find((item) => item.name === name))
        .filter(Boolean); // กรอง null เผื่อมีชื่อไม่ตรง

      setCategories(sortedData);
    }
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
                category(item?.name); // callback
              }}
              style={[
                styles.container,
                selectedCategory === item?.name &&
                  styles.selectedCategoryContainer,
              ]}
            >
              <Image
                source={{ uri: item?.imageurl }}
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
