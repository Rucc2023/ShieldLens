import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LogOut, ChevronDown,
  ChevronRight, ChevronLeft, Loader2, FileText,
  TrendingUp, Activity, User, BarChart3, CheckCircle2
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

const ForensicPanel = () => {
  const navigate = useNavigate();
  const menuRef  = useRef<HTMLDivElement>(null);

  const [cases,      setCases]    = useState<CaseRecord[]>([]);
  const [loading,    setLoading]  = useState(true);
  const [page,       setPage]     = useState(0);
  const [pageHist,   setPageHist] = useState(0); // Paginación para historial
  const [menuOpen,   setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/incidentes/general', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        });
        const json = await res.json();
        if (json.success) setCases(json.data);
      } catch { /* empty state handles it */ }
      finally { setLoading(false); }
    };
    fetchCases();

    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // FILTRADO DE CASOS
  const casosPendientes = cases.filter(c => c.estado_gestion !== 'Finalizado');
  const casosFinalizados = cases.filter(c => c.estado_gestion === 'Finalizado');
  
  const casosSospechosos = casosPendientes.filter(c => c.veredicto_ia === 'SOSPECHOSO').length;

  // PAGINACIÓN PENDIENTES
  const totalPages = Math.ceil(casosPendientes.length / PAGE_SIZE);
  const paginated = casosPendientes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // PAGINACIÓN HISTORIAL
  const totalPagesHist = Math.ceil(casosFinalizados.length / PAGE_SIZE);
  const paginatedHist = casosFinalizados.slice(pageHist * PAGE_SIZE, pageHist * PAGE_SIZE + PAGE_SIZE);

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
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-3 py-2.5 rounded-2xl hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#0B1E3D]">Analista Senior</p>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Sesión Activa</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold">
                AS
              </div>
              <ChevronDown
                size={13}
                className={`text-slate-300 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Cuenta del analista</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* HERO */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-3xl p-9 text-white">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Prioridad Alta Detectada
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-2">Casos con riesgo de fraude</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Existen{' '}
                    <span className="text-white font-bold">{loading ? '...' : casosSospechosos} casos</span>{' '}
                    pendientes marcados como sospechosos.
                  </p>
                </div>
                <TrendingUp size={80} className="text-white/5 shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* TABLA 1: CASOS PENDIENTES */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={15} className="text-blue-500" />
                  Casos por Revisar
                </h3>
                <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                  {loading ? '...' : `${casosPendientes.length} Pendientes`}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 min-h-87.5">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-blue-400" />
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <CheckCircle2 size={30} className="text-emerald-400" />
                    <p className="text-[11px] text-slate-400 font-medium text-center">¡Excelente trabajo!<br/>No hay casos pendientes por analizar.</p>
                  </div>
                ) : (
                  paginated.map((item) => (
                    <CaseRow key={item.id_reclamacion} item={item} navigate={navigate} />
                  ))
                )}
              </div>

              {/* PAGINACIÓN PENDIENTES */}
              {!loading && totalPages > 1 && (
                <Pagination 
                  current={page} 
                  total={totalPages} 
                  setPage={setPage} 
                />
              )}
            </div>

            {/* TABLA 2: HISTORIAL DE REVISADOS */}
            <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-500">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  Historial de Reclamos Finalizados
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {loading ? '...' : `${casosFinalizados.length} Revisados`}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 opacity-80">
                {casosFinalizados.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium py-10 text-center italic">El historial aparecerá aquí conforme finalices los casos.</p>
                ) : (
                  paginatedHist.map((item) => (
                    <CaseRow key={item.id_reclamacion} item={item} navigate={navigate} isHistory />
                  ))
                )}
              </div>

              {/* PAGINACIÓN HISTORIAL */}
              {!loading && totalPagesHist > 1 && (
                <Pagination 
                  current={pageHist} 
                  total={totalPagesHist} 
                  setPage={setPageHist} 
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Shield size={18} className="text-blue-500" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2">ShieldLens Forensic AI</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Monitoreo activo. Todos los casos se validan mediante visión computacional y análisis de metadatos.
              </p>
            </div>

            <div className="bg-[#0B1E3D] rounded-3xl p-7 text-white shadow-lg shadow-blue-900/20">
              <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-400" /> Resumen General
              </h3>
              <div className="space-y-3.5">
                {[
                  { label: 'Total Base de Datos', value: loading ? '...' : cases.length, color: 'text-white' },
                  { label: 'Pendientes Hoy',     value: loading ? '...' : casosPendientes.length, color: 'text-orange-400' },
                  { label: 'Revisiones Finalizadas', value: loading ? '...' : casosFinalizados.length, color: 'text-emerald-400' },
                  { label: 'Alertas Críticas',   value: loading ? '...' : casosSospechosos, color: 'text-red-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                    <span className="text-[11px] text-white/40 font-medium">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full bg-white border border-dashed border-slate-200 hover:border-blue-400 rounded-3xl p-6 text-slate-400 hover:text-blue-500 transition-all group flex flex-col items-center gap-1">
              <FileText size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
              <p className="text-[10px] font-semibold uppercase tracking-widest">Generar Reporte Mensual</p>
              <p className="text-[9px] text-slate-300 group-hover:text-blue-400/60 transition-colors">Exportar PDF con auditoría forense</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// COMPONENTE PARA LAS FILAS (Para no repetir código)
const CaseRow = ({ item, navigate, isHistory = false }: { item: CaseRecord, navigate: any, isHistory?: boolean }) => (
  <div
    onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)}
    className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all cursor-pointer group ${
      isHistory 
      ? 'bg-white/50 border-slate-100 grayscale-[0.5] hover:grayscale-0' 
      : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm'
    }`}
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
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(item.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <span className={`block text-[10px] font-bold uppercase tracking-widest ${
          item.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'
        }`}>
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

// COMPONENTE DE PAGINACIÓN
const Pagination = ({ current, total, setPage }: { current: number, total: number, setPage: any }) => (
  <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
      Página {current + 1} de {total}
    </span>
    <div className="flex items-center gap-2">
      <button onClick={() => setPage((p: number) => Math.max(0, p - 1))} disabled={current === 0}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center">
        <ChevronLeft size={14} className="text-slate-600" />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setPage(i)}
            className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-[#0B1E3D]' : 'w-2 h-2 bg-slate-200'}`} />
        ))}
      </div>
      <button onClick={() => setPage((p: number) => Math.min(total - 1, p + 1))} disabled={current === total - 1}
        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 flex items-center justify-center">
        <ChevronRight size={14} className="text-slate-600" />
      </button>
    </div>
  </div>
);

export default ForensicPanel;