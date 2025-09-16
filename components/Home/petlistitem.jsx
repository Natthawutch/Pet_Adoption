import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../config/supabaseClient";
import Colors from "../../constants/Colors";

const { width } = Dimensions.get("window");

export default function CamlistFeedItem({ pet }) {
  const router = useRouter();
  const [image_url, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(pet?.likes || 0);
  const [commentsCount, setCommentsCount] = useState(pet?.comments || 0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (pet?.image_url) {
      if (pet.image_url.startsWith("http")) {
        setImageUrl(pet.image_url);
      } else {
        const { data } = supabase.storage
          .from("pets")
          .getPublicUrl(pet.image_url);
        setImageUrl(data.publicUrl);
      }
    }
  }, [pet?.image_url]);

  const toggleLike = () => {
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };

  const toggleSave = () => {
    setSaved(!saved);
  };

  return (
    <View style={styles.feedItem}>
      {/* Header with seller info */}
      <View style={styles.header}>
        <View style={styles.sellerInfo}>
          <Image
            source={{
              uri:
                pet?.userImage ||
                pet?.seller?.avatar ||
                "https://via.placeholder.com/40",
            }}
            style={styles.sellerAvatar}
          />
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>
              {pet?.username || pet?.seller?.name || "Anonymous Seller"}
            </Text>
            <Text style={styles.postTime}>
              {pet?.created_at
                ? new Date(pet.created_at).toLocaleDateString()
                : "Recently"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={Colors.DARK_GRAY}
          />
        </TouchableOpacity>
      </View>

      {/* Main image */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/pet-details", params: pet })}
        activeOpacity={0.95}
        style={styles.imageContainer}
      >
        {imageLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.PURPLE}
            style={styles.imageLoader}
          />
        )}
        <Image
          source={{ uri: image_url || "https://via.placeholder.com/400" }}
          style={styles.mainImage}
          onLoadEnd={() => setImageLoading(false)}
        />

        {/* Price tag overlay
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            {pet?.price ? `$${pet.price.toFixed(2)}` : ""}
          </Text>
        </View> */}
      </TouchableOpacity>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
            <MaterialCommunityIcons
              name={liked ? "paw" : "paw-outline"}
              size={24}
              color={liked ? "#ff6b35" : Colors.DARK_GRAY}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push({ pathname: "/comments", params: pet })}
            style={styles.actionBtn}
          >
            <FontAwesome name="comment-o" size={22} color={Colors.DARK_GRAY} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => alert("Share feature coming soon!")}
            style={styles.actionBtn}
          >
            <Feather name="send" size={22} color={Colors.DARK_GRAY} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={toggleSave} style={styles.saveBtn}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={saved ? Colors.PURPLE : Colors.DARK_GRAY}
          />
        </TouchableOpacity>
      </View>

      {/* Engagement info */}
      <View style={styles.engagementInfo}>
        {likesCount > 0 && (
          <Text style={styles.likesText}>
            {likesCount} {likesCount === 1 ? "like" : "likes"}
          </Text>
        )}
      </View>

      {/* Pet info and description */}
      <View style={styles.petInfo}>
        <Text style={styles.petName} numberOfLines={1}>
          <Text style={styles.boldText}>{pet?.name || "Unnamed Pet"}</Text>
        </Text>

        {pet?.description && (
          <Text style={styles.description} numberOfLines={2}>
            {pet.description}
          </Text>
        )}

        <View style={styles.petDetails}>
          {pet?.breed && (
            <Text style={styles.detailText}>
              Breed: <Text style={styles.boldText}>{pet.breed}</Text>
            </Text>
          )}
          {pet?.age && (
            <Text style={styles.detailText}>
              Age: <Text style={styles.boldText}>{pet.age}</Text>
            </Text>
          )}
          {pet?.location && (
            <Text style={styles.locationText}>
              <Ionicons
                name="location-outline"
                size={12}
                color={Colors.DARK_GRAY}
              />{" "}
              {pet.location}
            </Text>
          )}
        </View>

        {commentsCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/comments", params: pet })}
          >
            <Text style={styles.viewComments}>
              View all {commentsCount} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  feedItem: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: Colors.BLACK,
  },
  postTime: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.DARK_GRAY,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  imageLoader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
    zIndex: 2,
  },
  // priceTag: {
  //   position: "absolute",
  //   bottom: 16,
  //   right: 16,
  //   backgroundColor: "rgba(0,0,0,0.8)",
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 20,
  // },
  // priceText: {
  //   color: "#fff",
  //   fontFamily: "outfit-bold",
  //   fontSize: 16,
  // },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    marginRight: 16,
    padding: 4,
  },
  saveBtn: {
    padding: 4,
  },
  engagementInfo: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesText: {
    fontFamily: "outfit-medium",
    fontSize: 14,
    color: Colors.BLACK,
  },
  petInfo: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  petName: {
    fontFamily: "outfit",
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 4,
  },
  boldText: {
    fontFamily: "outfit-bold",
  },
  description: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.BLACK,
    lineHeight: 20,
    marginBottom: 8,
  },
  petDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.DARK_GRAY,
    marginBottom: 2,
  },
  locationText: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.DARK_GRAY,
    marginTop: 4,
  },
  viewComments: {
    fontFamily: "outfit",
    fontSize: 14,
    color: Colors.DARK_GRAY,
    marginTop: 4,
  },
});
