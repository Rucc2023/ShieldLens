import { useNavigate } from 'react-router-dom';
import { 
  Plus, ShieldCheck, Zap, FileText, LogOut, 
  MessageCircle, Clock, ChevronRight, Layout,
  Bell, Settings, ArrowUpRight
} from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();

  const claims = [
    { id: 'CLM-2024-001', type: 'Colisión Vehicular', date: '19 Mar 2026', status: 'En Revisión', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' },
    { id: 'CLM-2024-002', type: 'Robo de Autopartes', date: '14 Mar 2026', status: 'Verificado IA', color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-400' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">

      {/* SIDEBAR */}
      <aside className="w-18 bg-[#0B1E3D] flex flex-col items-center py-7 gap-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
          <img src="/src/assets/images/Logo.png" className="w-7 h-7 object-contain rounded-full" alt="Logo" />
        </div>

        <nav className="flex flex-col gap-5 mt-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Layout size={16} className="text-white" />
          </div>
          {[FileText, Bell, Settings].map((Icon, i) => (
            <div key={i} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
              <Icon size={16} className="text-white/40 hover:text-white/80 transition-colors" />
            </div>
          ))}
        </nav>

        <button 
          onClick={() => navigate('/')}
          className="mt-auto w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} className="text-red-400/50 hover:text-red-400 transition-colors" />
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="px-10 pt-9 pb-6 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Portal de Gestión</p>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#0B1E3D]">
              Bienvenido, <span className="font-light text-slate-500">Luis</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#0B1E3D]">Luis Pasquett</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Póliza VIP-9902</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold tracking-wide">
              LS
            </div>
          </div>
        </header>

        {/* GRID */}
        <div className="px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          {/* LEFT */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* HERO CTA */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-3xl p-9 text-white">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="absolute -right-4 -top-4 w-44 h-44 rounded-full border border-white/5" />

              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-3">Iniciar proceso</p>
                  <h2 className="text-2xl font-bold leading-snug mb-3">¿Sucedió un imprevisto?</h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-7">
                    Abre una reclamación en menos de 2 minutos. Nuestro sistema de IA procesará tu reporte de inmediato.
                  </p>
                  <button
                    onClick={() => navigate('/portal/nuevo-reclamo')}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    <Plus size={16} />
                    Nueva Reclamación
                  </button>
                </div>
                <ShieldCheck size={96} className="text-white/5 shrink-0 mr-2" />
              </div>
            </div>

            {/* CLAIMS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#0B1E3D]">
                  <Clock size={15} className="text-blue-500" />
                  Mis Reclamaciones
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {claims.map((claim, i) => (
                  <div
                    key={i}
                    onClick={() => navigate('/portal/estatus-reclamos')}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-[#0B1E3D]/60" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0B1E3D]">{claim.type}</h4>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">{claim.id} · {claim.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${claim.bg} ${claim.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${claim.dot}`} />
                        {claim.status}
                      </span>
                      <ChevronRight size={15} className="text-slate-300 group-hover:text-[#0B1E3D] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* SOPORTE */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <h3 className="text-sm font-bold text-[#0B1E3D] mb-5">Soporte Rápido</h3>
              <div className="flex flex-col gap-2">
                {["Ubicación de Talleres", "Deducible de mi póliza", "Descargar Factura"].map((text, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-[#0B1E3D] hover:text-white text-[#0B1E3D] rounded-xl text-xs font-semibold transition-all border border-slate-100 hover:border-transparent group"
                  >
                    {text}
                    <ArrowUpRight size={13} className="text-slate-300 group-hover:text-white/60 transition-colors" />
                  </button>
                ))}
              </div>
              <button className="w-full mt-5 py-3.5 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-blue-100 hover:border-transparent">
                <MessageCircle size={14} />
                Iniciar Chat en Vivo
              </button>
            </div>

            {/* SECURITY */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Zap size={18} className="text-blue-500" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0B1E3D] mb-2">ShieldLens Seguridad</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Datos protegidos bajo estándar bancario Cloud KMS de 256 bits.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ClientPortal;