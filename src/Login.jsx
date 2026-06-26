  import { useState } from "react";
  import { FiUser } from "react-icons/fi";
  import {
    FiMail,
    FiLock,
    FiLogIn,
    FiLoader,
    FiEye,
    FiEyeOff,
  } from "react-icons/fi";

  import fondoImg from "./assets/fondo.png";
  import logoImg from "./assets/logosin.png";

  function Login({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [tipo, setTipo] = useState("idle");

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const login = async () => {
      if (!email || !password) {
        setTipo("error");
        setMensaje("Por favor, completa todos los campos.");
        return;
      }

      try {
        setLoading(true);
        setTipo("loading");
        setMensaje("Verificando credenciales...");

        const res = await fetch("http://localhost:4000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setTipo("error");
          setMensaje(data.error || "Credenciales incorrectas");
          return;
        }

        localStorage.setItem("token", data.token);
        setToken(data.token);

        setTipo("success");
        setMensaje("Acceso autorizado.");
      } catch (err) {
        setTipo("error");
        setMensaje("Servidor no disponible.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030509] text-white relative overflow-hidden font-sans">
        
        {/* ====================== */}
        {/* FONDO Y MARCA DE AGUA */}
        {/* ====================== */}
        <div className="absolute inset-0 pointer-events-none z-0">
          
          {/* Fondo de color base */}
          <div className="absolute inset-0 bg-[#030509]" />

        {/* IMAGEN COMO MARCA DE AGUA */}
        <div 
            className="absolute inset-0 opacity-30 bg-center bg-cover bg-no-repeat"
            style={{ backgroundImage: `url(${fondoImg})` }} 
          />

          {/* Gradiente superpuesto para oscurecer los bordes y fusionar la imagen */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#030509] via-transparent to-[#030509]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030509] via-transparent to-[#030509]" />

          {/* Glow Superior Cyan */}
          <div className="absolute w-[800px] h-[800px] rounded-full bg-cyan-600/10 blur-[150px] -top-[300px] left-1/2 -translate-x-1/2" />
          
          {/* Glow Inferior Púrpura */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] -bottom-[200px] -left-[100px]" />
          
        </div>

        {/* ====================== */}
        {/* TARJETA GLASSMORPHISM */}
        {/* ====================== */}
        <div className="relative w-full max-w-[460px] px-6 z-10">
          
          <div className="relative mt-20 rounded-[32px] bg-[#0A0F1D]/60 border border-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] px-8 sm:px-10 py-12">
            
          {/* LOGO GLOW CON IMAGEN */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex justify-center items-center">
              <div className="relative w-24 h-24 rounded-3xl bg-[#030509] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                {/* Brillo de fondo */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-3xl pointer-events-none" />
                
                {/* TU IMAGEN AQUÍ */}
                <img
                  src={logoImg}
                  alt="Logo Velandia Soft"
                  className="relative z-10 w-16 h-16 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                />
              </div>
            </div>

            {/* TÍTULOS */}
            <div className="text-center mt-6">
              <h2 className="text-cyan-400 tracking-[0.25em] font-semibold text-[10px] uppercase">
                Velandia Soft
              </h2>
              <h1 className="text-4xl font-bold mt-2 text-white/90">
                VERIFICA
              </h1>
            </div>
            {/* ====================== */}
            {/* FORMULARIO */}
            {/* ====================== */}

            <div className="mt-10 space-y-6">

              {/* EMAIL */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-2 block">
                  USUARIO
                </label>

                {/* FONDO CORREGIDO A TRANSPARENTE (bg-black/20 y border-white/10) */}
                <div className="group flex items-center h-14 rounded-xl bg-black/20 border border-white/10 px-4 transition-all duration-300 hover:border-white/20 hover:bg-white/5 focus-within:bg-white/5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20">
                  <FiUser className="text-white/40 text-lg transition group-focus-within:text-cyan-400" />

                  <input
                    type="email"
                    placeholder="admin@prueba.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && login()}
                    className="ml-3 flex-1 bg-transparent text-white outline-none placeholder:text-white/30 appearance-none"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-2 block">
                  Contraseña
                </label>

                {/* FONDO CORREGIDO A TRANSPARENTE (bg-black/20 y border-white/10) */}
                <div className="group flex items-center h-14 rounded-xl bg-black/20 border border-white/10 px-4 transition-all duration-300 hover:border-white/20 hover:bg-white/5 focus-within:bg-white/5 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20">
                  <FiLock className="text-white/40 text-lg transition group-focus-within:text-cyan-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && login()}
                    className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/30 tracking-widest"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/40 hover:text-cyan-400 transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

            </div>

            {/* MENSAJES DE ESTADO */}
            {mensaje && (
              <div
                className={`mt-6 rounded-lg border p-3 text-xs flex items-center justify-center gap-2 transition-all duration-500 backdrop-blur-md ${
                  tipo === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : tipo === "loading"
                    ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {tipo === "loading" && <FiLoader className="animate-spin text-sm" />}
                <span className="font-semibold tracking-wide">{mensaje}</span>
              </div>
            )}

            {/* BOTÓN DE LOGIN (Efecto Glow) */}
            <button
              onClick={login}
              disabled={loading}
             className={`mt-8 w-full h-14 rounded-xl font-bold text-[15px] tracking-wide flex justify-center items-center gap-2 transition-all duration-300 relative overflow-hidden group ${
                          loading
                            ? "bg-[#111827] text-gray-500 cursor-not-allowed border border-white/5"
                            : "cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-[1.02]"
                        }`}
            >
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              )}

              {loading ? (
                <>Iniciando...</>
              ) : (
                <>
                  <FiLogIn className="text-lg" />
                  Ingresar al Sistema
                </>
              )}
            </button>

            {/* FOOTER */}
            <div className="text-center mt-8">
              <p className="text-[10px] font-semibold text-gray-600 tracking-[0.2em] uppercase">
                © {new Date().getFullYear()} Velandia Soft
              </p>
            </div>

          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}} />
      </div>
    );
  }

  export default Login;