import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const VotedPersonsScreen = ({ route }) => {
  const { votedUsers } = route.params; // Get the transformed voted users data
console.log(votedUsers);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voted Persons</Text>
      <FlatList
        data={votedUsers}
        keyExtractor={(item) => item.studentID} // Use studentID as the key
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>
              {item.gender} | {item.studentID}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  itemContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
  },
});

export default VotedPersonsScreen;