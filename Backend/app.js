require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const path = require("path");

const dbUser = process.env.USER;
const dbPassword = process.env.PASSWORD;
const dbUrl = process.env.URL;

mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbUrl}`)
  .then(() => console.log("MongoDB connection successful !"))
  .catch(() => console.log("Connection to MongoDB failed!"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
