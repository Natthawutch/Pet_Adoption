import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Shared from "../Shared/Shared";
import { useUser } from "@clerk/clerk-expo";

export default function MarkFav({ pet, color="black" }) {
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    if (user) {
      GetFav();
    }
  }, [user]);

  const GetFav = async () => {
    const result = await Shared.GetFavList(user);
    setFavList(result?.favorites ? result?.favorites : []);
  };

  const AddToFav = async () => {
    const favResult = [...favList, pet.id]; // add the pet.id to the list
    await Shared.UpdateFav(user, favResult);
    GetFav(); // fetch updated favorite list
  };

  const RemoveFromFav = async () => {
    const favResult = favList.filter((item) => item !== pet.id); // remove the pet.id from the list
    await Shared.UpdateFav(user, favResult);
    GetFav(); // fetch updated favorite list
  };

  // Handle the heart button press
  const handleFavPress = () => {
    if (favList.includes(pet.id)) {
      RemoveFromFav(); // Remove if pet is already in the list
    } else {
      AddToFav(); // Add if pet is not in the list
    }
  };

  return (
    <View>
      <Pressable onPress={handleFavPress}>
        <Ionicons
          name={favList.includes(pet.id) ? "heart" : "heart-outline"}
          size={35}
          color={favList.includes(pet.id) ? "red" : color}
        />
      </Pressable>
    </View>
  );
}
