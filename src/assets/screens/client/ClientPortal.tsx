import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBackground from '../../components/PageBackground';
import {
  Plus, ShieldCheck, Zap, FileText, LogOut,
  ChevronRight, ChevronLeft, Loader2,
  HelpCircle, ChevronDown, Wallet, BrainCircuit,
  BarChart3, Headphones, Car, MoveHorizontal, Slash, Box, RotateCcw, List,
} from 'lucide-react';

const PAGE_SIZE = 4;
const JAKARTA = "font-['Plus_Jakarta_Sans']";

/* ─── Status style ── */
const getStatusStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDIENTE':  return { bg: 'bg-amber-50',  text: 'text-amber-600',   dot: 'bg-amber-400'   };
    case 'REVISADO':
    case 'APROBADO':   return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' };
    default:           return { bg: 'bg-gold-50',    text: 'text-gold-700',    dot: 'bg-gold-400'    };
  }
};

/* ─── Icono por tipo de siniestro (mismos ids que NuevoReclamo.tsx) ── */
const SINIESTRO_ICONS: Record<string, any> = {
  Colision_Frontal_Trasera: Car,
  Colision_Lateral: MoveHorizontal,
  Raspado_Roce: Slash,
  Choque_Objeto_Fijo: Box,
  Volcadura: RotateCcw,
  Colision_Cadena: List,
};
const getSiniestroIcon = (tipo: string) => SINIESTRO_ICONS[tipo] || FileText;
const formatSiniestro = (tipo: string) => tipo?.replace(/_/g, ' ') || 'Siniestro';

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

  /* derived: balance de reclamaciones */
  const montoGestionado = claims.reduce((s, c) => s + (c.monto_reclamado || 0), 0);
  const coberturaTotal  = perfil?.monto_cobertura || 50000;
  const remanente       = Math.max(0, coberturaTotal - montoGestionado);
  const pendientesCount = claims.filter(c => c.estado_reclamacion?.toUpperCase() === 'PENDIENTE').length;
  const aprobadosCount  = claims.filter(c => ['REVISADO', 'APROBADO'].includes(c.estado_reclamacion?.toUpperCase())).length;
  const enAnalisisCount = Math.max(0, claims.length - pendientesCount - aprobadosCount);
  const claimsTotal     = claims.length || 1;

  return (
    <PageBackground>
    <div className="min-h-screen font-sans text-navy" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── HEADER ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <img src="/src/assets/images/Logo.png" alt="ShieldLens Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/50 leading-none mb-1">Plataforma de Asegurado</p>
              <h2 className={`${JAKARTA} text-lg font-bold text-navy tracking-tight`}>Centro de Cobertura Inteligente</h2>
            </div>
          </div>

          {/* User dropdown */}
          <div className="relative self-start sm:self-auto" ref={menuRef}>
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
              <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold">{initials}</div>
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

        {/* ── GREETING ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className={`${JAKARTA} text-3xl sm:text-4xl font-bold text-navy tracking-tight`}>
              Bienvenido, {perfil?.nombre?.split(' ')[0] || 'Ricardo'}
            </h1>
            <p className="text-sm text-navy/60 font-medium mt-0.5">Portal de Gestión · Cuenta de asegurado</p>
          </div>
          
        </div>

        {/* ── TOP GRID: póliza + hero acción ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* PÓLIZA — tarjeta tangible estilo FinBank */}
          <div className="lg:col-span-5 bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center text-navy shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`${JAKARTA} text-sm font-bold text-navy`}>Póliza Vigente</span>
                    <span className="text-[11px] text-slate-500">{perfil?.tipo_poliza || 'Seguro de Auto'}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Activa
                </span>
              </div>

              {/* Tarjeta digital interior con gradiente navy */}
              <div className="relative w-full rounded-2xl p-5 bg-gradient-to-br from-navy via-navy to-navy-dark text-white shadow-[0_10px_30px_-12px_rgba(11,30,61,0.35)] overflow-hidden mb-4">
                <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-gold-400/10 blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Cobertura seleccionada</span>
                      <span className={`${JAKARTA} text-white font-bold text-base`}>Plan {perfil?.plan || 'Plus Gold'}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 text-[10px] tracking-widest uppercase font-mono">Insured</span>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-2 pt-3 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Póliza digital</span>
                    <span className="font-mono font-semibold text-[15px] text-white tracking-wide mt-0.5">
                      {perfil?.id_poliza?.substring(0, 12).toUpperCase() || 'POL-8191-0993'}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Vigencia</span>
                    <span className="text-sm text-white font-medium mt-0.5">31 Dic 2026</span>
                  </div>
                </div>
              </div>

              {/* Cobertura máxima */}
              <div className="p-3 rounded-xl bg-white/50 border border-white/50">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Wallet size={14} className="text-navy" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Cobertura máxima</span>
                </div>
                <span className={`${JAKARTA} text-lg text-navy font-bold tracking-tight`}>
                  ${coberturaTotal.toLocaleString('es-MX')} <span className="text-xs font-normal text-slate-400">MXN</span>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            </div>
          </div>

          {/* HERO ACCIÓN — Reporta Siniestro */}
          <div className="lg:col-span-7 relative overflow-hidden bg-navy/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute -right-4  -top-4  w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  Módulo IA ShieldLens Activo
                </span>
                <span className="text-[11px] text-white/40 font-medium">Evaluación instantánea</span>
              </div>
              <h2 className={`${JAKARTA} text-2xl font-bold leading-snug mb-3`}>¿Tuviste un incidente? Reporta tu siniestro aquí.</h2>
              <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xl">
                Nuestro Sistema analiza tus evidencias para acelerar el dictamen de tu reclamación. Haz clic en "Nueva Reclamación" para iniciar el proceso y recibir una respuesta rápida y transparente.
              </p>
            </div>
            <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-gold-300 shrink-0">
                  <BrainCircuit size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Visión Artificial &amp; OCR</span>
                  <span className="text-xs text-white/40">Carga fotos y facturas sin esperas</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/portal/nuevo-reclamo')}
                className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Plus size={16} /> Nueva Reclamación
              </button>
            </div>
          </div>
        </div>

        {/* ── MIDDLE: actividad reciente + balance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* ACTIVIDAD RECIENTE */}
          <div className="lg:col-span-8 bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className={`${JAKARTA} text-base font-bold text-navy`}>Actividad Reciente</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Historial de siniestros y solicitudes registradas</p>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-white/55 border border-white/50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {loading ? '...' : `${claims.length} registros`}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 min-h-68">
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
                    const Icon  = getSiniestroIcon(claim.tipo_siniestro);
                    return (
                      <div
                        key={claim.id_reclamacion}
                        onClick={() => navigate(`/portal/estatus-reclamos/${claim.id_reclamacion}`)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/portal/estatus-reclamos/${claim.id_reclamacion}`); } }}
                        role="button" tabIndex={0}
                        className="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-white/60 transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-navy/5 flex items-center justify-center text-navy shrink-0 group-hover:scale-105 transition-transform">
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-navy capitalize truncate group-hover:text-navy/80 transition-colors">{formatSiniestro(claim.tipo_siniestro)}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">
                                ID: {claim.id_reclamacion.substring(0, 8)}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
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

          {/* ── COLUMNA DERECHA: balance + soporte ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* BALANCE DE RECLAMACIONES */}
            <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-navy/10 flex items-center justify-center text-navy shrink-0">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h3 className={`${JAKARTA} text-sm font-bold text-navy`}>Balance de Reclamaciones</h3>
                    <p className="text-[11px] text-slate-500">Resumen analítico y siniestralidad</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2.5 rounded-2xl bg-white/50 border border-white/50 flex flex-col justify-center">
                  <div className="flex items-center gap-1 mb-0.5">
                    <FileText size={13} className="text-navy" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">Monto Gestionado</span>
                  </div>
                  <span className={`${JAKARTA} text-lg text-navy font-bold tracking-tight`}>${montoGestionado.toLocaleString('es-MX')} <span className="text-[10px] font-normal text-slate-400">MXN</span></span>
                  <span className="text-[9px] text-gold-600 mt-0.5 font-semibold">{claims.length} siniestro{claims.length === 1 ? '' : 's'} registrado{claims.length === 1 ? '' : 's'}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/50 border border-white/50 flex flex-col justify-center">
                  <div className="flex items-center gap-1 mb-0.5">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">Remanente Cobertura</span>
                  </div>
                  <span className={`${JAKARTA} text-lg text-navy font-semibold tracking-tight`}>${remanente.toLocaleString('es-MX')} <span className="text-[10px] font-normal text-slate-400">MXN</span></span>
                  <span className="text-[9px] text-slate-400 mt-0.5">De ${coberturaTotal.toLocaleString('es-MX')} pactados</span>
                </div>
              </div>

              {claims.length > 0 && (
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="uppercase tracking-widest">Distribución por estatus ({claims.length} casos)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(aprobadosCount / claimsTotal) * 100}%` }} title={`Aprobados/Revisados (${aprobadosCount})`} />
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(pendientesCount / claimsTotal) * 100}%` }} title={`Pendiente (${pendientesCount})`} />
                    <div className="h-full bg-gold-400 rounded-full" style={{ width: `${(enAnalisisCount / claimsTotal) * 100}%` }} title={`En análisis (${enAnalisisCount})`} />
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1 text-center">
                    <div className="p-1.5 rounded-xl bg-emerald-50 flex flex-col items-center">
                      <span className="font-bold text-sm text-emerald-600 leading-none">{aprobadosCount}</span>
                      <span className="text-[9px] text-emerald-600 font-medium mt-0.5">Aprobados</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-amber-50 flex flex-col items-center">
                      <span className="font-bold text-sm text-amber-600 leading-none">{pendientesCount}</span>
                      <span className="text-[9px] text-amber-600 font-medium mt-0.5">Pendiente</span>
                    </div>
                    <div className="p-1.5 rounded-xl bg-gold-50 flex flex-col items-center">
                      <span className="font-bold text-sm text-gold-700 leading-none">{enAnalisisCount}</span>
                      <span className="text-[9px] text-gold-700 font-medium mt-0.5">En análisis</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full bg-white/50 border border-white/50 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-gold-600" />
                  <span className="text-[11px] text-slate-500">Dictamen preliminar IA</span>
                </div>
                <span className="text-[11px] text-navy font-bold bg-white/85 px-2 py-0.5 rounded-lg">&lt; 5 minutos</span>
              </div>
            </div>

            {/* SOPORTE */}
            <div className="bg-navy/90 backdrop-blur-xl rounded-3xl p-5 flex items-center justify-between gap-3 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border border-white/5 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-gold-300 shrink-0">
                  <Headphones size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">¿Dudas con tu póliza?</span>
                  <span className="text-xs text-white/40">Tu asesor asignado está disponible hoy.</span>
                </div>
              </div>
              <ChevronRight size={18} className="relative z-10 text-white/30 shrink-0" />
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={18} className="text-gold-600" />
            <h3 className={`${JAKARTA} text-base font-bold text-navy`}>Preguntas Frecuentes</h3>
          </div>

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
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-inset
                      ${isOpen ? 'bg-navy text-white' : 'bg-white/55 hover:bg-white/75 text-navy'}`}
                  >
                    <span className="text-sm font-semibold leading-snug">{faq.q}</span>
                    <ChevronDown size={16} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white/50' : 'text-slate-400'}`} />
                  </button>
                  {isOpen && (
                    <div id={`faq-panel-${i}`} className="px-4 py-3.5 bg-white border-t border-slate-100 animate-panel-in">
                      <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
    </PageBackground>
  );
};

export default ClientPortal;
