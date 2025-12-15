import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // เพิ่มบรรทัดนี้
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Header from "../../components/Home/header";
import Slider from "../../components/Home/slider";
import { supabase } from "../../config/supabaseClient";

export default function Home() {
  const { user } = useUser();
  const router = useRouter(); // เพิ่มบรรทัดนี้
  const [pets, setPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: "ทั้งหมด",
    sex: "ทั้งหมด",
    breed: "ทั้งหมด",
  });

  // Available filter options
  const [availableBreeds, setAvailableBreeds] = useState([]);

  // Fetch pets
  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPets(data || []);

      // Extract unique breeds
      const breeds = [...new Set(data?.map((p) => p.breed).filter(Boolean))];
      setAvailableBreeds(breeds);

      applyFilters(data || []);
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoadingPets(false);
      setRefreshing(false);
    }
  };

  // Apply filters
  const applyFilters = (petsData = pets) => {
    let filtered = [...petsData];

    if (filters.category !== "ทั้งหมด") {
      filtered = filtered.filter((pet) => pet.category === filters.category);
    }

    if (filters.sex !== "ทั้งหมด") {
      filtered = filtered.filter(
        (pet) => pet.sex?.toLowerCase() === filters.sex.toLowerCase()
      );
    }

    if (filters.breed !== "ทั้งหมด") {
      filtered = filtered.filter((pet) => pet.breed === filters.breed);
    }

    setFilteredPets(filtered);
  };

  // Initial fetch
  useEffect(() => {
    fetchPets();
  }, []);

  // Apply filters when changed
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPets();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "ทั้งหมด",
      sex: "ทั้งหมด",
      breed: "ทั้งหมด",
    });
    setShowFilterModal(false);
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "ทั้งหมด"
  ).length;

  // Navigate to pet detail
  const handlePetPress = (pet) => {
    router.push({
      pathname: "/pet-details",
      params: {
        id: pet.id,
        name: pet.name,
        category: pet.category,
        breed: pet.breed,
        age: pet.age,
        weight: pet.weight,
        sex: pet.sex,
        address: pet.address,
        about: pet.about,
        personality: pet.personality,
        vaccine_history: pet.vaccine_history,
        is_neutered: pet.is_neutered,
        post_status: pet.post_status,
        image_url: pet.image_url,
        images: pet.images,
        video_url: pet.video_url,
        username: pet.username,
        email: pet.email,
        userImage: pet.userImage,
        user_id: pet.user_id,
      },
    });
  };

  // ฟังก์ชันแปลงเพศ
  const getGenderInfo = (sex) => {
    const normalizedSex = sex?.toLowerCase();
    if (normalizedSex === "male" || normalizedSex === "ผู้") {
      return { icon: "male", color: "#3B82F6", label: "ผู้" };
    }
    if (normalizedSex === "female" || normalizedSex === "เมีย") {
      return { icon: "female", color: "#EC4899", label: "เมีย" };
    }
    return { icon: "help-circle-outline", color: "#6B7280", label: "ไม่ระบุ" };
  };

  // แปลงหมวดหมู่
  const getCategoryLabel = (category) => {
    const labels = {
      Dog: "สุนัข",
      Cat: "แมว",
      Other: "อื่นๆ",
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Dog: "🐕",
      Cat: "🐈",
      Other: "🐾",
    };
    return icons[category] || "🐾";
  };

  // Render pet card
  const renderPetItem = ({ item }) => {
    const gender = getGenderInfo(item.sex);

    return (
      <TouchableOpacity
        style={styles.petCard}
        activeOpacity={0.95}
        onPress={() => handlePetPress(item)} // เพิ่มบรรทัดนี้
      >
        <View style={styles.petImageContainer}>
          <Image
            source={{
              uri:
                item.image_url ||
                "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300&fit=crop",
            }}
            style={styles.petImage}
          />

          {/* Category Badge */}
          <View style={styles.petCategoryTag}>
            <Text style={styles.petCategoryEmoji}>
              {getCategoryIcon(item.category)}
            </Text>
            <Text style={styles.petCategoryText}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>

          {/* Info Badges */}
          <View style={styles.petBadges}>
            {item.age && (
              <View style={styles.badge}>
                <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>{item.age} ปี</Text>
              </View>
            )}

            {item.sex && (
              <View style={styles.badge}>
                <Ionicons name={gender.icon} size={12} color="#FFFFFF" />
                <Text style={styles.badgeText}>{gender.label}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.petInfo}>
          <View style={styles.petHeader}>
            <View style={styles.petNameContainer}>
              <Text style={styles.petName} numberOfLines={1}>
                {item.name || "สัตว์เลี้ยงน่ารัก"}
              </Text>
              {item.breed && (
                <Text style={styles.petBreed} numberOfLines={1}>
                  {item.breed}
                </Text>
              )}
            </View>

            {item.weight && (
              <View style={styles.weightBadge}>
                <Ionicons name="fitness-outline" size={14} color="#8B5CF6" />
                <Text style={styles.weightText}>{item.weight} kg</Text>
              </View>
            )}
          </View>

          {item.about && (
            <Text style={styles.petDescription} numberOfLines={2}>
              {item.about}
            </Text>
          )}

          <View style={styles.petFooter}>
            <View style={styles.userInfo}>
              <Image
                source={{
                  uri:
                    item.userImage ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(item.username || "User") +
                      "&background=8B5CF6&color=fff",
                }}
                style={styles.userAvatar}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {item.username || "ผู้ใช้"}
                </Text>
                {item.address && (
                  <View style={styles.locationInfo}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#6B7280"
                    />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={(e) => {
                e.stopPropagation(); // ป้องกันไม่ให้ไปหน้า detail
                // TODO: เพิ่มฟังก์ชัน chat ตรงนี้
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="search-outline" size={80} color="#E5E7EB" />
      </View>
      <Text style={styles.emptyStateTitle}>ไม่พบสัตว์เลี้ยง</Text>
      <Text style={styles.emptyStateDescription}>
        ลองเปลี่ยนตัวกรองหรือรีเซ็ตการค้นหาดูนะคะ
      </Text>
      {activeFilterCount > 0 && (
        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.resetButtonText}>รีเซ็ตตัวกรอง</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Filter option button
  const FilterOption = ({ label, value, onPress, selected }) => (
    <TouchableOpacity
      style={[styles.filterOption, selected && styles.filterOptionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterOptionText,
          selected && styles.filterOptionTextSelected,
        ]}
      >
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <Header />

      <FlatList
        ListHeaderComponent={
          <>
            <Slider />

            {/* Filter Section */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <View style={styles.filterTitleRow}>
                  <Ionicons name="options-outline" size={24} color="#1F2937" />
                  <Text style={styles.filterTitle}>ตัวกรอง</Text>
                  {activeFilterCount > 0 && (
                    <View style={styles.filterCountBadge}>
                      <Text style={styles.filterCountText}>
                        {activeFilterCount}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowFilterModal(true)}
                >
                  <Ionicons name="funnel" size={18} color="#8B5CF6" />
                  <Text style={styles.filterButtonText}>เพิ่มเติม</Text>
                </TouchableOpacity>
              </View>

              {/* Active Filters Display */}
              {activeFilterCount > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.activeFiltersScroll}
                  contentContainerStyle={styles.activeFiltersContainer}
                >
                  {filters.category !== "ทั้งหมด" && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterLabel}>ประเภท:</Text>
                      <Text style={styles.activeFilterValue}>
                        {getCategoryLabel(filters.category)}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFilters({ ...filters, category: "ทั้งหมด" })
                        }
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#8B5CF6"
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {filters.sex !== "ทั้งหมด" && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterLabel}>เพศ:</Text>
                      <Text style={styles.activeFilterValue}>
                        {filters.sex === "Male" ? "ผู้" : "เมีย"}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFilters({ ...filters, sex: "ทั้งหมด" })
                        }
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#8B5CF6"
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  {filters.breed !== "ทั้งหมด" && (
                    <View style={styles.activeFilterChip}>
                      <Text style={styles.activeFilterLabel}>สายพันธุ์:</Text>
                      <Text style={styles.activeFilterValue}>
                        {filters.breed}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFilters({ ...filters, breed: "ทั้งหมด" })
                        }
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#8B5CF6"
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.clearAllButton}
                    onPress={resetFilters}
                  >
                    <Text style={styles.clearAllText}>ล้างทั้งหมด</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                พบ {filteredPets.length} ตัว
              </Text>
            </View>
          </>
        }
        data={filteredPets}
        renderItem={renderPetItem}
        keyExtractor={(item, index) => item.id?.toString() || `pet-${index}`}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={!loadingPets && renderEmptyState()}
        ListFooterComponent={
          loadingPets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>กำลังโหลด...</Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ตัวกรองขั้นสูง</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Category Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>ประเภทสัตว์</Text>
                <View style={styles.filterOptionsGrid}>
                  <FilterOption
                    label="ทั้งหมด"
                    value="ทั้งหมด"
                    selected={filters.category === "ทั้งหมด"}
                    onPress={() =>
                      setFilters({ ...filters, category: "ทั้งหมด" })
                    }
                  />
                  <FilterOption
                    label="🐕 สุนัข"
                    value="Dog"
                    selected={filters.category === "Dog"}
                    onPress={() => setFilters({ ...filters, category: "Dog" })}
                  />
                  <FilterOption
                    label="🐈 แมว"
                    value="Cat"
                    selected={filters.category === "Cat"}
                    onPress={() => setFilters({ ...filters, category: "Cat" })}
                  />
                </View>
              </View>

              {/* Sex Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>เพศ</Text>
                <View style={styles.filterOptionsGrid}>
                  <FilterOption
                    label="ทั้งหมด"
                    value="ทั้งหมด"
                    selected={filters.sex === "ทั้งหมด"}
                    onPress={() => setFilters({ ...filters, sex: "ทั้งหมด" })}
                  />
                  <FilterOption
                    label="♂️ ผู้"
                    value="Male"
                    selected={filters.sex === "Male"}
                    onPress={() => setFilters({ ...filters, sex: "Male" })}
                  />
                  <FilterOption
                    label="♀️ เมีย"
                    value="Female"
                    selected={filters.sex === "Female"}
                    onPress={() => setFilters({ ...filters, sex: "Female" })}
                  />
                </View>
              </View>

              {/* Breed Filter */}
              {availableBreeds.length > 0 && (
                <View style={styles.filterGroup}>
                  <Text style={styles.filterGroupTitle}>สายพันธุ์</Text>
                  <View style={styles.filterOptionsGrid}>
                    <FilterOption
                      label="ทั้งหมด"
                      value="ทั้งหมด"
                      selected={filters.breed === "ทั้งหมด"}
                      onPress={() =>
                        setFilters({ ...filters, breed: "ทั้งหมด" })
                      }
                    />
                    {availableBreeds.map((breed) => (
                      <FilterOption
                        key={breed}
                        label={breed}
                        value={breed}
                        selected={filters.breed === breed}
                        onPress={() => setFilters({ ...filters, breed })}
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetModalButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetModalButtonText}>รีเซ็ต</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>ใช้ตัวกรอง</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filterSection: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  filterCountBadge: {
    backgroundColor: "#8B5CF6",
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  filterCountText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
  },
  activeFiltersScroll: {
    marginTop: 8,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C4B5FD",
  },
  activeFilterLabel: {
    fontSize: 13,
    color: "#6B21A8",
    fontWeight: "600",
  },
  activeFilterValue: {
    fontSize: 13,
    color: "#7C3AED",
    fontWeight: "700",
  },
  clearAllButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearAllText: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  petCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  petImageContainer: {
    position: "relative",
    height: 240,
    backgroundColor: "#F3F4F6",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  petCategoryTag: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  petCategoryEmoji: {
    fontSize: 16,
  },
  petCategoryText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "700",
  },
  petBadges: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  petInfo: {
    padding: 16,
  },
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  petNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  petName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  weightBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  weightText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "700",
  },
  petDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  petFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 3,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: "#6B7280",
    flex: 1,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 20,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    minWidth: 100,
  },
  filterOptionSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
    flex: 1,
  },
  filterOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resetModalButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },
  resetModalButtonText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
