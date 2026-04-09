import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Briefcase, LogOut, Search,
  ChevronRight, Loader2, FileText,
  TrendingUp, Activity, User, BarChart3
} from 'lucide-react';

/* ─── Interfaces ── */
interface CaseRecord {
  id_reclamacion: string;
  nombre_cliente: string; 
  tipo_siniestro: string;
  fecha_reclamacion: string;
  score_confianza_ia: number;
  veredicto_ia: string;
  estado_gestion: string;
}

const ForensicPanel = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/incidentes/general', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' }
        });
        const json = await res.json();
        if (json.success) setCases(json.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  // Estadísticas rápidas
  const casosSospechosos = cases.filter(c => c.veredicto_ia === 'SOSPECHOSO').length;

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">
      
      {/* ── SIDEBAR (Estilo Minimalista) ── */}
      <aside className="w-18 bg-[#0B1E3D] flex flex-col items-center py-7 gap-8 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <Shield size={18} className="text-white" />
        </div>
        <nav className="flex flex-col gap-5">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer">
            <Briefcase size={16} className="text-white" />
          </div>
          {[Activity, BarChart3, Search].map((Icon, i) => (
            <div key={i} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
              <Icon size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
          ))}
        </nav>
        <button onClick={() => navigate('/')} className="mt-auto w-9 h-9 rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors group">
          <LogOut size={16} className="text-red-400/50 group-hover:text-red-400" />
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="px-10 pt-9 pb-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Módulo Analista</p>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
              Bandeja <span className="font-light text-slate-400">Forense</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
            <div className="text-right">
              <p className="text-sm font-semibold italic">Analista Senior</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Sesión: Activa</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center text-xs font-bold shadow-md">AS</div>
          </div>
        </header>

        <div className="px-10 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
          
          {/* ── COLUMNA IZQUIERDA: LISTADO ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* WIDGET DE RESUMEN IA */}
            <div className="relative overflow-hidden bg-[#0B1E3D] rounded-[2.5rem] p-9 text-white shadow-xl shadow-blue-900/10">
              <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full border border-white/5" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-[9px] font-bold uppercase tracking-widest mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    Prioridad Alta Detectada
                  </span>
                  <h2 className="text-2xl font-bold leading-snug mb-2">Casos con riesgo de fraude</h2>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Existen <span className="text-white font-bold">{casosSospechosos} casos</span> marcados como sospechosos por el modelo neuronal.
                  </p>
                </div>
                <TrendingUp size={80} className="text-white/5 shrink-0" />
              </div>
            </div>

            {/* TABLA DE RECLAMACIONES */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-7 shadow-sm">
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Activity size={15} className="text-blue-500" />
                  Casos Recientes
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {loading ? 'Sincronizando...' : `${cases.length} Reportes`}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {loading ? (
                  <div className="flex flex-col items-center py-20 gap-3">
                    <Loader2 size={24} className="animate-spin text-blue-500" />
                    <p className="text-[11px] text-slate-400 font-medium">Accediendo a la red ShieldLens...</p>
                  </div>
                ) : cases.length === 0 ? (
                  <div className="flex flex-col items-center py-20 gap-2">
                    <FileText size={32} className="text-slate-200" />
                    <p className="text-[11px] text-slate-400 font-medium italic">Sin incidentes por analizar.</p>
                  </div>
                ) : (
                  cases.map((item) => (
                    <div 
                      key={item.id_reclamacion}
                      onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)}
                      className="flex items-center justify-between px-6 py-4 rounded-4xl border border-slate-100 hover:border-blue-500/30 bg-slate-50/50 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <User size={18} className="text-[#0B1E3D]/40" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0B1E3D]">{item.nombre_cliente}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wide">
                              {item.tipo_siniestro}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                              {new Date(item.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                            item.veredicto_ia === 'SOSPECHOSO' ? 'text-red-500' : 'text-emerald-500'
                          }`}>
                            {item.veredicto_ia}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {item.id_reclamacion.substring(0, 8)}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-[#0B1E3D] group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: WIDGETS ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* WIDGET: ESTADO DEL SISTEMA */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-7 flex flex-col items-center text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                <Shield size={20} className="text-blue-500" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-2">ShieldLens Forensic AI</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Monitoreo activo. Todos los casos están siendo validados mediante visión computacional y análisis de metadatos.
              </p>
            </div>

            {/* WIDGET: RESUMEN DE CARGA */}
            <div className="bg-[#0B1E3D] rounded-[2.5rem] p-8 text-white shadow-lg">
              <h3 className="text-sm font-bold mb-5 flex items-center gap-2">
                <BarChart3 size={15} className="text-blue-400" />
                Resumen del Día
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Casos Totales', value: cases.length, color: 'text-white' },
                  { label: 'Alertas IA', value: casosSospechosos, color: 'text-red-400' },
                  { label: 'Tasa de Riesgo', value: cases.length > 0 ? `${((casosSospechosos/cases.length)*100).toFixed(1)}%` : '0%', color: 'text-blue-300' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-[11px] text-white/40">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN DE REPORTES */}
            <button className="w-full bg-white border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-4xl p-6 text-slate-400 hover:text-blue-500 transition-all group">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Generar Reporte Mensual</p>
              <p className="text-[9px] italic">Exportar PDF con auditoría forense</p>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ForensicPanel;