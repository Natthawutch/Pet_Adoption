import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../constants/Colors";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // ตัวอย่างข้อมูลสัตว์เลี้ยง (จริง ๆ ควรดึงจาก API)
  const pets = [
    { id: "1", name: "Buddy" },
    { id: "2", name: "Charlie" },
    { id: "3", name: "Max" },
    { id: "4", name: "Bella" },
  ];

  // ฟิลเตอร์ผลลัพธ์ตาม query
  const handleSearch = (text) => {
    setQuery(text);
    const filtered = pets.filter((pet) =>
      pet.name.toLowerCase().includes(text.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search pets..."
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          query.length > 0 ? <Text style={styles.noResult}>No results found</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginVertical: 25,
    fontSize: 16,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PURPLE,
  },
  resultText: {
    fontSize: 16,
    color: Colors.PURPLE,
  },
  noResult: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.PURPLE,
  },
});
