const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const users = {};

io.on("connection", (socket) => {
  socket.emit("all-users", users);
  socket.on("send-location", (data) => {
    users[socket.id] = data;
    io.emit("recieve-location", { id: socket.id, ...data });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user-disconnected", socket.id);
  });
});

//Routes
app.get("/", function (req, res) {
  res.render("index");
});

app.get("/features", function (req, res) {
  res.render("features");
});

app.get("/auth", (req, res) => {
  res.render("auth");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);
  res.redirect("/");
});

app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  console.log("Signup attempt:", name, email, password);
  res.redirect("/");
});

app.get("/simulated", (req, res) => {
  res.render("simulated");
});

server.listen(3000);
