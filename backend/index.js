require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const analizarRoutes = require("./routes/analizar");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// CONEXIÓN MONGO
// =====================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Mongo conectado");
  })
  .catch(err => {
    console.log("❌ Error Mongo:", err);
  });

// =====================
// RUTAS
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/analizar", analizarRoutes);

// =====================
// SERVIDOR
// =====================
app.listen(4000, () => {
  console.log("🚀 Servidor iniciado en puerto 4000");
});