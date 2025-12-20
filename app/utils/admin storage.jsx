import AsyncStorage from "@react-native-async-storage/async-storage";

const ADMIN_KEY = "@admin_status";

/**
 * บันทึกสถานะ Admin
 * @param {boolean} isAdmin
 */
export const saveAdminStatus = async (isAdmin) => {
  try {
    await AsyncStorage.setItem(ADMIN_KEY, JSON.stringify(isAdmin));
  } catch (error) {
    console.error("Error saving admin status:", error);
  }
};

/**
 * ดึงสถานะ Admin
 * @returns {Promise<boolean>}
 */
export const getAdminStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(ADMIN_KEY);
    return value !== null ? JSON.parse(value) : false;
  } catch (error) {
    console.error("Error getting admin status:", error);
    return false;
  }
};

/**
 * ล้างสถานะ Admin (logout)
 */
export const clearAdminStatus = async () => {
  try {
    await AsyncStorage.removeItem(ADMIN_KEY);
  } catch (error) {
    console.error("Error clearing admin status:", error);
  }
};
