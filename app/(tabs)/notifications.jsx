import { LinearGradient } from "expo-linear-gradient"; // If using Expo
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// import LinearGradient from 'react-native-linear-gradient'; // If using bare React Native

const { width } = Dimensions.get("window");

const notificationsData = [
  {
    id: "1",
    title: "You have a new message",
    subtitle: "John sent you a message about Luna",
    time: "2 hours ago",
    type: "message",
    unread: true,
    icon: "💬",
  },
  {
    id: "2",
    title: "Your pet profile was approved",
    subtitle: "Max's profile is now live and visible to others",
    time: "1 day ago",
    type: "approval",
    unread: true,
    icon: "✅",
  },
  {
    id: "3",
    title: "New pet added nearby",
    subtitle: "A Golden Retriever named Buddy joined your area",
    time: "3 days ago",
    type: "discovery",
    unread: false,
    icon: "🐕",
  },
  {
    id: "4",
    title: "Pet walk reminder",
    subtitle: "It's time for Luna's evening walk",
    time: "5 days ago",
    type: "reminder",
    unread: false,
    icon: "🚶",
  },
];

const getNotificationColor = (type) => {
  const colors = {
    message: ["#667eea", "#764ba2"],
    approval: ["#11998e", "#38ef7d"],
    discovery: ["#ff9a9e", "#fecfef"],
    reminder: ["#a8edea", "#fed6e3"],
  };
  return colors[type] || ["#667eea", "#764ba2"];
};

export default function Notifications() {
  const renderNotificationItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          transform: [{ translateX: 0 }],
          opacity: 1,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        {/* Icon with gradient background */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={getNotificationColor(item.type)}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.iconText}>{item.icon}</Text>
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, item.unread && styles.unreadTitle]}>
              {item.title}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>

      {/* Unread indicator line */}
      {item.unread && (
        <LinearGradient
          colors={getNotificationColor(item.type)}
          style={styles.unreadIndicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.emptyIconGradient}
        >
          <Text style={styles.emptyIcon}>🔔</Text>
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        We'll notify you when something important happens
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.header}>Notifications</Text>
        <Text style={styles.headerSubtitle}>Stay updated with your pets</Text>
      </LinearGradient>

      {/* Notifications List */}
      <FlatList
        data={notificationsData}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
    fontWeight: "400",
  },
  listContainer: {
    padding: 16,
    paddingTop: 24,
  },
  notificationItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  unreadIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "transparent",
  },
  // Empty State Styles
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
});
