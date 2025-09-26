const socket = io();
const markers = {};
const map = L.map("map").setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Code Blooded",
}).addTo(map);

// Watch your location
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      socket.emit("send-location", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
    },
    (err) => console.error(err),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );
}

// Existing users when a new client connects
socket.on("all-users", (allUsers) => {
  for (const id in allUsers) {
    const { lat, lng } = allUsers[id];
    if (!markers[id]) {
      markers[id] = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(id === socket.id ? "You" : `User: ${id}`);
    }
  }
});

// Update markers in real-time
socket.on("recieve-location", ({ id, lat, lng }) => {
  if (markers[id]) {
    markers[id].setLatLng([lat, lng]);
  } else {
    markers[id] = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(id === socket.id ? "You" : `User: ${id}`);
  }

  // Center map on your location only
  if (id === socket.id) map.setView([lat, lng], 16);
});

// Remove markers on disconnect
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
