import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, ChevronDown, ChevronRight, ChevronLeft,
  Loader2, Activity, User, BarChart3, CheckCircle2,
  ShieldCheck, ShieldAlert, Clock, LayoutGrid, AlertTriangle,
  Search, RefreshCw, Bell, Download, Gauge, ArrowUpRight,
} from 'lucide-react';

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
const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
const confPct = (raw: number) => (raw <= 1 ? raw * 100 : raw);

/* ─── KPI card ── */
type Tone = 'navy' | 'amber' | 'emerald' | 'blue' | 'red';

const TONES: Record<Tone, { bg: string; icon: string }> = {
  navy:    { bg: 'bg-[#0B1E3D]/[0.06]', icon: 'text-[#0B1E3D]' },
  amber:   { bg: 'bg-amber-50',         icon: 'text-amber-500' },
  emerald: { bg: 'bg-emerald-50',       icon: 'text-emerald-500' },
  blue:    { bg: 'bg-blue-50',          icon: 'text-blue-500' },
  red:     { bg: 'bg-red-50',           icon: 'text-red-500' },
};

const KpiCard = ({ icon: Icon, label, value, tone, sub }: { icon: any; label: string; value: string | number; tone: Tone; sub?: string }) => {
  const t = TONES[tone];
  return (
    <div className="bg-white border border-slate-200/70 rounded-3xl p-5 flex flex-col gap-4 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-10 h-10 rounded-2xl ${t.bg} flex items-center justify-center`}>
        <Icon size={17} className={t.icon} strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-[#0B1E3D] tracking-tight tabular-nums">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>}
      </div>
    </div>
  );
};

/* ─── Ring chart (resolution rate) ── */
const RingChart = ({ value, size = 64, stroke = 6, color = '#FB923C' }: { value: number; size?: number; stroke?: number; color?: string }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 600ms ease' }} />
    </svg>
  );
};

/* ─── Bar chart SVG ── */
const BarChart = ({ reales, sospechosos }: { reales: number; sospechosos: number }) => {
  const total  = reales + sospechosos;
  const maxVal = Math.max(reales, sospechosos, 1);
  const W = 280; const H = 130;
  const barW = 52; const gap = 40;
  const baseY = H - 24; const maxH = H - 42;
  const rH = Math.round((reales      / maxVal) * maxH);
  const sH = Math.round((sospechosos / maxVal) * maxH);
  const rX = W / 2 - barW - gap / 2;
  const sX = W / 2 + gap / 2;
  const pctR = pct(reales, total);
  const pctS = pct(sospechosos, total);

  return (
    <div className="flex flex-col gap-5">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto overflow-visible w-full max-w-[280px]">
        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = baseY - Math.round(f * maxH);
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={0} y={y - 3} fill="#cbd5e1" fontSize="8" fontWeight={600} textAnchor="start">{Math.round(f * maxVal)}</text>
            </g>
          );
        })}
        <line x1={0} y1={baseY} x2={W} y2={baseY} stroke="#e2e8f0" strokeWidth={1} />
        <rect x={rX} y={baseY - rH} width={barW} height={Math.max(rH, 2)} rx={12} fill="#34d399" />
        {reales > 0 && <text x={rX + barW / 2} y={baseY - rH - 8} textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="800">{reales}</text>}
        <text x={rX + barW / 2} y={baseY + 16} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">Reales</text>
        <rect x={sX} y={baseY - sH} width={barW} height={Math.max(sH, 2)} rx={12} fill="#f87171" />
        {sospechosos > 0 && <text x={sX + barW / 2} y={baseY - sH - 8} textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="800">{sospechosos}</text>}
        <text x={sX + barW / 2} y={baseY + 16} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="700">Sospechosos</text>
      </svg>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Reales</p>
            <p className="text-lg font-extrabold text-emerald-700 leading-none tabular-nums">{reales} <span className="text-[10px] font-semibold text-emerald-500">{pctR}%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Sospechosos</p>
            <p className="text-lg font-extrabold text-red-600 leading-none tabular-nums">{sospechosos} <span className="text-[10px] font-semibold text-red-400">{pctS}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Estado breakdown (goal-style rows) ── */
const GoalRow = ({ icon: Icon, label, value, total, color, dotBg }: { icon: any; label: string; value: number; total: number; color: string; dotBg: string }) => {
  const p = pct(value, total);
  return (
    <div className="flex items-center gap-4">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: dotBg }}>
        <Icon size={15} color={color} strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-white/70">{label}</span>
          <span className="text-xs font-bold text-white tabular-nums">{p}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: color }} />
        </div>
        <p className="text-[10px] text-white/35 font-medium mt-1.5 tabular-nums">{value} / {total} casos</p>
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
      className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all cursor-pointer group
        ${dim ? 'bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <User size={16} className="text-[#0B1E3D]/40" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-[#0B1E3D] tracking-tight truncate">{item.nombre_cliente}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wide">{item.tipo_siniestro}</span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date(item.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] text-slate-400 font-medium tabular-nums">{confidence}% confianza</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border
            ${suspicious ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
            {item.veredicto_ia}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">{item.id_reclamacion.substring(0, 8)}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-[#0B1E3D] group-hover:border-[#0B1E3D] transition-all">
          <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
        </div>
      </div>
    </div>
  );
};

/* ─── Pagination ── */
const Pagination = ({ current, total, setPage }: { current: number; total: number; setPage: (fn: (p: number) => number) => void }) => (
  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pág. {current + 1} / {total}</span>
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={current === 0}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center transition-colors">
        <ChevronLeft size={14} className="text-slate-600" />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setPage(() => i)}
            className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-orange-500' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`} />
        ))}
      </div>
      <button onClick={() => setPage(p => Math.min(total - 1, p + 1))} disabled={current === total - 1}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center transition-colors">
        <ChevronRight size={14} className="text-slate-600" />
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

  // Load the display typeface once (see index.html note for a faster alternative).
  useEffect(() => {
    if (!document.getElementById('font-inter')) {
      const link = document.createElement('link');
      link.id = 'font-inter';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

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
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
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
    `px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${active ? 'bg-white text-[#0B1E3D] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`;

  return (
    <div className="flex min-h-screen bg-[#F6F6F8] text-[#0B1E3D]" style={{ fontFamily: FONT }}>
      <main className="flex-1 flex flex-col min-h-screen">

        {/* TOP NAV */}
        <nav className="px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1E3D] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-white" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-tight leading-none">Forense</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mt-1">Módulo Analista</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Datos en vivo
            </span>

            <button
              onClick={fetchCases}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-500 text-slate-400 flex items-center justify-center transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-400 flex items-center justify-center transition-colors relative">
              <Bell size={15} />
              {!loading && casosSospechosos > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {casosSospechosos > 9 ? '9+' : casosSospechosos}
                </span>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-3 bg-white border border-slate-200 pl-3.5 pr-2.5 py-2 rounded-2xl hover:border-slate-300 transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#0B1E3D] leading-none">Analista Senior</p>
                  <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">Sesión Activa</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold">AS</div>
                <ChevronDown size={13} className={`text-slate-300 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cuenta del analista</p>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={13} /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* HEADER */}
        <div className="px-8 pt-8 pb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight">Bandeja Forense</h1>
            <p className="text-sm text-slate-400 font-medium mt-1.5">Detección y seguimiento de casos con riesgo de fraude</p>
          </div>
          {lastUpdated && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 pb-1">
              <Clock size={12} /> Actualizado {lastUpdated.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* DASHBOARD GRID */}
        <div className="px-8 pb-6 grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* LEFT */}
          <div className="xl:col-span-7 flex flex-col gap-5">

            {/* Hero */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-[28px] p-8 sm:p-9 text-white flex flex-col justify-between min-h-[300px]">
              <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/[0.06]" />
              <div className="absolute -right-6  -top-6  w-48 h-48 rounded-full border border-white/[0.06]" />

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                    <LayoutGrid size={18} className="text-orange-400" strokeWidth={2.25} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Total de casos</p>
                  <h2 className="text-5xl font-extrabold tracking-tight tabular-nums leading-none mb-3">
                    {loading ? '—' : cases.length}
                  </h2>
                  <p className="text-sm text-white/50 font-medium max-w-[240px] leading-relaxed">
                    {loading
                      ? 'Cargando información...'
                      : <>
                          <span className="text-white font-bold">{casosSospechosos}</span> {casosSospechosos === 1 ? 'caso marcado' : 'casos marcados'} como sospechoso{casosSospechosos === 1 ? '' : 's'}
                        </>}
                  </p>
                </div>

                <div className="relative w-16 h-16 shrink-0">
                  <RingChart value={loading ? 0 : resolutionRate} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-extrabold tabular-nums">{loading ? '—' : `${resolutionRate}%`}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-2.5 mt-8">
                <button onClick={() => goToList('pendientes')}
                  className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                  Ver pendientes <ArrowUpRight size={13} />
                </button>
                <button onClick={() => goToList('historial')}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                  Ver historial
                </button>
                <button onClick={exportCSV}
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors sm:ml-auto">
                  <Download size={13} /> Exportar CSV
                </button>
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white border border-slate-200 rounded-[28px] p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Reales vs Sospechosos</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Distribución del total de casos</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {loading ? '...' : `${cases.length} total`}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 size={18} className="animate-spin text-slate-300" />
                </div>
              ) : (
                <BarChart reales={casosReales} sospechosos={casosSospechosos} />
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-5 flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-5">
              <KpiCard icon={Clock} label="Pendientes" value={loading ? '—' : casosPendientes.length} tone="amber"
                sub={loading ? undefined : `${pct(casosPendientes.length, cases.length)}% del total`} />
              <KpiCard icon={CheckCircle2} label="Finalizados" value={loading ? '—' : casosFinalizados.length} tone="emerald"
                sub={loading ? undefined : `${pct(casosFinalizados.length, cases.length)}% del total`} />
              <KpiCard icon={Gauge} label="Confianza IA" value={loading ? '—' : `${avgConfidence}%`} tone="blue"
                sub={loading ? undefined : `Basado en ${cases.length} casos`} />

              <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-5 flex flex-col justify-between text-white">
                <AlertTriangle size={72} className="absolute -right-4 -bottom-4 text-white/10" strokeWidth={1.5} />
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">Riesgo de fraude</p>
                  <p className="text-2xl font-extrabold tabular-nums">{loading ? '—' : casosSospechosos}</p>
                </div>
                <button onClick={() => goToList('pendientes', true)}
                  className="relative z-10 mt-4 inline-flex items-center gap-1 self-start bg-white/15 hover:bg-white/25 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors">
                  Revisar <ArrowUpRight size={11} />
                </button>
              </div>
            </div>

            {/* Estado de gestión */}
            <div className="bg-[#0B1E3D] rounded-[28px] p-7 text-white flex-1 flex flex-col">
              <h3 className="text-sm font-bold mb-6 flex items-center gap-2 tracking-tight">
                <BarChart3 size={14} className="text-orange-400" /> Estado de Gestión
              </h3>
              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <Loader2 size={18} className="animate-spin text-white/30" />
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <GoalRow icon={CheckCircle2} label="Finalizados" value={casosFinalizados.length} total={cases.length} color="#34d399" dotBg="rgba(52,211,153,0.15)" />
                  <GoalRow icon={Clock}        label="Pendientes"  value={casosPendientes.length}  total={cases.length} color="#fbbf24" dotBg="rgba(251,191,36,0.15)" />
                  <GoalRow icon={ShieldAlert}  label="Sospechosos" value={casosSospechosos}         total={cases.length} color="#f87171" dotBg="rgba(248,113,113,0.15)" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CASE LIST */}
        <div ref={listRef} className="px-8 pb-10">
          <div className="bg-white border border-slate-200 rounded-[28px] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Activity size={15} className="text-orange-500 hidden sm:block" />
                <div className="inline-flex items-center bg-slate-100 rounded-2xl p-1">
                  <button onClick={() => setActiveTab('pendientes')} className={tabClass(activeTab === 'pendientes')}>
                    Pendientes <span className="opacity-50">({casosPendientes.length})</span>
                  </button>
                  <button onClick={() => setActiveTab('historial')} className={tabClass(activeTab === 'historial')}>
                    Historial <span className="opacity-50">({casosFinalizados.length})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button onClick={() => setOnlySuspicious(v => !v)}
                  className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2.5 rounded-xl border transition-colors ${onlySuspicious ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                  Solo sospechosos
                </button>
                <div className="relative">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente o tipo..."
                    className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 w-full sm:w-52 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 min-h-[260px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                  <Loader2 size={22} className="animate-spin text-orange-400" />
                  <p className="text-[11px] text-slate-400 font-semibold">Cargando casos...</p>
                </div>
              ) : activeList.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                  {searchTerm || onlySuspicious ? (
                    <>
                      <Search size={26} className="text-slate-300" />
                      <p className="text-[11px] text-slate-400 font-semibold text-center">No se encontraron casos con esos filtros.</p>
                    </>
                  ) : activeTab === 'pendientes' ? (
                    <>
                      <CheckCircle2 size={28} className="text-emerald-400" />
                      <p className="text-[11px] text-slate-400 font-semibold text-center">¡Sin casos pendientes!</p>
                    </>
                  ) : (
                    <>
                      <Clock size={28} className="text-slate-300" />
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForensicPanel;