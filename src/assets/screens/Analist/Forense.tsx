import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, LogOut, ChevronDown,
  ChevronRight, ChevronLeft, Loader2, FileText,
  TrendingUp, Activity, User, BarChart3
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

  const [cases,    setCases]    = useState<CaseRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const casosSospechosos = cases.filter(c => c.veredicto_ia === 'SOSPECHOSO').length;
  const totalPages       = Math.ceil(cases.length / PAGE_SIZE);
  const paginated        = cases.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

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

          {/* USER DROPDOWN */}
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

          {/* LEFT */}
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
                    Existen{' '}
                    <span className="text-white font-bold">{loading ? '...' : casosSospechosos} casos</span>{' '}
                    marcados como sospechosos por el modelo neuronal.
                  </p>
                </div>
                <TrendingUp size={80} className="text-white/5 shrink-0 hidden sm:block" />
              </div>
            </div>

            {/* CASES TABLE */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={15} className="text-blue-500" />
                  Casos Recientes
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {loading ? 'Sincronizando...' : `${cases.length} reportes`}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 min-h-67">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 size={22} className="animate-spin text-blue-400" />
                    <p className="text-[11px] text-slate-400 font-medium">Accediendo a la red ShieldLens...</p>
                  </div>
                ) : cases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <FileText size={20} className="text-slate-300" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Sin incidentes por analizar.</p>
                  </div>
                ) : (
                  paginated.map((item) => (
                    <div
                      key={item.id_reclamacion}
                      onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
                  ))
                )}
              </div>

              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Página {page + 1} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                      <ChevronLeft size={14} className="text-slate-600" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} onClick={() => setPage(i)}
                          className={`rounded-full transition-all ${i === page ? 'w-5 h-2 bg-[#0B1E3D]' : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'}`} />
                      ))}
                    </div>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                      <ChevronRight size={14} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
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

            <div className="bg-[#0B1E3D] rounded-3xl p-7 text-white">
              <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                <BarChart3 size={14} className="text-blue-400" /> Resumen del Día
              </h3>
              <div className="space-y-3.5">
                {[
                  { label: 'Casos totales',  value: loading ? '...' : cases.length,                                                                     color: 'text-white'    },
                  { label: 'Alertas IA',     value: loading ? '...' : casosSospechosos,                                                                  color: 'text-red-400'  },
                  { label: 'Tasa de riesgo', value: (!loading && cases.length > 0) ? `${((casosSospechosos / cases.length) * 100).toFixed(1)}%` : '0%', color: 'text-blue-300' },
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

export default ForensicPanel;