const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "CLAVE_SUPER_SECRETA";

// ---------------- "DB" temporal ----------------
let users = [];

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existe = users.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ error: "Usuario ya existe" });
  }

  const hash = await bcrypt.hash(password, 10);

  users.push({
    id: Date.now(),
    email,
    password: hash,
    role: "user"
  });

  res.json({ message: "Usuario creado" });
});

// ---------------- LOGIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: "Usuario no existe" });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ error: "Contraseña incorrecta" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, user });
});

// ---------------- MIDDLEWARE ----------------
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Sin token" });
  }

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ---------------- OCR PROTEGIDO ----------------
app.post("/analizar", auth, (req, res) => {
  res.json({
    message: "OCR autorizado",
    user: req.user
  });
});

// ---------------- START ----------------
app.listen(4000, () => {
  console.log("🚀 Backend corriendo en http://localhost:4000");
});