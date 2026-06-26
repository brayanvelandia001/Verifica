import { useState } from "react";

function Analizar({ token, logout }) {

    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState(null);

    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);

    const seleccionarImagen = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImagen(file);
        setPreview(URL.createObjectURL(file));
        setResultado(null);
    };

    const analizar = async () => {
        if (!imagen) return;

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("imagen", imagen);

            const respuesta = await fetch("https://verifica-d9y5.onrender.com/api/analizar", {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token
                },
                body: formData
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) throw new Error(datos.error);

            setResultado(datos);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const limpiar = () => {
        setImagen(null);
        setPreview(null);
        setResultado(null);
    };

    // ======================
    // SAFE DATA (IMPORTANTE)
    // ======================
    const data = resultado || {};
    const ocr = data.ocr || {};
    const qr = data.qr || {};
    const tipo = data.tipo || "desconocido";

    // ======================
    // CARD COMPONENT
    // ======================
    const Card = ({ label, value }) => (
        <div className="bg-slate-800 rounded-2xl p-4">
            <p className="text-slate-400">{label}</p>
            <h3 className="text-lg font-bold mt-2">
                {value ?? "No detectado"}
            </h3>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">

            {/* HEADER */}
            <header className="border-b border-slate-700 bg-slate-900/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto flex justify-between px-8 py-5">
                    <div>
                        <h1 className="text-3xl font-bold">🤖 Verifica AI</h1>
                        <p className="text-slate-400">Validación inteligente de documentos</p>
                    </div>

                    <button
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl font-bold"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            {/* MAIN */}
            <main className="max-w-7xl mx-auto p-8 grid lg:grid-cols-2 gap-8">

                {/* IZQUIERDA */}
                <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">

                    <h2 className="text-2xl font-bold mb-6">📄 Documento</h2>

                    <div className="h-[420px] flex items-center justify-center border-2 border-dashed border-slate-600 rounded-2xl overflow-hidden bg-slate-950">

                        {preview ? (
                            <img src={preview} className="object-contain w-full h-full" />
                        ) : (
                            <p className="text-slate-400">Sube un documento</p>
                        )}

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">

                        <label className="bg-cyan-600 hover:bg-cyan-500 p-4 rounded-2xl text-center font-bold cursor-pointer">
                            📁 Archivo
                            <input type="file" hidden onChange={seleccionarImagen} />
                        </label>

                        <label className="bg-violet-600 hover:bg-violet-500 p-4 rounded-2xl text-center font-bold cursor-pointer">
                            📷 Cámara
                            <input type="file" capture="environment" hidden onChange={seleccionarImagen} />
                        </label>

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5">

                        <button
                            onClick={analizar}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 p-4 rounded-2xl font-bold"
                        >
                            {loading ? "Analizando..." : "🚀 Analizar"}
                        </button>

                        <button
                            onClick={limpiar}
                            className="bg-red-600 hover:bg-red-500 p-4 rounded-2xl font-bold"
                        >
                            Limpiar
                        </button>

                    </div>

                </div>

                {/* DERECHA */}
                <div className="space-y-6">

                    {/* TIPO DOCUMENTO */}
                    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">📄 Tipo de documento</h2>

                        <div className="text-center p-4 bg-slate-800 rounded-2xl font-bold">
                            {tipo === "comprobante" && "💳 Comprobante"}
                            {tipo === "cedula" && "🪪 Cédula"}
                            {tipo === "rut" && "📑 RUT"}
                            {tipo === "desconocido" && "❓ Desconocido"}
                        </div>
                    </div>

                    {/* RESULTADO */}
                    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">

                        <h2 className="text-xl font-bold mb-4">🤖 Resultado IA</h2>

                        <div className={`p-5 rounded-2xl text-center font-bold text-xl
                            ${data.estado === "APROBADO" ? "bg-green-600"
                                : data.estado === "VALIDO" ? "bg-blue-600"
                                    : data.estado === "RECHAZADO" ? "bg-red-600"
                                        : "bg-yellow-500 text-black"
                            }`}
                        >
                            {data.estado || "Esperando..."}
                        </div>

                        <div className="mt-5">
                            <div className="flex justify-between mb-2">
                                <span>Confianza</span>
                                <span>{data.confianza || 0}%</span>
                            </div>

                            <div className="w-full bg-slate-700 h-4 rounded-full">
                                <div
                                    className="bg-emerald-500 h-4 rounded-full"
                                    style={{ width: `${data.confianza || 0}%` }}
                                />
                            </div>
                        </div>

                    </div>

                    {/* DATOS */}
                    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-4">📊 Datos</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <Card label="🏦 Banco" value={data.banco} />
                            <Card label="💰 Monto" value={ocr.monto} />
                            <Card label="🔑 Referencia" value={ocr.referencia} />
                            <Card label="📄 Estado" value={data.estado} />
                        </div>
                    </div>

                    {/* OCR */}
                    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">

                        <h2 className="text-xl font-bold mb-4">📄 OCR</h2>

                        <div className="bg-slate-950 p-4 rounded-2xl max-h-72 overflow-y-auto">
                            {data.texto ? (
                                data.texto.split("\n").map((l, i) => (
                                    <p key={i} className="text-green-400">
                                        {l}
                                    </p>
                                ))
                            ) : (
                                <p className="text-slate-500">Sin texto</p>
                            )}
                        </div>

                    </div>

                    {/* QR */}
                    <div className="bg-slate-900/60 border border-slate-700 rounded-3xl p-6">

                        <h2 className="text-xl font-bold mb-4">📷 QR</h2>

                        <div className="bg-slate-800 p-4 rounded-2xl">

                            {qr?.existe ? (
                                <div>
                                    <p className="text-green-400 font-bold">✔ Detectado</p>
                                    <p className="break-all">{qr.valor}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400">No detectado</p>
                            )}

                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}

export default Analizar;