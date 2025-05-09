import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import PetInfo from "../../components/PetDetails/PetInfo";
import PetSublnfo from "../../components/PetDetails/PetSublnfo";
import AdoutPet from "../../components/PetDetails/AdoutPet";
import Ownerlnfo from "../../components/PetDetails/Ownerlnfo";
import Colors from "../../constants/Colors";

export default function PetDetails() {
  const pet = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
    });
  }, []);

  return (
    <View>
      <ScrollView>
        {/* Pet Info */}
        <PetInfo pet={pet} />
        {/* Pet Sublnfo */}
        <PetSublnfo pet={pet} />
        {/* about */}
        <AdoutPet pet={pet} />
        {/* owner details */}
        <Ownerlnfo />
        <View style={{ height: 70 }}></View>
        
      </ScrollView>
      {/* about me button */}
      <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.adoptBtn}>
            <Text style={{ fontSize: 20, fontFamily: "oswald-medium", textAlign: "center", color: Colors.WHITE }}>
              Adout Me
            </Text>
          </TouchableOpacity>
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
  adoptBtn: {
    padding: 10,
    backgroundColor: Colors.BLUE,
  },
  bottomContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
