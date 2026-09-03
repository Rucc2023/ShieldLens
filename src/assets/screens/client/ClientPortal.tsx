import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../../components/PageBackground';
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
    default:           return { bg: 'bg-gold-50',    text: 'text-gold-700',    dot: 'bg-gold-400'    };
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
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowUserMenu(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const initials = perfil?.nombre
    ? perfil.nombre.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RU';

  const totalPages = Math.ceil(claims.length / PAGE_SIZE);
  const paginated  = claims.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <PageBackground>
    <div className="min-h-screen font-sans text-navy">
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
              aria-haspopup="menu" aria-expanded={showUserMenu}
              className="flex items-center gap-3 bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] pl-4 pr-3 py-2.5 rounded-2xl hover:border-slate-300 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-navy">{perfil?.nombre || 'Ricardo Cruz'}</p>
                <p className="text-[10px] text-gold-600 font-bold uppercase tracking-widest">
                  Póliza: {perfil?.id_poliza?.substring(0, 8) || '8191...0993'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center text-xs font-bold">{initials}</div>
              <ChevronDown size={13} className={`text-slate-300 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div role="menu" className="absolute right-0 mt-2 w-48 bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Cuenta de asegurado</p>
                </div>
                <button onClick={handleLogout} role="menuitem"
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-inset">
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
            <div className="relative overflow-hidden bg-navy/90 backdrop-blur-xl rounded-3xl p-9 text-white">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="absolute -right-4  -top-4  w-44 h-44 rounded-full border border-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="max-w-lg">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                    Módulo IA ShieldLens Activo
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-3">Reporta Siniestro</h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-8">
                    Nuestro Sistema analiza tus evidencias para acelerar el dictamen de tu reclamación. Haz clic en "Nueva Reclamación" para iniciar el proceso y recibir una respuesta rápida y transparente.
                  </p>
                  <button
                    onClick={() => navigate('/portal/nuevo-reclamo')}
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <Plus size={16} /> Nueva Reclamación
                  </button>
                </div>
                <ShieldCheck size={100} className="text-white/5 shrink-0 mr-4 hidden sm:block" />
              </div>
            </div>

            {/* CLAIMS — paginated 4 per page */}
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 text-navy">
                  <Clock size={15} className="text-gold-600" />
                  Actividad Reciente
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 bg-white/55 border border-white/50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {loading ? '...' : `${claims.length} registros`}
                </span>
              </div>

              {/* Rows — fixed min-height to prevent layout jump */}
              <div className="flex flex-col gap-2.5 min-h-68">
                {loading ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-gold-500" />
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
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/portal/estatus-reclamos/${claim.id_reclamacion}`); } }}
                        role="button" tabIndex={0}
                        className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-navy/50" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-navy">{claim.tipo_siniestro}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
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
                          <span className={`hidden md:block text-[10px] font-bold uppercase tracking-widest
                            ${claim.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'}`}>
                            IA: {claim.veredicto_ia || 'VALIDANDO'}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {claim.estado_reclamacion}
                          </span>
                          <ChevronRight size={15} className="text-slate-300 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
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
                      aria-label="Página anterior"
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
                    >
                      <ChevronLeft size={14} className="text-slate-600" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          aria-label={`Ir a la página ${i + 1}`}
                          aria-current={i === page}
                          className={`rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 ${
                            i === page ? 'w-5 h-2 bg-navy' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      aria-label="Página siguiente"
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
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
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                <Zap size={12} className="text-gold-600" /> Póliza Vigente
              </h3>
              <div className="bg-navy/90 backdrop-blur-xl rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">N° Póliza</span>
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
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
                <HelpCircle size={12} className="text-gold-600" /> Preguntas Frecuentes
              </h3>

              <div className="flex flex-col gap-2">
                {FAQS.map((faq, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className={`rounded-2xl border overflow-hidden transition-all duration-200
                      ${isOpen ? 'border-navy/15' : 'border-slate-100'}`}>
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${i}`}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-inset
                          ${isOpen ? 'bg-navy text-white' : 'bg-white/55 hover:bg-white/75 text-navy'}`}
                      >
                        <span className="text-[11px] font-semibold leading-snug">{faq.q}</span>
                        <ChevronDown size={12} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white/50' : 'text-slate-400'}`} />
                      </button>
                      {isOpen && (
                        <div id={`faq-panel-${i}`} className="px-4 py-3 bg-white border-t border-slate-100 animate-panel-in">
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
    </PageBackground>
  );
};

export default ClientPortal;