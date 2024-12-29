require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");

const dbUser = process.env.USER;
const dbPassword = process.env.PASSWORD;
const dbUrl = process.env.URL;

mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPassword}@${dbUrl}`)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

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

module.exports = app;
