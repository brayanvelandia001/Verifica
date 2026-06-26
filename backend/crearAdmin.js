require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function crearAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existe = await User.findOne({
      email: "admin@verifica.com",
    });

    if (existe) {
      console.log("⚠️ El administrador ya existe.");
      process.exit();
    }

    const password = await bcrypt.hash("123456", 10);

    await User.create({
      nombre: "Administrador",
      email: "admin@verifica.com",
      password,
      rol: "admin",
    });

    console.log("✅ Administrador creado correctamente.");

    process.exit();
  } catch (err) {
    console.log(err);
  }
}

crearAdmin();