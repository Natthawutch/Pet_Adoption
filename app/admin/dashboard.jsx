import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Dashboard() {
  const stats = [
    {
      title: "จำนวนผู้ใช้ทั้งหมด",
      number: "132",
      icon: "people",
      color: "#6366f1",
      bgColor: "#eef2ff",
      change: "+12%",
      changeType: "up",
    },
    {
      title: "อาสาสมัคร",
      number: "23",
      icon: "hand-left",
      color: "#ec4899",
      bgColor: "#fce7f3",
      change: "+3",
      changeType: "up",
    },
    {
      title: "สัตว์กำลังหาบ้าน",
      number: "45",
      icon: "paw",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      change: "+5",
      changeType: "up",
    },
    {
      title: "การรับเลี้ยงสำเร็จ",
      number: "28",
      icon: "heart",
      color: "#10b981",
      bgColor: "#d1fae5",
      change: "+8",
      changeType: "up",
    },
    {
      title: "รอการอนุมัติ",
      number: "7",
      icon: "time",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      change: "2",
      changeType: "neutral",
    },
  ];

  const quickActions = [
    { label: "เพิ่มสัตว์", icon: "add-circle", color: "#6366f1" },
    { label: "จัดการผู้ใช้", icon: "people-circle", color: "#8b5cf6" },
    { label: "รายงาน", icon: "document-text", color: "#06b6d4" },
    { label: "ตั้งค่า", icon: "settings", color: "#64748b" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>สถิติระบบ</Text>

          {stats.map((stat, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                styles.statCard,
                pressed && styles.statCardPressed,
              ]}
            >
              <View style={styles.statCardLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: stat.bgColor },
                  ]}
                >
                  <Ionicons name={stat.icon} size={24} color={stat.color} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <View style={styles.statNumberRow}>
                    <Text style={styles.statNumber}>{stat.number}</Text>
                    <View
                      style={[
                        styles.changeBadge,
                        stat.changeType === "up" && styles.changeBadgeUp,
                        stat.changeType === "neutral" &&
                          styles.changeBadgeNeutral,
                      ]}
                    >
                      {stat.changeType === "up" && (
                        <Ionicons
                          name="trending-up"
                          size={12}
                          color="#10b981"
                        />
                      )}
                      <Text
                        style={[
                          styles.changeText,
                          stat.changeType === "up" && styles.changeTextUp,
                        ]}
                      >
                        {stat.change}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>กิจกรรมล่าสุด</Text>
            <Pressable>
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            </Pressable>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>การรับเลี้ยงใหม่</Text>
              <Text style={styles.activityText}>
                สุนัขพันธุ์โกลเด้นถูกรับเลี้ยงแล้ว
              </Text>
              <Text style={styles.activityTime}>5 นาทีที่แล้ว</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-add" size={20} color="#6366f1" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>ผู้ใช้ใหม่</Text>
              <Text style={styles.activityText}>มีสมาชิกใหม่เข้าร่วมระบบ</Text>
              <Text style={styles.activityTime}>15 นาทีที่แล้ว</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>รอการอนุมัติ</Text>
              <Text style={styles.activityText}>
                มีคำขอรับเลี้ยงใหม่ 3 รายการ
              </Text>
              <Text style={styles.activityTime}>1 ชั่วโมงที่แล้ว</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  statCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "500",
  },
  statNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  changeBadgeUp: {
    backgroundColor: "#d1fae5",
  },
  changeBadgeNeutral: {
    backgroundColor: "#fef3c7",
  },
  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  changeTextUp: {
    color: "#10b981",
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  activitySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366f1",
  },
  activityCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  activityText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
