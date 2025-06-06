import { useState } from "react";
import { Alert, Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../constants/Colors";

export default function AddPet() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("");

  const handleSubmit = () => {
    if (!name || !age || !type) {
      Alert.alert("Please fill all fields");
      return;
    }

    Alert.alert("Success", `Added pet: ${name}, Age: ${age}, Type: ${type}`);

    setName("");
    setAge("");
    setType("");
  };

  return (
    <SafeAreaView style={{ flex: 1, }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Pet Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter pet name"
          style={styles.input}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="Enter pet age"
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Type</Text>
        <TextInput
          value={type}
          onChangeText={setType}
          placeholder="Enter pet type (e.g. Dog, Cat)"
          style={styles.input}
        />

        <View style={styles.button}>
          <Button title="Add Pet" onPress={handleSubmit} color={Colors.PURPLE} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    padding: 16,
    flexGrow: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: "bold",
  },
  input: {
    fontSize: 16,
    height: 40,
    borderColor: Colors.PURPLE,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
  },
});
