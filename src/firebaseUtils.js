// src/firebaseUtils.js
import { getDatabase, ref, set, update } from "firebase/database";

// Function to add truck data
export function addTruckData(truckId, data) {
  const db = getDatabase();
  set(ref(db, `Truck ${truckId}`), data)
    .then(() => {
      console.log("Data added successfully!");
    })
    .catch((error) => {
      console.error("Error adding data: ", error);
    });
}

// Function to update truck data
export function updateTruckData(truckId, data) {
  const db = getDatabase();
  update(ref(db, `Truck ${truckId}`), data)
    .then(() => {
      console.log("Data updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating data: ", error);
    });
}
