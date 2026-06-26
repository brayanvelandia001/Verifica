const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const Jimp = require("jimp");
const jsQR = require("jsqr");

const app = express();

app.use(cors());

const upload = multer({
  dest: "uploads/"
});

// -------------------- UTIL --------------------

function limpiarNumero(valor) {
  if (!valor) return "";
  return valor.replace(/\D/g, "");
}

function normalizarTexto(texto) {
  return texto
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------- QR --------------------

async function buscarQR(buffer) {
  const image = await Jimp.read(buffer);

  const { data, width, height } = image.bitmap;

  const qr = jsQR(data, width, height, {
    inversionAttempts: "attemptBoth"
  });

  if (!qr) return null;

  return qr.data;
}

// -------------------- OCR --------------------

async function extraerOCR(buffer) {
  const result = await Tesseract.recognize(buffer, "spa", {
    logger: m => console.log(m)
  });

  return result.data.text;
}

// -------------------- PARSEO --------------------

function extraerDatos(texto) {
  const limpio = normalizarTexto(texto);

  // referencia mejorada
  const referencia =
    limpio.match(/(?:REF|REFERENCIA|TRX)\s*[:\-]?\s*([A-Z0-9]{6,})/)?.[1]
    || limpio.match(/[A-Z0-9]{8,}/)?.[0]
    || null;

  // monto mejorado
  const monto =
    limpio.match(/\b\d{1,3}([.,]\d{3})*(\.\d{1,2})?\b/g)?.pop()
    || null;

  // banco detectado
  const banco =
    limpio.match(/NEQUI|BANCOLOMBIA|DAVIVIENDA|DAVIPLATA/i)?.[0]
    || "NO DETECTADO";

  return {
    referencia,
    monto,
    banco
  };
}

// -------------------- VALIDACIÓN --------------------

function validar(ocr, qr) {
  let estado = "REVISAR";
  let motivos = [];

  // si no hay datos mínimos
  if (!ocr.monto || !ocr.referencia) {
    return {
      estado: "RECHAZADO",
      motivos: ["Datos insuficientes en OCR"]
    };
  }

  // validar QR vs OCR
  if (qr) {
    const montoQR = qr.match(/\d{4,}/)?.[0];
    const refQR = qr.match(/[A-Z0-9]{5,}/)?.[0];

    if (montoQR && ocr.monto) {
      if (limpiarNumero(montoQR) === limpiarNumero(ocr.monto)) {
        motivos.push("Monto coincide");
      } else {
        motivos.push("Monto diferente");
        estado = "RECHAZADO";
      }
    }

    if (refQR && ocr.referencia) {
      if (refQR === ocr.referencia) {
        motivos.push("Referencia coincide");
      } else {
        motivos.push("Referencia diferente");
        estado = "RECHAZADO";
      }
    }
  }

  if (estado === "REVISAR") {
    estado = "APROBADO";
  }

  return {
    estado,
    motivos
  };
}

// -------------------- ENDPOINT --------------------

app.post("/analizar", upload.single("imagen"), async (req, res) => {
  try {
    console.log("Imagen recibida");

    // optimizar imagen OCR
    const imagenOCR = await sharp(req.file.path)
      .grayscale()
      .normalize()
      .resize({ width: 2500 })
      .toBuffer();

    // imagen QR
    const imagenQR = await sharp(req.file.path)
      .resize({ width: 4000 })
      .toBuffer();

    // OCR
    const texto = await extraerOCR(imagenOCR);

    console.log("===== OCR =====");
    console.log(texto);

    // QR
    let qrTexto = null;

    try {
      qrTexto = await buscarQR(imagenQR);
    } catch (err) {
      console.log("Error leyendo QR");
    }

    console.log("===== QR =====");
    console.log(qrTexto);

    // extraer datos OCR
    const ocrData = extraerDatos(texto);

    console.log("===== OCR DATA =====");
    console.log(ocrData);

    // validar
    const resultado = validar(ocrData, qrTexto);

    // score simple
    let confianza = 40;
    if (resultado.estado === "APROBADO") confianza = 95;
    if (resultado.estado === "REVISAR") confianza = 60;
    if (resultado.estado === "RECHAZADO") confianza = 20;

    res.json({
      estado: resultado.estado,
      confianza,
      banco: ocrData.banco,
      ocr: ocrData,
      qr: qrTexto,
      motivos: resultado.motivos,
      texto
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Error analizando comprobante"
    });
  }
});

// -------------------- SERVER --------------------

app.listen(4000, () => {
  console.log("Servidor OCR puerto 4000");
});