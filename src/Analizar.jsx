import { useState } from "react";

function Analizar({ token, logout }) {
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);

  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- SUBIR IMAGEN ----------------
  const seleccionarImagen = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImagen(file);
    setPreview(URL.createObjectURL(file));

    setResultado(null);
    setTipo("success");
    setMensaje("📄 Comprobante cargado correctamente");
  };

  // ---------------- ANALIZAR ----------------
  const analizar = async () => {
    if (!imagen) {
      setTipo("error");
      setMensaje("⚠️ Debes subir una imagen primero");
      return;
    }

    try {
      setLoading(true);
      setTipo("loading");
      setMensaje("🔍 Analizando comprobante...");

      const formData = new FormData();
      formData.append("imagen", imagen);

      const respuesta = await fetch("http://localhost:4000/analizar", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        },
        body: formData
      });

      const datos = await respuesta.json();

      if (!respuesta.ok || datos.error) {
        throw new Error(datos.error || "Error backend");
      }

      setResultado(datos);
      setTipo("success");
      setMensaje("✅ Análisis completado");

    } catch (error) {
      console.log(error);
      setTipo("error");
      setMensaje("❌ Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LIMPIAR ----------------
  const limpiar = () => {
    setImagen(null);
    setPreview(null);
    setResultado(null);
    setMensaje("");
    setTipo("");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center p-5">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">💳 Comprobante AI</h1>

          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-300 text-center mb-6">
          OCR + QR Verificación automática
        </p>

        {/* PREVIEW */}
        <div className="h-64 bg-black/20 rounded-2xl flex items-center justify-center overflow-hidden mb-5">

          {preview ? (
            <img
              src={preview}
              className="w-full h-full object-contain"
              alt="preview"
            />
          ) : (
            <span className="text-gray-400">
              📷 Sube un comprobante
            </span>
          )}

        </div>

        {/* INPUT FILE */}
        <label className="block bg-cyan-500 hover:bg-cyan-400 text-center p-4 rounded-2xl cursor-pointer font-bold mb-3">
          📁 Seleccionar imagen
          <input
            type="file"
            accept="image/*"
            onChange={seleccionarImagen}
            className="hidden"
          />
        </label>

        {/* CAMARA (móvil) */}
        <label className="block bg-purple-500 hover:bg-purple-400 text-center p-4 rounded-2xl cursor-pointer font-bold mb-5">
          📷 Abrir cámara
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={seleccionarImagen}
            className="hidden"
          />
        </label>

        {/* BOTONES */}
        <div className="flex gap-2 mb-4">

          <button
            onClick={analizar}
            disabled={loading}
            className={`w-full p-4 rounded-2xl font-bold text-lg ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400"
            }`}
          >
            {loading ? "⏳ Analizando..." : "🚀 Verificar pago"}
          </button>

          <button
            onClick={limpiar}
            className="bg-red-500 px-4 rounded-2xl font-bold"
          >
            🔄
          </button>

        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="mt-6 bg-black/30 rounded-2xl p-5 space-y-2">

            <h2 className="text-xl font-bold">
              {resultado.estado === "APROBADO"
                ? "✅ PAGO COINCIDE"
                : resultado.estado === "RECHAZADO"
                ? "❌ NO COINCIDE"
                : "⚠️ REVISAR"}
            </h2>

            <p>🏦 Banco: <b>{resultado.banco}</b></p>
            <p>💰 Monto OCR: <b>{resultado.montoOCR}</b></p>
            <p>🔳 Monto QR: <b>{resultado.montoQR}</b></p>
            <p>🔑 Ref OCR: <b>{resultado.referenciaOCR}</b></p>
            <p>🔑 Ref QR: <b>{resultado.referenciaQR}</b></p>

            <p className="text-green-300 font-bold">
              🎯 Confianza: {resultado.confianza}%
            </p>

          </div>
        )}

        {/* MENSAJE */}
        {mensaje && (
          <div className={`mt-5 p-4 rounded-2xl text-center font-bold ${
            tipo === "error"
              ? "bg-red-500/20 text-red-300"
              : tipo === "loading"
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-green-500/20 text-green-300"
          }`}>
            {mensaje}
          </div>
        )}

      </div>
    </div>
  );
}

export default Analizar;