import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { db } from "../../config/FirebaseConfig";
import Category from "./category";
import Petlistitem from "./petlistitem";

export default function Petlistbycatgory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    GetPetList("Dogs"); // โหลดหมวดหมู่เริ่มต้น
  }, []);

  const GetPetList = async (category) => {
    setLoader(true);
    setPetList([]); // เคลียร์ก่อนโหลดใหม่
    const q = query(collection(db, "Pets"), where("category", "==", category));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      setPetList((prevList) => [...prevList, doc.data()]);
    });
    setLoader(false);
  };

  return (
    <View>
      <Category category={(value) => GetPetList(value)} />
      <FlatList
        data={petList}
        style={{ marginTop: 10 }}
        horizontal={true}
        refreshing={loader}
        onRefresh={() => GetPetList("Dogs")} // โหลดหมวดหมู่เริ่มต้น
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Petlistitem pet={item} />}
      />
    </View>
  );
}
