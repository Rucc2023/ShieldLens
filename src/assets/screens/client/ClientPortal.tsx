import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ShieldCheck, Zap, FileText, LogOut, 
  Clock, ChevronRight, Layout,
  Bell, Settings, Loader2, HelpCircle, ChevronDown
} from 'lucide-react';

/* ─── Types ── */
interface Claim {
  id_reclamacion: string;
  tipo_siniestro: string;
  fecha_reclamacion: string;
  estado_reclamacion: string;
  id_poliza: string;
  veredicto_ia: string;
}

/* ─── Status style ── */
const getStatusStyle = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDIENTE':  return { bg: 'bg-amber-50',  text: 'text-amber-600',   dot: 'bg-amber-400'   };
    case 'FINALIZADO': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' };
    default:           return { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400'    };
  }
};

/* ─── FAQ data ── */
const FAQS = [
  {
    q: '¿Cuánto tiempo tarda en procesarse mi reclamación?',
    a: 'El proceso de análisis con IA toma menos de 5 minutos. Una vez validada la evidencia, el pago se autoriza en un plazo de 24 a 72 horas hábiles dependiendo del tipo de siniestro y la cobertura de tu póliza.',
  },
  {
    q: '¿Qué documentos necesito para abrir un reclamo?',
    a: 'Para iniciar un reclamo necesitas: fotografías claras del daño, número de póliza vigente, fecha y lugar del incidente, y una breve descripción de lo ocurrido. En caso de colisión, también se recomienda adjuntar el reporte policial.',
  },
  {
    q: '¿Cómo puedo conocer el estado actual de mi reclamación?',
    a: 'Puedes consultar el estado en tiempo real desde la sección "Historial de Actividad" de este portal. También recibirás notificaciones por correo electrónico cada vez que haya una actualización en tu caso.',
  },
];

/* ─── FAQ accordion ── */
const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-7">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-5">
        <HelpCircle size={15} className="text-blue-500" />
        Preguntas Frecuentes
      </h3>
      <div className="flex flex-col gap-2">
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div key={i}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden
                ${isOpen ? 'border-[#0B1E3D]/20 bg-slate-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
              >
                <span className="text-xs font-semibold text-[#0B1E3D] leading-snug">{faq.q}</span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0B1E3D]' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-slate-200 mb-3" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main ── */
const ClientPortal = () => {
  const navigate = useNavigate();
  const [claims, setClaims]   = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/incidentes/mis-reclamaciones', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        });
        const json = await res.json();
        if (json.success) setClaims(json.data);
      } catch {
        // empty state handles no data
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">

      {/* ── SIDEBAR ── */}
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
        <button onClick={() => navigate('/')} className="mt-auto w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors">
          <LogOut size={16} className="text-red-400/50 hover:text-red-400 transition-colors" />
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="px-10 pt-9 pb-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Portal de Gestión</p>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
              Bienvenido, <span className="font-light text-slate-400">Ricardo</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl">
            <div className="text-right">
              <p className="text-sm font-semibold">Ricardo Cruz</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Póliza: 8191...0993</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold">RU</div>
          </div>
        </header>

        <div className="px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          {/* ── LEFT ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* HERO */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-3xl p-9 text-white">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="absolute -right-4  -top-4  w-44 h-44 rounded-full border border-white/5" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="max-w-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Procesamiento IA Activo
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-3">Reporta un nuevo siniestro</h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-7">
                    ShieldLens analiza tus evidencias en tiempo real para acelerar tu pago.
                  </p>
                  <button onClick={() => navigate('/portal/nuevo-reclamo')}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all">
                    <Plus size={16} /> Nueva Reclamación
                  </button>
                </div>
                <ShieldCheck size={96} className="text-white/5 shrink-0 mr-2" />
              </div>
            </div>

            {/* CLAIMS */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Clock size={15} className="text-blue-500" />
                  Reclamaciones
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {loading ? '...' : `${claims.length} registros`}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="flex flex-col items-center py-10 gap-3 text-slate-400">
                    <Loader2 size={22} className="animate-spin" />
                    <p className="text-xs font-medium">Sincronizando con ShieldLens...</p>
                  </div>
                ) : claims.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <FileText size={28} className="text-slate-200" />
                    <p className="text-xs text-slate-400 font-medium">No hay reclamaciones registradas.</p>
                  </div>
                ) : (
                  claims.map((claim) => {
                    const style = getStatusStyle(claim.estado_reclamacion);
                    return (
                        <div
                          key={claim.id_reclamacion}
                          onClick={() => navigate(`/portal/estatus-reclamos/${claim.id_reclamacion}`)} // Enviamos el ID real
                          className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50 hover:bg-white transition-all cursor-pointer group"
                        >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[#0B1E3D]/60" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#0B1E3D]">{claim.tipo_siniestro}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                Póliza: {claim.id_poliza.substring(0, 8)}...
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest
                            ${claim.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {claim.veredicto_ia}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {claim.estado_reclamacion}
                          </span>
                          <ChevronRight size={15} className="text-slate-300 group-hover:text-[#0B1E3D] transition-colors" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* FAQ */}
            <FAQ />

            {/* MI PÓLIZA */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 space-y-4">
              <h3 className="text-sm font-bold">Mi Póliza Actual</h3>
              <div className="bg-[#0B1E3D] rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">N° Póliza</span>
                  <span className="text-xs font-bold text-white font-mono">8191...0993</span>
                </div>
                <div className="h-px bg-white/10" />
                {[
                  { label: 'Plan',      value: 'Plus'    },
                  { label: 'Vigencia',  value: 'Dic 2026'},
                  { label: 'Cobertura', value: 'Amplia'  },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-white/40">{r.label}</span>
                    <span className="text-[11px] font-semibold text-white/80">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Zap size={18} className="text-blue-500" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2">ShieldLens Forensic</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Datos encriptados y validados mediante algoritmos de visión computacional.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;