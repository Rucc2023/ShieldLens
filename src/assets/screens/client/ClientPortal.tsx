import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, ShieldCheck, Zap, FileText, LogOut, 
  Clock, ChevronRight, ChevronLeft, Loader2,
  HelpCircle, ChevronDown, 
} from 'lucide-react';

const PAGE_SIZE = 4;

/* ─── Status style ── */
const getStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDIENTE':  return { bg: 'bg-amber-50',  text: 'text-amber-600',   dot: 'bg-amber-400'   };
    case 'REVISADO':
    case 'APROBADO':   return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' };
    default:           return { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400'    };
  }
};

const FAQS = [
  {
    q: '¿Cuánto tiempo tarda en procesarse mi reclamación?',
    a: 'El análisis con IA toma menos de 5 minutos. Una vez validada la evidencia, el pago se autoriza en un plazo de 24 a 72 horas hábiles dependiendo del tipo de siniestro y la cobertura de tu póliza.',
  },
  {
    q: '¿Qué documentos necesito para abrir un reclamo?',
    a: 'Necesitas fotografías claras del daño, número de póliza vigente, fecha y lugar del incidente. En caso de colisión, también se recomienda el reporte policial.',
  },
  {
    q: '¿Cómo consulto el estado de mi reclamación?',
    a: 'Puedes consultar el estado en tiempo real desde la sección "Actividad Reciente" de este portal. También recibirás notificaciones por correo cada vez que haya una actualización.',
  },
];

const ClientPortal = () => {
  const navigate = useNavigate();
  const [claims, setClaims]   = useState<any[]>([]);
  const [perfil, setPerfil]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [page, setPage]       = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token || '' };
      try {
        const [resC, resP] = await Promise.all([
          fetch('http://localhost:5000/api/incidentes/mis-reclamaciones', { headers }),
          fetch('http://localhost:5000/api/incidentes/perfil-cliente',    { headers }),
        ]);
        const [jsonC, jsonP] = await Promise.all([resC.json(), resP.json()]);
        if (jsonC.success) setClaims(jsonC.data);
        if (jsonP.success) setPerfil(jsonP.data);
      } catch { /* empty state */ }
      finally { setLoading(false); }
    };
    fetchData();

    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const initials = perfil?.nombre
    ? perfil.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RU';

  const totalPages = Math.ceil(claims.length / PAGE_SIZE);
  const paginated  = claims.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">
      <main className="max-w-7xl mx-auto flex flex-col min-h-screen">

        {/* ── HEADER ── */}
        <header className="px-6 lg:px-10 pt-8 pb-6 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            {/* Contenedor del logo sin fondo */}
            <div className="w-30 h-30 flex items-center justify-center shrink-0">
              <img 
                src="/src/assets/images/Logo.png" 
                alt="ShieldLens Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">
                Portal de Gestión
              </p>
              <h1 className="text-2xl font-bold leading-tight tracking-tight">
                Bienvenido, <span className="font-light text-slate-400">
                  {perfil?.nombre?.split(' ')[0] || 'Ricardo'}
                </span>
              </h1>
            </div>
          </div>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-3 py-2.5 rounded-2xl hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#0B1E3D]">{perfil?.nombre || 'Ricardo Cruz'}</p>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">
                  Póliza: {perfil?.id_poliza?.substring(0, 8) || '8191...0993'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold">{initials}</div>
              <ChevronDown size={13} className={`text-slate-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Cuenta de asegurado</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={13} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ── GRID ── */}
        <div className="px-6 lg:px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          {/* LEFT — col-span-8 → 9 for more breathing room */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* HERO */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-3xl p-9 text-white">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="absolute -right-4  -top-4  w-44 h-44 rounded-full border border-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="max-w-lg">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[9px] font-bold uppercase tracking-widest mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Módulo IA ShieldLens Activo
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-3">Reporta Siniestro</h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-8">
                    Nuestro Sistema analiza tus evidencias para acelerar el dictamen de tu reclamación. Haz clic en "Nueva Reclamación" para iniciar el proceso y recibir una respuesta rápida y transparente.
                  </p>
                  <button
                    onClick={() => navigate('/portal/nuevo-reclamo')}
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    <Plus size={16} /> Nueva Reclamación
                  </button>
                </div>
                <ShieldCheck size={100} className="text-white/5 shrink-0 mr-4 hidden sm:block" />
              </div>
            </div>

            {/* CLAIMS — paginated 4 per page */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 text-[#0B1E3D]">
                  <Clock size={15} className="text-blue-500" />
                  Actividad Reciente
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {loading ? '...' : `${claims.length} registros`}
                </span>
              </div>

              {/* Rows — fixed min-height to prevent layout jump */}
              <div className="flex flex-col gap-2.5 min-h-68">
                {loading ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-blue-400" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-300">Consultando ShieldBD...</p>
                  </div>
                ) : claims.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <FileText size={20} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Sin reclamaciones activas</p>
                  </div>
                ) : (
                  paginated.map((claim) => {
                    const style = getStatusStyle(claim.estado_reclamacion);
                    return (
                      <div
                        key={claim.id_reclamacion}
                        onClick={() => navigate(`/portal/estatus-reclamos/${claim.id_reclamacion}`)}
                        className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-[#0B1E3D]/50" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[#0B1E3D]">{claim.tipo_siniestro}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                ID: {claim.id_reclamacion.substring(0, 8)}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`hidden md:block text-[9px] font-bold uppercase tracking-widest
                            ${claim.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'}`}>
                            IA: {claim.veredicto_ia || 'VALIDANDO'}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {claim.estado_reclamacion}
                          </span>
                          <ChevronRight size={15} className="text-slate-300 group-hover:text-[#0B1E3D] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Página {page + 1} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft size={14} className="text-slate-600" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={`rounded-full transition-all duration-200 ${
                            i === page ? 'w-5 h-2 bg-[#0B1E3D]' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    >
                      <ChevronRight size={14} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT — col-span-3 ── */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* PÓLIZA */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                <Zap size={12} className="text-blue-500" /> Póliza Vigente
              </h3>
              <div className="bg-[#0B1E3D] rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">N° Póliza</span>
                    <span className="text-xs font-bold text-white font-mono bg-white/5 px-2 py-1 rounded-lg w-fit tracking-widest">
                      {perfil?.id_poliza?.substring(0, 12).toUpperCase() || '8191...0993'}
                    </span>
                  </div>
                  <div className="h-px bg-white/10" />
                  {[
                    { label: 'Plan',      value: perfil?.plan || 'Plus Gold' },
                    { label: 'Vigencia',  value: '31 Dic 2026'              },
                    { label: 'Cobertura', value: perfil?.monto_cobertura ? `$${perfil.monto_cobertura.toLocaleString()}` : '$50,000' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[10px] text-white/40 font-medium">{r.label}</span>
                      <span className="text-[11px] font-semibold text-white/80">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                <HelpCircle size={12} className="text-blue-500" /> Preguntas Frecuentes
              </h3>

              <div className="flex flex-col gap-2">
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className={`rounded-2xl border overflow-hidden transition-all duration-200
                      ${isOpen ? 'border-[#0B1E3D]/15' : 'border-slate-100'}`}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors
                          ${isOpen ? 'bg-[#0B1E3D] text-white' : 'bg-slate-50 hover:bg-slate-100 text-[#0B1E3D]'}`}
                      >
                        <span className="text-[11px] font-semibold leading-snug">{faq.q}</span>
                        <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white/50' : 'text-slate-400'}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 py-3 bg-white border-t border-slate-100">
                          <p className="text-[11px] text-slate-500 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;