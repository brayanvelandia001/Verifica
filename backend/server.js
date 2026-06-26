require("dotenv").config();

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");
  })
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
  });