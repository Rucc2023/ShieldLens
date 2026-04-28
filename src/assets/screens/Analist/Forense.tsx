import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, ChevronDown, ChevronRight, ChevronLeft,
  Loader2, TrendingUp, Activity, User, BarChart3, CheckCircle2,
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

const PAGE_SIZE = 4;

/* ─── Bar chart SVG ── */
const BarChart = ({ reales, sospechosos }: { reales: number; sospechosos: number }) => {
  const total  = reales + sospechosos;
  const maxVal = Math.max(reales, sospechosos, 1);
  const W = 260; const H = 110;
  const barW = 44; const gap = 32;
  const baseY = H - 20; const maxH = H - 36;
  const rH = Math.round((reales      / maxVal) * maxH);
  const sH = Math.round((sospechosos / maxVal) * maxH);
  const rX = W / 2 - barW - gap / 2;
  const sX = W / 2 + gap / 2;
  const pctR = total > 0 ? Math.round((reales      / total) * 100) : 0;
  const pctS = total > 0 ? Math.round((sospechosos / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mx-auto overflow-visible">
        {[0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = baseY - Math.round(f * maxH);
          return (
            <g key={i}>
              <line x1={0} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={1} />
              <text x={0} y={y - 3} fill="#cbd5e1" fontSize="8" textAnchor="start">{Math.round(f * maxVal)}</text>
            </g>
          );
        })}
        <line x1={0} y1={baseY} x2={W} y2={baseY} stroke="#e2e8f0" strokeWidth={1} />
        <rect x={rX} y={baseY - rH} width={barW} height={Math.max(rH, 2)} rx={6} fill="#34d399" />
        {reales > 0 && <text x={rX + barW / 2} y={baseY - rH - 5} textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="700">{reales}</text>}
        <text x={rX + barW / 2} y={baseY + 13} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Reales</text>
        <rect x={sX} y={baseY - sH} width={barW} height={Math.max(sH, 2)} rx={6} fill="#f87171" />
        {sospechosos > 0 && <text x={sX + barW / 2} y={baseY - sH - 5} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">{sospechosos}</text>}
        <text x={sX + barW / 2} y={baseY + 13} textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600">Sospechosos</text>
      </svg>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div>
            <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest">Siniestros reales</p>
            <p className="text-lg font-bold text-emerald-700 leading-none">{reales} <span className="text-[10px] font-medium text-emerald-500">{pctR}%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
          <div>
            <p className="text-[9px] font-semibold text-red-500 uppercase tracking-widest">Sospechosos</p>
            <p className="text-lg font-bold text-red-600 leading-none">{sospechosos} <span className="text-[10px] font-medium text-red-400">{pctS}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Case row ── */
const CaseRow = ({ item, navigate, dim = false }: { item: CaseRecord; navigate: (p: string) => void; dim?: boolean }) => (
  <div
    onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all cursor-pointer group
      ${dim ? 'bg-white/50 border-slate-100 hover:bg-white hover:border-slate-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm'}`}
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
        <User size={16} className="text-[#0B1E3D]/40" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-[#0B1E3D]">{item.nombre_cliente}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">{item.tipo_siniestro}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">
            {new Date(item.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <span className={`block text-[10px] font-bold uppercase tracking-widest ${item.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'}`}>
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

/* ─── Pagination ── */
const Pagination = ({ current, total, setPage }: { current: number; total: number; setPage: (fn: (p: number) => number) => void }) => (
  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pág. {current + 1} / {total}</span>
    <div className="flex items-center gap-2">
      <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={current === 0}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center transition-colors">
        <ChevronLeft size={14} className="text-slate-600" />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setPage(() => i)}
            className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-[#0B1E3D]' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`} />
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

  const [cases,       setCases]       = useState<CaseRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(0);
  const [pageHist,    setPageHist]    = useState(0);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false); // ← collapsed by default

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res  = await fetch('http://localhost:5000/api/incidentes/general', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        });
        const json = await res.json();
        if (json.success) setCases(json.data);
      } catch { /* empty state */ }
      finally { setLoading(false); }
    };
    fetchCases();

    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  /* derived */
  const casosPendientes  = cases.filter(c => c.estado_gestion !== 'Finalizado');
  const casosFinalizados = cases.filter(c => c.estado_gestion === 'Finalizado');
  const casosSospechosos = cases.filter(c => c.veredicto_ia === 'SOSPECHOSO').length;
  const casosReales      = cases.filter(c => c.veredicto_ia !== 'SOSPECHOSO').length;

  const totalPages     = Math.ceil(casosPendientes.length  / PAGE_SIZE);
  const totalPagesHist = Math.ceil(casosFinalizados.length / PAGE_SIZE);
  const paginated      = casosPendientes.slice(page     * PAGE_SIZE, page     * PAGE_SIZE + PAGE_SIZE);
  const paginatedHist  = casosFinalizados.slice(pageHist * PAGE_SIZE, pageHist * PAGE_SIZE + PAGE_SIZE);

  const STATS = [
    { label: 'Total',          value: loading ? '...' : cases.length,            color: 'text-white'       },
    { label: 'Pendientes',           value: loading ? '...' : casosPendientes.length,  color: 'text-amber-400'   },
    { label: 'Finalizados',          value: loading ? '...' : casosFinalizados.length, color: 'text-emerald-400' },
    { label: 'Siniestros reales',    value: loading ? '...' : casosReales,             color: 'text-blue-300'    },
    { label: 'Sospechosos',          value: loading ? '...' : casosSospechosos,         color: 'text-red-400'     },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">
      <main className="flex-1 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="px-10 pt-9 pb-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Módulo Analista</p>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
              Bandeja <span className="font-light text-slate-400">Forense</span>
            </h1>
          </div>
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-3 py-2.5 rounded-2xl hover:border-slate-300 transition-all shadow-sm">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#0B1E3D]">Analista Senior</p>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Sesión Activa</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold">AS</div>
              <ChevronDown size={13} className={`text-slate-300 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Cuenta del analista</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={13} /> Cerrar sesión
                </button>
              </div>
            )}
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
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Prioridad Alta Detectada
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-2">Casos con riesgo de fraude</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Existen <span className="text-white font-bold">{loading ? '...' : casosSospechosos} casos</span> pendientes marcados como sospechosos.
                  </p>
                </div>
                <TrendingUp size={80} className="text-white/5 shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* CASOS PENDIENTES */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={15} className="text-blue-500" /> Casos por Revisar
                </h3>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {loading ? '...' : `${casosPendientes.length} pendientes`}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 min-h-68">
                {loading ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-blue-400" />
                    <p className="text-[11px] text-slate-400 font-medium">Cargando casos...</p>
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <CheckCircle2 size={28} className="text-emerald-400" />
                    <p className="text-[11px] text-slate-400 font-medium text-center">¡Sin casos pendientes!</p>
                  </div>
                ) : (
                  paginated.map(item => <CaseRow key={item.id_reclamacion} item={item} navigate={navigate} />)
                )}
              </div>

              {!loading && totalPages > 1 && <Pagination current={page} total={totalPages} setPage={setPage} />}
            </div>

            {/* ── HISTORIAL — collapsible ── */}
            <div className={`border rounded-3xl overflow-hidden transition-all duration-300 ${historyOpen ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}>

              {/* Toggle button */}
              <button
                onClick={() => setHistoryOpen(v => !v)}
                className="w-full flex items-center justify-between px-7 py-5 group hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${historyOpen ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    <CheckCircle2 size={15} className={historyOpen ? 'text-emerald-500' : 'text-slate-400'} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#0B1E3D]">Historial de Casos Finalizados</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {loading ? 'Cargando...' : casosFinalizados.length === 0
                        ? 'Sin casos finalizados aún'
                        : `${casosFinalizados.length} caso${casosFinalizados.length !== 1 ? 's' : ''} revisado${casosFinalizados.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!loading && casosFinalizados.length > 0 && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">
                      {casosFinalizados.length} revisados
                    </span>
                  )}
                  <div className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-all duration-200
                    ${historyOpen ? 'bg-[#0B1E3D] border-[#0B1E3D]' : 'bg-slate-100 border-slate-200 group-hover:border-slate-300'}`}>
                    <ChevronDown size={13} className={`transition-transform duration-300 ${historyOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                  </div>
                </div>
              </button>

              {/* Collapsible content */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${historyOpen ? 'max-h-200 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-7 pb-7 border-t border-slate-200">
                  <div className="flex flex-col gap-2.5 mt-5">
                    {casosFinalizados.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center italic py-8">
                        El historial aparecerá aquí conforme finalices los casos.
                      </p>
                    ) : (
                      paginatedHist.map(item => <CaseRow key={item.id_reclamacion} item={item} navigate={navigate} dim />)
                    )}
                  </div>
                  {!loading && totalPagesHist > 1 && <Pagination current={pageHist} total={totalPagesHist} setPage={setPageHist} />}
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Resumen */}
            <div className="bg-[#0B1E3D] rounded-3xl p-7 text-white">
              <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-400" /> Resumen General
              </h3>
              <div className="space-y-3">
                {STATS.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-[11px] text-white/40 font-medium">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-[#0B1E3D]">Reales vs Sospechosos</h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
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
        </div>
      </main>
    </div>
  );
};

export default ForensicPanel;