import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, ShieldCheck, 
  X, User, Phone, ArrowRight, CheckCircle2, MapPin
} from 'lucide-react';

const LoginScreen = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regDone, setRegDone]   = useState(false);
  
  // Estado de registro actualizado para coincidir con la BD
  const [reg, setReg] = useState({ 
    nombre: '', 
    direccion: '', 
    telefono: '', 
    email: '', 
    password: '' 
  });
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/portal');
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("No se pudo conectar con el servidor ShieldLens en el puerto 5000."); // Error detectado
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Mapeo de campos hacia el Backend para coincidir con la BD
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nombre: reg.nombre,      // Irá a nombre_cifrado
          email: reg.email,        // Irá a email_cifrado
          direccion: reg.direccion, // Irá a direccion_cifrado
          telefono: reg.telefono,
          password: reg.password,
          rol: 'Cliente' 
        }),
      });

      if (response.ok) {
        setRegDone(true);
      } else {
        const data = await response.json();
        alert(data.message || "Error al crear la cuenta");
      }
    } catch (err) {
      console.error("Error de registro:", err);
      alert("Error de conexión al registrar usuario.");
    }
  };

  const closeModal = () => { 
    setShowRegister(false); 
    setRegDone(false); 
    setReg({ nombre: '', direccion: '', telefono: '', email: '', password: '' }); 
  };

  return (
    <div className="relative min-h-screen w-full font-sans flex items-center justify-center p-6 overflow-hidden bg-[#D5DBDB]">
      
      {/* FONDO Y LUCES (Mantener igual) */}
      <div className="absolute inset-0 z-0">
        <img src="/src/assets/images/fondo.png" alt="Fondo" className="object-cover w-full h-full opacity-60" />
        <div className="absolute inset-0 bg-[#0B1E3D]/5 shadow-inner" />
      </div>

      {/* TARJETA PRINCIPAL (Mantener igual) */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/10 backdrop-blur-[25px] border border-white/20 rounded-[35px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden min-h-[550px]">

        {/* LADO IZQUIERDO: LOGIN */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 bg-white/5 flex flex-col justify-center">
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-white p-3 rounded-full shadow-lg border border-white/50 w-24 h-24 flex items-center justify-center overflow-hidden">
              <img src="/src/assets/images/Logo.png" alt="Logo" className="w-20 h-20 object-contain rounded-full" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-[#0B1E3D]">Iniciar Sesión</h2>
              <p className="text-[#0B1E3D]/60 text-sm font-medium">Portal ShieldLens Security</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B1E3D]/70 ml-1 uppercase">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40" size={16} />
                <input required type="email" placeholder="usuario@seguros.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:bg-white/60 transition-all text-sm shadow-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B1E3D]/70 ml-1 uppercase">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1E3D]/40" size={16} />
                <input required type="password" placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-5 py-3.5 bg-white/40 text-[#0B1E3D] border border-white/40 rounded-xl outline-none focus:bg-white/60 transition-all text-sm shadow-sm" />
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 mt-4 text-sm">
              <ShieldCheck size={18} /> Ingresar al Sistema
            </button>
          </form>

          {/* REDES SOCIALES (Mantener igual) */}
        </div>

        {/* LADO DERECHO (Mantener igual) */}
        <div className="w-full md:w-[45%] p-10 bg-slate-900/10 flex flex-col justify-center items-center text-center backdrop-blur-md gap-8">
           <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight uppercase">
             Seguimiento de <br/> <span className="text-[#0B1E3D]">Siniestros</span>
           </h1>
           <button onClick={() => setShowRegister(true)} className="flex items-center gap-2.5 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full transition-all text-sm">
             <User size={16} /> Crear cuenta nueva <ArrowRight size={14} />
           </button>
        </div>
      </div>

      {/* ── MODAL DE REGISTRO ACTUALIZADO ── */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-md bg-white/15 backdrop-blur-[30px] border border-white/25 rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <button onClick={closeModal} className="absolute top-5 right-5 text-white/60 hover:text-white"><X size={18}/></button>

            {!regDone ? (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold text-white">Registro de Cliente</h3>
                  <p className="text-white/50 text-xs">Protección de datos mediante cifrado AES-256</p>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                      <input required type="text" placeholder="Juan Pérez" value={reg.nombre} onChange={(e) => setReg({...reg, nombre: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white border border-white/25 rounded-xl outline-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                      <input required type="email" placeholder="cliente@correo.com" value={reg.email} onChange={(e) => setReg({...reg, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white border border-white/25 rounded-xl outline-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/50 uppercase">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                      <input required type="password" placeholder="••••••••" value={reg.password} onChange={(e) => setReg({...reg, password: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white border border-white/25 rounded-xl outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase">Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input required type="tel" placeholder="961123..." value={reg.telefono} onChange={(e) => setReg({...reg, telefono: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white border border-white/25 rounded-xl outline-none text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-white/50 uppercase">Dirección</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input required type="text" placeholder="Calle 123..." value={reg.direccion} onChange={(e) => setReg({...reg, direccion: e.target.value})}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/20 text-white border border-white/25 rounded-xl outline-none text-sm" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full mt-4 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm">
                    <ShieldCheck size={16} /> Crear Cuenta Protegida
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center text-center gap-5">
                <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-xl font-extrabold text-white">¡Registro Exitoso!</h3>
                <p className="text-white/50 text-xs">Tus datos han sido cifrados y almacenados en Azure SQL</p>
                <button onClick={closeModal} className="px-8 py-3 bg-[#0B1E3D] text-white font-bold rounded-xl text-sm transition-all hover:scale-105">
                  Iniciar Sesión
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