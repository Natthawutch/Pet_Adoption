import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import Header from "../../components/Home/header";
import Petlistbycatgory from "../../components/Home/petlistbycatgory";
import Slider from "../../components/Home/slider";
import Colors from "../../constants/Colors";

export default function Home() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerWrapper}>
        <Header />
      </View>

      <FlatList
        ListHeaderComponent={<Slider />}
        data={[]}
        renderItem={null}
        ListEmptyComponent={<Petlistbycatgory />}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerWrapper: {
    paddingHorizontal: 12, // กำหนดความห่างซ้าย-ขวา
    paddingTop: 15, // ปรับช่องว่างบน (ถ้าต้องการ)
  },
  container: {
    padding: 20,
  },
  addNewPetContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginTop: 20,
    backgroundColor: Colors.LIGHT_PURPLE,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.PURPLE,
    borderStyle: "dashed",
    width: "90%",
    alignSelf: "center",
  },
  addNewPetText: {
    fontFamily: "outfit-medium",
    fontSize: 18,
    color: Colors.PURPLE,
  },
});
