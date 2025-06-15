import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const IMAGES = [
  { id: "1", uri: "https://placedog.net/400/400?id=1" },
  { id: "2", uri: "https://loremflickr.com/400/400/bird" },
  { id: "3", uri: "https://placebear.com/400/400" },
  { id: "4", uri: "https://placebear.com/400/400" },
  { id: "5", uri: "https://placedog.net/400/400?id=1" },
  { id: "6", uri: "https://loremflickr.com/400/400/dog" },
  { id: "7", uri: "https://loremflickr.com/400/400/cat" },
  { id: "8", uri: "https://placedog.net/400/400?id=1" },
  { id: "9", uri: "https://loremflickr.com/400/400/rabbit" },
];

export default function IGStyleSearch() {
  const [query, setQuery] = useState("");
  const [filteredImages, setFilteredImages] = useState(IMAGES);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredImages(IMAGES);
    } else {
      // ในตัวอย่างนี้กรองจาก id (สมมติเปลี่ยนเป็นชื่อจริงได้)
      const filtered = IMAGES.filter((img) => img.id.includes(query.trim()));
      setFilteredImages(filtered);
    }
  }, [query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.imageWrapper} activeOpacity={0.8}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#8e8e93" />
        <TextInput
          placeholder="ค้นหา"
          placeholderTextColor="#8e8e93"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            style={styles.clearBtn}
          >
            <Ionicons name="close-circle" size={20} color="#8e8e93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Grid รูปภาพ */}
      <FlatList
        data={filteredImages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#efefef",
    marginHorizontal: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: "#222",
  },
  clearBtn: {
    marginLeft: 6,
  },
  gridContainer: {
    paddingHorizontal: 6,
  },
  imageWrapper: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 3,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
