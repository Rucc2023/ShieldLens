import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, ShieldCheck, Globe, Instagram, Youtube, Facebook,
  X, User, Phone, ArrowRight, CheckCircle2,
} from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regDone, setRegDone]   = useState(false);
  const [reg, setReg]           = useState({ nombre: '', direccion: '', telefono: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      navigate('/portal');
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (reg.nombre && reg.direccion && reg.telefono) setRegDone(true);
  };

  const closeModal = () => { setShowRegister(false); setRegDone(false); setReg({ nombre: '', direccion: '', telefono: '' }); };

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center p-6 overflow-hidden bg-[#D5DBDB]">
      
      {/* FONDO */}
      <div className="absolute inset-0 z-0">
        <img src="/src/assets/images/fondo.png" alt="Fondo Seguros" className="object-cover w-full h-full opacity-60" />
        <div className="absolute inset-0 bg-[#0B1E3D]/5 shadow-inner" />
      </div>

      {/* LUCES */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full filter blur-[80px] animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full filter blur-[80px] animate-pulse delay-1000" />

      {/* TARJETA */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/10 backdrop-blur-[25px] border border-white/20 rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden min-h-[550px]">

        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 bg-white/5 flex flex-col justify-center">
          
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-white p-3 rounded-full shadow-lg border border-white/50 w-24 h-24 flex items-center justify-center overflow-hidden">
              <img src="/src/assets/images/Logo.png" alt="ShieldLens Logo" className="w-20 h-20 object-contain rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-[#0B1E3D] tracking-tight">Iniciar Sesión</h2>
              <p className="text-[#0B1E3D]/60 text-sm font-medium">Acceda a su portal ShieldLens</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B1E3D]/70 ml-1 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40 group-focus-within:text-[#0B1E3D] transition-colors" size={16} />
                <input required type="email"
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1E3D]/20 focus:bg-white/60 transition-all text-sm shadow-sm"
                  placeholder="usuario@seguros.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-[#0B1E3D]/70 uppercase tracking-wider">Contraseña</label>
                <button type="button" className="text-[10px] font-bold text-[#0B1E3D]/50 hover:text-[#0B1E3D] uppercase transition-colors">¿Olvidó su clave?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40 group-focus-within:text-[#0B1E3D] transition-colors" size={16} />
                <input required type="password"
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:ring-2 focus:ring-[#0B1E3D]/20 focus:bg-white/60 transition-all text-sm shadow-sm"
                  placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit"
              className="w-full py-4 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3 mt-4 text-sm">
              <ShieldCheck size={18} />
              Ingresar al Sistema
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
            <div className="flex space-x-5 text-[#0B1E3D]/40 mb-4">
              <Facebook size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Youtube  size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Instagram size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
              <Globe    size={18} className="hover:text-[#0B1E3D] cursor-pointer transition-colors" />
            </div>
            <p className="text-[9px] text-[#0B1E3D]/40 font-bold tracking-[0.15em] uppercase">© 2026 ShieldLens Security. Cloud KMS Protected.</p>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="w-full md:w-[45%] p-10 bg-slate-900/10 flex flex-col justify-center items-center text-center border-l border-white/10 backdrop-blur-md gap-8">
          
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5 uppercase tracking-tight">
              Seguimiento de <br/>
              <span className="font-extrabold text-[#0B1E3D] tracking-tight drop-shadow-sm">Siniestros</span>
            </h1>
            <p className="text-blue-50/70 text-base max-w-70 font-medium leading-relaxed">
              Portal oficial para el seguimiento y gestión de casos de seguros en tiempo real.
            </p>
          </div>

          {/* BOTÓN REGISTRO — único añadido */}
          <button
            onClick={() => setShowRegister(true)}
            className="group flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold rounded-full transition-all duration-300 text-sm backdrop-blur-sm"
          >
            <User size={16} className="text-white/70" />
            Crear cuenta nueva
            <ArrowRight size={14} className="text-white/50 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── REGISTRO MODAL ── */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal card */}
          <div className="relative z-10 w-full max-w-sm bg-white/15 backdrop-blur-[30px] border border-white/25 rounded-3xl shadow-2xl p-8 overflow-hidden">
            {/* decorative blob */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-400/10 rounded-full filter blur-2xl pointer-events-none" />

            {/* Close */}
            <button onClick={closeModal} className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X size={14} className="text-white/60" />
            </button>

            {!regDone ? (
              <>
                <div className="mb-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">ShieldLens</p>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">Registro</h3>
                  <p className="text-white/50 text-xs mt-1">Completa tus datos para comenzar.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Nombre completo</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" size={14} />
                      <input required type="text" placeholder="Luis Pasquett"
                        value={reg.nombre} onChange={(e) => setReg(r => ({ ...r, nombre: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/20 text-white border border-white/25 rounded-xl outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/30 transition-all text-sm placeholder:text-white/30" />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Dirección</label>
                    <div className="relative group">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" size={14} />
                      <input required type="text" placeholder="Av. Principal 123, Col. Centro"
                        value={reg.direccion} onChange={(e) => setReg(r => ({ ...r, direccion: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/20 text-white border border-white/25 rounded-xl outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/30 transition-all text-sm placeholder:text-white/30" />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Teléfono</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/60 transition-colors" size={14} />
                      <input required type="tel" placeholder="+52 961 000 0000"
                        value={reg.telefono} onChange={(e) => setReg(r => ({ ...r, telefono: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/20 text-white border border-white/25 rounded-xl outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/30 transition-all text-sm placeholder:text-white/30" />
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full mt-2 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm shadow-lg">
                    <ShieldCheck size={16} />
                    Crear cuenta
                  </button>
                </form>

                <p className="text-center text-[10px] text-white/30 mt-5">
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={closeModal} className="text-white/60 hover:text-white underline underline-offset-2 transition-colors font-semibold">
                    Inicia sesión
                  </button>
                </p>
              </>
            ) : (
              /* Success state */
              <div className="py-6 flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight mb-1">¡Cuenta creada!</h3>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Bienvenido, <span className="text-white/80 font-semibold">{reg.nombre}</span>.<br/>
                    Ya puedes iniciar sesión con tus credenciales.
                  </p>
                </div>
                <button onClick={closeModal}
                  className="px-8 py-3 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl transition-all text-sm">
                  Entendido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;