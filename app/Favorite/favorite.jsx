import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PetListItem from "../../components/Home/petlistitem";
import { supabase } from "../../config/supabaseClient";
import Shared from "../../Shared/Shared";

export default function Favorite() {
  const [user, setUser] = useState(null);
  const [favIds, setFavIds] = useState([]);
  const [favPetList, setFavPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const sessionUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) GetFavPetIds();
  }, [user]);

  const GetFavPetIds = async () => {
    setLoader(true);
    const favIds = await Shared.GetFavPetIds(user);
    setFavIds(favIds);
    setLoader(false);
    GetFavPetList(favIds);
  };

  const GetFavPetList = async (favId_) => {
    setLoader(true);
    setFavPetList([]);

    const { data, error } = await supabase
      .from("favorites")
      .select("pet_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching pets:", error);
      setLoader(false);
      return;
    }

    setFavPetList(data || []);
    setLoader(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "outfit-medium",
            fontSize: 28,
            marginLeft: 15,
          }}
        >
          Favorite
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
        <FlatList
          data={favPetList}
          numColumns={2}
          onRefresh={GetFavPetIds}
          refreshing={loader}
          keyExtractor={(item, index) => item.id || index.toString()}
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 15 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginRight: 10 }}>
              <PetListItem pet={item} />
            </View>
          )}
          ListEmptyComponent={
            !loader && (
              <Text
                style={{
                  fontFamily: "outfit-regular",
                  textAlign: "center",
                  marginTop: 40,
                  fontSize: 16,
                  color: "#888",
                }}
              >
                No favorite pets yet.
              </Text>
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}
