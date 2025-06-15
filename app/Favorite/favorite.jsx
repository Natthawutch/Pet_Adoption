import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PetListItem from "../../components/Home/petlistitem";
import { supabase } from "../../config/supabaseClient";
import Shared from "../../Shared/Shared";

const { width } = Dimensions.get("window");

export default function Favorite() {
  const [user, setUser] = useState(null);
  const [favIds, setFavIds] = useState([]);
  const [favPetList, setFavPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));
  const navigation = useNavigation();

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const sessionUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (user) GetFavPetIds();
  }, [user]);

  const GetFavPetIds = async () => {
    setLoader(true);
    try {
      const favIds = await Shared.GetFavPetIds(user);
      setFavIds(favIds);
      await GetFavPetList(favIds);
    } catch (error) {
      console.error("Error getting favorite pet IDs:", error);
    } finally {
      setLoader(false);
    }
  };

  const GetFavPetList = async (favId_) => {
    try {
      setFavPetList([]);

      const { data, error } = await supabase
        .from("favorites")
        .select(
          `
          pet_id,
          pets (
            id,
            name,
            image_url,
            breed,
            age,
            sex,
            address,
            about
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching pets:", error);
        return;
      }

      // Extract pet data from the joined query
      const petData = data?.map((item) => item.pets).filter(Boolean) || [];
      setFavPetList(petData);
    } catch (error) {
      console.error("Error in GetFavPetList:", error);
    }
  };

  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff6b6b" />
      <Text style={styles.loadingText}>Loading your favorites...</Text>
    </View>
  );

  const EmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={80} color="#ff6b6b" />
      </View>
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start exploring and add some pets to your favorites!
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate("Home")}
      >
        <LinearGradient
          colors={["#ff6b6b", "#ff8e8e"]}
          style={styles.exploreButtonGradient}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.exploreButtonText}>Explore Pets</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPetItem = ({ item, index }) => {
    const itemAnim = new Animated.Value(0);

    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.petItemContainer,
          {
            opacity: itemAnim,
            transform: [
              {
                translateY: itemAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <PetListItem pet={item} />
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with gradient background */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={["#fff", "#f8f9fa"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Ionicons name="heart" size={28} color="#ff6b6b" />
              <Text style={styles.headerTitle}>My Favorites</Text>
            </View>

            <View style={styles.headerCounter}>
              <Text style={styles.counterText}>{favPetList.length}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loader ? (
          <LoadingIndicator />
        ) : favPetList.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={favPetList}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loader}
                onRefresh={GetFavPetIds}
                colors={["#ff6b6b"]}
                tintColor="#ff6b6b"
              />
            }
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            renderItem={renderPetItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerGradient: {
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "outfit-bold",
    fontSize: 24,
    color: "#333",
    marginLeft: 8,
  },
  headerCounter: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  counterText: {
    fontFamily: "outfit-medium",
    fontSize: 14,
    color: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: "outfit-regular",
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 50,
    backgroundColor: "#fff5f5",
  },
  emptyTitle: {
    fontFamily: "outfit-bold",
    fontSize: 24,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: "outfit-regular",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  exploreButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#ff6b6b",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  exploreButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  exploreButtonText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "white",
    marginLeft: 8,
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  petItemContainer: {
    flex: 1,
    maxWidth: (width - 50) / 2,
    marginHorizontal: 5,
  },
  separator: {
    height: 15,
  },
};
