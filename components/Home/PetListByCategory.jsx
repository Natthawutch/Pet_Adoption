import { View, FlatList, Text } from "react-native";
import React, { useState, useEffect } from "react";
import Category from "./Category";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import PetListItem from "./PetListItem";

export default function PetListByCategory() {
  const [petList, setPetList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Dog");
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    GetPetList(selectedCategory); // โหลดรายการเมื่อ mount ครั้งแรก
  }, []);

  const GetPetList = async (category) => {
    setLoader(true);
    setPetList([]);
    const q = query(collection(db, "Pets"), where("category", "==", category));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      setPetList((petList) => [...petList, doc.data()]);
      // pets.push(doc.data());
    });
    setLoader(false);
  };

  return (
    <View>
      <Category category={(value) => GetPetList(value)} />

      <FlatList
        style={{ marginTop: 10 }}
        data={petList}
        horizontal={true}
        refreshing={loader}
        onRefresh={() => GetPetList('Dog')}
        renderItem={({ item }) => <PetListItem pet={item} />}
      />
    </View>
  );
}
