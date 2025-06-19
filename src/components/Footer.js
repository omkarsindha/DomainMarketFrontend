import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Footer = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={28} color="#66fcf1" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search-outline" size={28} color="#66fcf1" />
          <Text style={styles.footerText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => navigation.navigate("Favorites")}
        >
          <Ionicons name="heart-outline" size={28} color="#66fcf1" />
          <Text style={styles.footerText}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerTab}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-outline" size={28} color="#66fcf1" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#0b0c10",
    paddingVertical: 10,
    borderTopWidth: 2,
    borderColor: "#66fcf1",
    width: "100%",
  },
  footerTab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  footerText: {
    color: "#66fcf1",
    fontSize: 12,
    marginTop: 4,
  },
  selectedTab: {
    backgroundColor: "#66fcf1",
    borderRadius: 8,
  },
});

export default Footer;
