import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart as ReBarChart, Bar, XAxis, CartesianGrid, Tooltip as RechartsTooltip, Cell, ResponsiveContainer } from 'recharts';
import RadialGauge from '../../components/RadialGauge';
import PageBackground from '../../components/PageBackground';

const JAKARTA = "font-['Plus_Jakarta_Sans']";
const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

/* ─── Icon helper (Material Symbols Outlined, misma familia que ClientPortal.tsx / EstatusReclamos.tsx) ── */
const Icon = ({ name, className = '', size = 16 }: { name: string; className?: string; size?: number }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>{name}</span>
);

interface CaseRecord {
  id_reclamacion: string;
  nombre_cliente: string;
  tipo_siniestro: string;
  fecha_reclamacion: string;
  score_confianza_ia: number;
  veredicto_ia: string;
  estado_gestion: string;
}

type Tab = 'pendientes' | 'historial';

const PAGE_SIZE = 5;

const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
const confPct = (raw: number) => (raw <= 1 ? raw * 100 : raw);

/* ─── KPI card ── */
type Tone = 'navy' | 'amber' | 'emerald' | 'blue' | 'red';

const TONES: Record<Tone, { bg: string; icon: string }> = {
  navy:    { bg: 'bg-navy/[0.06]', icon: 'text-navy' },
  amber:   { bg: 'bg-amber-50',         icon: 'text-amber-500' },
  emerald: { bg: 'bg-emerald-50',       icon: 'text-emerald-500' },
  blue:    { bg: 'bg-blue-50',          icon: 'text-blue-500' },
  red:     { bg: 'bg-red-50',           icon: 'text-red-500' },
};

const KpiCard = ({ icon, label, value, tone, sub }: { icon: string; label: string; value: string | number; tone: Tone; sub?: string }) => {
  const t = TONES[tone];
  return (
    <div className="bg-white/85 border border-slate-100 shadow-card rounded-3xl p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-10 h-10 rounded-2xl ${t.bg} flex items-center justify-center`}>
        <Icon name={icon} size={19} className={t.icon} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`${JAKARTA} text-2xl font-extrabold text-navy tracking-tight tabular-nums`}>{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  );
};

/* ─── Bar chart (Reales vs Sospechosos) ── */
const CASOS_COLORS = { Reales: '#10b981', Sospechosos: '#ef4444' };

const CasosTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-navy-dark border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{name}</p>
      <p className="text-sm font-bold text-white tabular-nums">{value}</p>
    </div>
  );
};

const BarChartCasos = ({ reales, sospechosos }: { reales: number; sospechosos: number }) => {
  const total = reales + sospechosos;
  const data  = [
    { name: 'Reales',      value: reales },
    { name: 'Sospechosos', value: sospechosos },
  ];
  const pctR = pct(reales, total);
  const pctS = pct(sospechosos, total);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-28 w-full" role="img" aria-label={`${reales} casos reales (${pctR}%), ${sospechosos} casos sospechosos (${pctS}%)`}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data} margin={{ top: 16, right: 8, left: 8, bottom: 0 }} barCategoryGap="45%">
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} />
            <RechartsTooltip content={<CasosTooltip />} cursor={{ fill: 'rgba(15,23,42,0.03)' }} />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} maxBarSize={48} animationDuration={600} animationEasing="ease-out">
              {data.map((entry) => <Cell key={entry.name} fill={CASOS_COLORS[entry.name as keyof typeof CASOS_COLORS]} />)}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[10px] font-semibold text-emerald-800">Reales</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold text-emerald-950 tabular-nums">{reales}</span>
            <span className="text-[10px] text-emerald-700 font-medium">/ {pctR}%</span>
          </div>
        </div>
        <div className="p-2.5 rounded-2xl bg-red-50/70 border border-red-100/70">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-[10px] font-semibold text-red-800">Sospechosos</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold text-red-950 tabular-nums">{sospechosos}</span>
            <span className="text-[10px] text-red-700 font-medium">/ {pctS}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Estado de gestión: goal card ── */
const GoalCard = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const p = pct(value, total);
  return (
    <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium flex items-center gap-1.5" style={{ color }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          {label}
        </span>
        <span className="text-white/70 font-semibold whitespace-nowrap">{value} / {total} casos <b className="text-white ml-1">({p}%)</b></span>
      </div>
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

/* ─── Case row ── */
const CaseRow = ({ item, navigate, dim = false }: { item: CaseRecord; navigate: (p: string) => void; dim?: boolean }) => {
  const suspicious = item.veredicto_ia === 'SOSPECHOSO';
  const confidence = Math.round(confPct(item.score_confianza_ia || 0));
  return (
    <div
      onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/analyst/case-details/${item.id_reclamacion}`); } }}
      role="button" tabIndex={0}
      className={`flex items-center justify-between px-3 py-3.5 rounded-2xl border transition-all cursor-pointer group active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30
        ${dim ? 'bg-transparent border-transparent hover:bg-slate-50/80' : 'bg-transparent border-transparent hover:bg-slate-50/80'}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border
          ${suspicious ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
          <Icon name="person" size={20} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-navy text-sm truncate">{item.nombre_cliente}</h4>
            <span className="font-mono text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">{item.id_reclamacion.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-gold-600 tracking-wide uppercase">{item.tipo_siniestro}</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {new Date(item.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-600 font-medium tabular-nums">{confidence}% confianza</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
          ${suspicious ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${suspicious ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
          {item.veredicto_ia}
        </span>
        <div className="w-9 h-9 rounded-full bg-slate-100 hover:bg-navy text-slate-500 hover:text-white flex items-center justify-center transition-all group-hover:bg-navy group-hover:text-white">
          <Icon name="chevron_right" size={18} />
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ── */
const Pagination = ({ current, total, setPage }: { current: number; total: number; setPage: (fn: (p: number) => number) => void }) => (
  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
    <span className="font-medium text-navy">Pág. {current + 1} / {total}</span>
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button key={i} onClick={() => setPage(() => i)} aria-label={`Ir a la página ${i + 1}`} aria-current={i === current}
          className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 ${i === current ? 'w-5 h-2 bg-navy' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`} />
      ))}
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={current === 0} aria-label="Página anterior"
        className="px-3 py-1.5 rounded-xl border border-slate-200 text-navy font-semibold hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
        Anterior
      </button>
      <button onClick={() => setPage(p => Math.min(total - 1, p + 1))} disabled={current === total - 1} aria-label="Página siguiente"
        className="px-3 py-1.5 rounded-xl border border-slate-200 text-navy font-semibold hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
        Siguiente
      </button>
    </div>
  </div>
);

/* ─── Main ── */
const ForensicPanel = () => {
  const navigate = useNavigate();
  const menuRef  = useRef<HTMLDivElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);

  const [cases,          setCases]          = useState<CaseRecord[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [lastUpdated,    setLastUpdated]    = useState<Date | null>(null);
  const [page,           setPage]           = useState(0);
  const [pageHist,       setPageHist]       = useState(0);
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [activeTab,      setActiveTab]      = useState<Tab>('pendientes');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [onlySuspicious, setOnlySuspicious] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/api/incidentes/general', {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
      });
      const json = await res.json();
      if (json.success) {
        setCases(json.data);
        setLastUpdated(new Date());
      }
    } catch { /* empty state */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchCases();
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setPage(0); setPageHist(0); }, [searchTerm, onlySuspicious]);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const goToList = (tab: Tab, suspiciousOnly = false) => {
    setActiveTab(tab);
    setOnlySuspicious(suspiciousOnly);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const exportCSV = () => {
    const header = ['ID', 'Cliente', 'Tipo de siniestro', 'Fecha', 'Confianza IA (%)', 'Veredicto', 'Estado'];
    const rows = cases.map(c => [
      c.id_reclamacion, c.nombre_cliente, c.tipo_siniestro, c.fecha_reclamacion,
      Math.round(confPct(c.score_confianza_ia || 0)), c.veredicto_ia, c.estado_gestion,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casos_forense_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* derived */
  const casosPendientes  = cases.filter(c => c.estado_gestion !== 'Finalizado');
  const casosFinalizados = cases.filter(c => c.estado_gestion === 'Finalizado');
  const casosSospechosos = cases.filter(c => c.veredicto_ia === 'SOSPECHOSO').length;
  const casosReales      = cases.filter(c => c.veredicto_ia !== 'SOSPECHOSO').length;
  const resolutionRate   = pct(casosFinalizados.length, cases.length);
  const avgConfidence    = cases.length
    ? Math.round(cases.reduce((s, c) => s + confPct(c.score_confianza_ia || 0), 0) / cases.length)
    : 0;

  const q = searchTerm.trim().toLowerCase();
  const matches = (c: CaseRecord) =>
    (!q || c.nombre_cliente.toLowerCase().includes(q) || c.tipo_siniestro.toLowerCase().includes(q) || c.id_reclamacion.toLowerCase().includes(q)) &&
    (!onlySuspicious || c.veredicto_ia === 'SOSPECHOSO');

  const filteredPendientes  = casosPendientes.filter(matches);
  const filteredFinalizados = casosFinalizados.filter(matches);

  const activeList        = activeTab === 'pendientes' ? filteredPendientes : filteredFinalizados;
  const activeTotalPages   = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const activeCurrentPage  = activeTab === 'pendientes' ? page : pageHist;
  const activeSetPage      = activeTab === 'pendientes' ? setPage : setPageHist;
  const activePaginated    = activeList.slice(activeCurrentPage * PAGE_SIZE, activeCurrentPage * PAGE_SIZE + PAGE_SIZE);

  const tabClass = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-xs font-bold transition-all inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 ${active ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'}`;

  return (
    <PageBackground>
    <div className="min-h-screen w-full py-6 sm:py-8 md:py-10 px-3 sm:px-5 md:px-7 flex justify-center" style={{ fontFamily: FONT }}>
      <div className="w-full max-w-[1440px] bg-slate-50/95 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl border border-white/60 p-5 sm:p-7 lg:p-8 flex flex-col gap-6">

        {/* TOP NAV */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center shadow-md shadow-navy/10 shrink-0">
              <Icon name="verified_user" size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-navy tracking-tight">Forense</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Módulo Analista</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 sm:gap-3">
            <button onClick={fetchCases} aria-label="Actualizar datos" title="Actualizar datos"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-600 hover:text-navy hover:bg-slate-50 transition active:rotate-180 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
              <Icon name="refresh" size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button aria-label={casosSospechosos > 0 ? `Notificaciones: ${casosSospechosos} casos sospechosos` : 'Notificaciones'}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-600 hover:text-navy hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
              <Icon name="notifications" size={18} />
              {!loading && casosSospechosos > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {casosSospechosos > 9 ? '9+' : casosSospechosos}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(v => !v)} aria-haspopup="menu" aria-expanded={menuOpen}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-white rounded-full border border-slate-200/80 shadow-xs hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-navy to-indigo-800 text-white text-xs font-bold flex items-center justify-center">AS</div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-navy leading-none">Analista Senior</p>
                  <p className="text-[10px] text-emerald-600 font-medium leading-tight mt-0.5">Sesión Activa</p>
                </div>
                <Icon name="expand_more" size={17} className={`text-slate-400 ml-0.5 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              <div role="menu"
                className={`absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs origin-top-right transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity motion-reduce:scale-100
                  ${menuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="px-3 py-2 border-b border-slate-100 text-slate-500">
                  <p className="font-semibold text-slate-800">Mesa Forense</p>
                  <p className="text-[10px] text-slate-400">Cuenta del analista</p>
                </div>
                <button onClick={handleLogout} role="menuitem"
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-inset">
                  <Icon name="logout" size={15} /> Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className={`${JAKARTA} text-2xl sm:text-3xl font-bold text-navy tracking-tight`}>Bandeja de Casos</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Detección y seguimiento de casos con riesgo de fraude</p>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-white/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-xs self-start sm:self-center">
              <Icon name="schedule" size={15} />
              <span>Actualizado {lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* BENTO SUPERIOR: hero + bar chart + kpis */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* HERO */}
          <article className="lg:col-span-5 rounded-[28px] bg-navy text-white p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden min-h-[280px]">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-gold-400">
                    <Icon name="grid_view" size={17} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Total de casos</span>
                </div>
                {!loading && casosSospechosos > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold whitespace-nowrap">
                    {casosSospechosos} {casosSospechosos === 1 ? 'alerta crítica' : 'alertas críticas'}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-5 gap-3">
                <div>
                  <div className={`${JAKARTA} text-4xl sm:text-5xl font-extrabold tracking-tight text-white tabular-nums`}>
                    {loading ? '—' : cases.length}
                  </div>
                  <p className="text-xs text-red-300/90 font-medium mt-1 flex items-center gap-1.5">
                    {!loading && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />}
                    {loading ? 'Cargando información...' : (
                      <><span className="text-white font-bold">{casosSospechosos}</span>&nbsp;{casosSospechosos === 1 ? 'caso marcado' : 'casos marcados'} como sospechoso{casosSospechosos === 1 ? '' : 's'}</>
                    )}
                  </p>
                </div>
                <RadialGauge value={loading ? 0 : resolutionRate} size={80} label={`Tasa de resolución: ${resolutionRate}%`}>
                  <span className="text-xs font-extrabold text-white tabular-nums">{loading ? '—' : `${resolutionRate}%`}</span>
                  <span className="text-[8px] text-slate-400 font-medium uppercase block">Resolución</span>
                </RadialGauge>
              </div>
            </div>
            <div className="relative z-10 pt-5 mt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <button onClick={() => goToList('pendientes')}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                Ver pendientes
              </button>
              <button onClick={() => goToList('historial')}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                Ver historial
              </button>
              <button onClick={exportCSV}
                className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-300 text-slate-950 text-xs font-bold shadow-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" title="Exportar CSV">
                <Icon name="download" size={15} /> Exportar CSV
              </button>
            </div>
          </article>

          {/* BAR CHART */}
          <article className="lg:col-span-3 rounded-[28px] bg-white/85 border border-slate-100 shadow-bento p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reales vs Sospechosos</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Distribución del total de casos</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold whitespace-nowrap">
                  {loading ? '...' : `${cases.length} total`}
                </span>
              </div>
              <div className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center h-28">
                    <Icon name="progress_activity" size={22} className="animate-spin text-slate-300" />
                  </div>
                ) : (
                  <BarChartCasos reales={casosReales} sospechosos={casosSospechosos} />
                )}
              </div>
            </div>
          </article>

          {/* KPIS 2x2 */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3.5">
            <KpiCard icon="schedule" label="Pendientes" value={loading ? '—' : casosPendientes.length} tone="amber"
              sub={loading ? undefined : `${pct(casosPendientes.length, cases.length)}% del total`} />
            <KpiCard icon="check_circle" label="Finalizados" value={loading ? '—' : casosFinalizados.length} tone="emerald"
              sub={loading ? undefined : `${pct(casosFinalizados.length, cases.length)}% del total`} />
            <KpiCard icon="speed" label="Confianza IA" value={loading ? '—' : `${avgConfidence}%`} tone="blue"
              sub={loading ? undefined : `Basado en ${cases.length} casos`} />

            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-red-500 rounded-3xl p-4 flex flex-col justify-between text-white">
              <Icon name="warning" size={64} className="absolute -right-3 -bottom-3 text-white/10 pointer-events-none" />
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Riesgo de fraude</span>
                {!loading && casosSospechosos > 0 && <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />}
              </div>
              <div className="relative z-10 mt-2 flex items-end justify-between gap-2">
                <div>
                  <div className="text-2xl font-extrabold tabular-nums">{loading ? '—' : casosSospechosos}</div>
                  <span className="text-[10px] text-white/80">casos en alerta</span>
                </div>
                <button onClick={() => goToList('pendientes', true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                  Revisar <Icon name="arrow_outward" size={13} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ESTADO DE GESTIÓN */}
        <article className="rounded-[28px] bg-navy text-white p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 shrink-0">
                <Icon name="bar_chart" size={17} />
              </div>
              <div>
                <h2 className={`${JAKARTA} text-sm font-bold text-white tracking-tight`}>Estado de Gestión</h2>
                <p className="text-[11px] text-slate-400">Monitoreo de objetivos de resolución y alertas</p>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">Total: {loading ? '—' : cases.length} expedientes</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Icon name="progress_activity" size={22} className="animate-spin text-white/30" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <GoalCard label="Finalizados" value={casosFinalizados.length} total={cases.length} color="#34d399" />
              <GoalCard label="Pendientes"  value={casosPendientes.length}  total={cases.length} color="#fbbf24" />
              <GoalCard label="Sospechosos" value={casosSospechosos}         total={cases.length} color="#f87171" />
            </div>
          )}
        </article>

        {/* CASE LIST */}
        <article ref={listRef} className="rounded-[28px] bg-white/85 border border-slate-100 shadow-bento p-6 scroll-mt-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3 flex-wrap">
              <Icon name="monitor_heart" size={18} className="text-gold-600 hidden sm:block shrink-0" />
              <div className="flex bg-slate-100 p-1 rounded-full" role="tablist">
                <button role="tab" aria-selected={activeTab === 'pendientes'} onClick={() => setActiveTab('pendientes')} className={tabClass(activeTab === 'pendientes')}>
                  Pendientes <span className="opacity-50">({casosPendientes.length})</span>
                </button>
                <button role="tab" aria-selected={activeTab === 'historial'} onClick={() => setActiveTab('historial')} className={tabClass(activeTab === 'historial')}>
                  Historial <span className="opacity-50">({casosFinalizados.length})</span>
                </button>
              </div>
              <button onClick={() => setOnlySuspicious(v => !v)} aria-pressed={onlySuspicious}
                className={`pl-3 border-l border-slate-200 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 rounded-lg ${onlySuspicious ? 'text-red-600' : 'text-slate-600 hover:text-navy'}`}>
                <span className={`inline-block w-3.5 h-3.5 rounded-md border align-middle mr-1.5 transition-colors ${onlySuspicious ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300'}`} />
                Solo sospechosos
              </button>
            </div>

            <div className="relative w-full lg:max-w-xs">
              <Icon name="search" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente o tipo..."
                aria-label="Buscar por cliente o tipo de siniestro"
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-10 pr-4 py-2 rounded-full border border-slate-200/80 focus:ring-2 focus:ring-navy/30 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="flex flex-col divide-y divide-slate-100 min-h-[260px] mt-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                <Icon name="progress_activity" size={26} className="animate-spin text-gold-500" />
                <p className="text-[11px] text-slate-400 font-semibold">Cargando casos...</p>
              </div>
            ) : activeList.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                {searchTerm || onlySuspicious ? (
                  <>
                    <Icon name="search_off" size={30} className="text-slate-300" />
                    <p className="text-[11px] text-slate-400 font-semibold text-center">No se encontraron casos con esos filtros.</p>
                  </>
                ) : activeTab === 'pendientes' ? (
                  <>
                    <Icon name="check_circle" size={32} className="text-emerald-400" />
                    <p className="text-[11px] text-slate-400 font-semibold text-center">¡Sin casos pendientes!</p>
                  </>
                ) : (
                  <>
                    <Icon name="schedule" size={32} className="text-slate-300" />
                    <p className="text-[11px] text-slate-400 font-semibold text-center">El historial aparecerá aquí conforme finalices los casos.</p>
                  </>
                )}
              </div>
            ) : (
              activePaginated.map(item => (
                <CaseRow key={item.id_reclamacion} item={item} navigate={navigate} dim={activeTab === 'historial'} />
              ))
            )}
          </div>

          {!loading && activeList.length > 0 && activeTotalPages > 1 && (
            <Pagination current={activeCurrentPage} total={activeTotalPages} setPage={activeSetPage} />
          )}
        </article>

      </div>
    </div>
    </PageBackground>
  );
};

export default ForensicPanel;
