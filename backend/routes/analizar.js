const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");

const upload = multer({ storage: multer.memoryStorage() });

function safe(str) {
    return (str || "").toLowerCase();
}

// ===============================
// DETECTOR DE TIPO MEJORADO
// ===============================
function detectarTipo(texto) {

    const t = texto.toLowerCase();

    // 🔴 RUT (más realista)
    if (
        t.includes("rut") ||
        t.includes("registro unico") ||
        t.includes("tribut") ||
        /\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b/.test(texto)
    ) {
        return "rut";
    }

    // 🪪 CÉDULA (evita confundir montos)
    if (
        t.includes("cedula") ||
        t.includes("cédula") ||
        t.includes("cc") ||
        /\b\d{8,10}\b/.test(texto)
    ) {
        return "cedula";
    }

    // 💳 COMPROBANTE
    if (
        t.includes("transferencia") ||
        t.includes("pago") ||
        t.includes("nequi") ||
        t.includes("bancolombia") ||
        t.includes("daviplata")
    ) {
        return "comprobante";
    }

    return "desconocido";
}

router.post("/", upload.single("imagen"), async (req, res) => {

    if (!req.file) {
        return res.json({
            tipo: "desconocido",
            estado: "RECHAZADO",
            confianza: 0,
            ocr: {},
            qr: { existe: false, valor: null },
            texto: "",
            motivos: ["No se recibió imagen"]
        });
    }

    try {

        // ================= OCR =================
        const { data } = await Tesseract.recognize(
            req.file.buffer,
            "spa",
            { logger: () => {} }
        );

        const rawText = data.text || "";

        const texto = rawText
            .replace(/\r/g, "\n")
            .replace(/[^\w\s\$\.\,\:\-\n]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        const lines = texto.split("\n").map(l => l.trim()).filter(Boolean);

        const t = safe(texto);

        // ================= TIPO =================
        const tipo = detectarTipo(texto);

        let ocr = {};
        let motivos = [];
        let confianza = 20;
        let estado = "RECHAZADO";

        // ================= COMPROBANTE =================
        if (tipo === "comprobante") {

            const montoMatch =
                texto.match(/\$\s?\d{1,3}(\.\d{3})+(,\d{2})?/) ||
                texto.match(/\b\d{4,}\b/);

            const monto = montoMatch ? montoMatch[0].replace(/[^0-9]/g, "") : null;

            let referencia = null;

            for (let line of lines) {
                if (/ref|referencia|trx/i.test(line)) {
                    const m = line.match(/\d{6,20}/);
                    if (m) referencia = m[0];
                }
            }

            ocr = { monto, referencia };

            if (monto) { confianza += 25; motivos.push("Monto detectado"); }
            if (referencia) { confianza += 30; motivos.push("Referencia detectada"); }

            estado = (monto && referencia) ? "APROBADO" : "RECHAZADO";
        }

        // ================= CÉDULA =================
        if (tipo === "cedula") {

            const match = texto.match(/\b\d{8,10}\b/);
            const numero = match ? match[0] : null;

            ocr = { numero_documento: numero };

            if (numero) {
                confianza += 60;
                estado = "VALIDO";
                motivos.push("Cédula detectada");
            }
        }

        // ================= RUT =================
        if (tipo === "rut") {

            const match = texto.match(/\b\d{1,2}\.\d{3}\.\d{3}-[\dkK]\b|\b\d{7,9}-[\dkK]\b/);

            const rut = match ? match[0] : null;

            ocr = { rut };

            if (rut) {
                confianza += 60;
                estado = "VALIDO";
                motivos.push("RUT detectado correctamente");
            }
        }

        // ================= BANCO =================
        const bancos = {
            Bancolombia: ["bancolombia"],
            Nequi: ["nequi"],
            Daviplata: ["daviplata"],
            Davivienda: ["davivienda"],
            BBVA: ["bbva"],
            Bogota: ["bogota"],
            Occidente: ["occidente"]
        };

        let banco = null;

        for (let key in bancos) {
            if (bancos[key].some(w => t.includes(w))) {
                banco = key;
                break;
            }
        }

        if (banco) motivos.push("Banco detectado");

        // ================= QR (simple realista) =================
        let qr = {
            existe: /qr|codigo qr|scan/i.test(t),
            valor: null
        };

        // ================= LIMITE =================
        if (confianza > 100) confianza = 100;

        // ================= RESPONSE FINAL =================
        return res.json({
            tipo,
            estado,
            confianza,
            banco,
            ocr,
            qr,
            texto,
            motivos: motivos.length ? motivos : ["Sin datos suficientes"]
        });

    } catch (err) {

        console.log(err);

        return res.json({
            tipo: "desconocido",
            estado: "RECHAZADO",
            confianza: 0,
            ocr: {},
            qr: { existe: false, valor: null },
            texto: "",
            motivos: ["Error procesando imagen"]
        });
    }
});

module.exports = router;