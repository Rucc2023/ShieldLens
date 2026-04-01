import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  Globe, 
  Instagram, 
  Youtube, 
  Facebook, 
} from 'lucide-react';

const LoginScreen = () => {
  // 1. Estados para capturar los datos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // 2. Función para manejar el acceso
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí puedes agregar validaciones reales en el futuro
    if (email && password) {
      console.log("Acceso concedido para:", email);
      // Redirigir al dashboard
      navigate('/portal');
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center p-6 overflow-hidden bg-[#D5DBDB]">
      
      {/* --- FONDO CON IMAGEN Y OVERLAY --- */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/src/assets/images/fondo.png" 
          alt="Fondo Seguros" 
          className="object-cover w-full h-full opacity-60" 
        />
        <div className="absolute inset-0 bg-[#0B1E3D]/5 shadow-inner"></div>
      </div>

      {/* --- EFECTOS DE LUCES BLUR --- */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full filter blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-[80px] animate-pulse delay-1000"></div>

      {/* --- TARJETA DE CRISTAL (GLASSMORPHISM) --- */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/10 backdrop-blur-[25px] border border-white/20 rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden min-h-137.5">

        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 bg-white/5 flex flex-col justify-center">
          
          {/* HEADER CON LOGO CIRCULAR */}
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-white p-3 rounded-full shadow-lg border border-white/50 w-24 h-24 flex items-center justify-center overflow-hidden">
                <img 
                  src="/src/assets/images/Logo.png" 
                  alt="ShieldLens Logo" 
                  className="w-20 h-20 object-contain rounded-full"
                />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-[#0B1E3D] tracking-tight">Iniciar Sesión</h2>
              <p className="text-[#0B1E3D]/60 text-sm font-medium">Acceda a su portal ShieldLens</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* INPUT EMAIL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B1E3D]/70 ml-1 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40 group-focus-within:text-[#0B1E3D] transition-colors" size={16} />
                <input
                  required
                  type="email"
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1E3D]/20 focus:bg-white/60 transition-all text-sm shadow-sm"
                  placeholder="usuario@seguros.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* INPUT PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#0B1E3D]/70 uppercase tracking-wider">
                  Contraseña
                </label>
                <button type="button" className="text-[10px] font-bold text-[#0B1E3D]/50 hover:text-[#0B1E3D] uppercase transition-colors">
                  ¿Olvidó su clave?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40 group-focus-within:text-[#0B1E3D] transition-colors" size={16} />
                <input
                  required
                  type="password"
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1E3D]/20 focus:bg-white/60 transition-all text-sm shadow-sm"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button
              type="submit"
              className="w-full py-4 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 mt-4 text-sm shadow-[#0B1E3D]/30"
            >
              <ShieldCheck size={18} />
              <span>Ingresar al Sistema</span>
            </button>
          </form>

          {/* SOCIAL FOOTER */}
          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
            <div className="flex space-x-5 text-[#0B1E3D]/40 mb-4">
              <Facebook size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Youtube size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Instagram size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Globe size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
            </div>
            <p className="text-[9px] text-[#0B1E3D]/40 font-bold tracking-[0.15em] uppercase">
              © 2026 ShieldLens Security. Cloud KMS Protected.
            </p>
          </div>
        </div>

        {/* LADO DERECHO: PANEL DE INFORMACIÓN */}
        <div className="w-full md:w-[45%] p-10 bg-slate-900/10 flex flex-col justify-center items-center text-center border-l border-white/10 backdrop-blur-md">
          
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5 uppercase tracking-tight">
            Seguimiento de <br/> 
            <span className="font-extrabold text-[#0B1E3D] tracking-tight drop-shadow-sm">
              Siniestros
            </span>
          </h1>
          
          <p className="text-blue-50/70 text-base mb-10 max-w-70 font-medium leading-relaxed">
            Portal oficial para el seguimiento y gestión de casos de seguros en tiempo real.
          </p>
          
          {/* <button className="group px-8 py-3.5 bg-white/10 hover:bg-white text-white hover:text-[#0B1E3D] font-bold rounded-full border border-white/20 hover:border-white transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg text-sm">
            <span>Verificar mi reporte</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button> */}

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;