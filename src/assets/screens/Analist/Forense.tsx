import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, TrendingUp, Shield,
  Eye, LogOut, Briefcase, Loader2
} from 'lucide-react';

/* --- Interfaces para evitar el error "Unexpected any" --- */
interface CaseRecord {
  id_reclamacion: string;
  cliente: string;
  tipo_siniestro: string;
  score_confianza_ia: number;
  veredicto_ia: string;
  estado_gestion: string;
}

const riskMeta = (score: number | null) => {
  const safeScore = score ?? 1;
  const risk = (1 - safeScore) * 100; 
  if (risk > 75) return { bar: 'bg-red-500', badge: 'text-red-700 bg-red-50 border-red-200', label: 'Crítico' };
  if (risk > 50) return { bar: 'bg-orange-400', badge: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Alto' };
  return { bar: 'bg-emerald-400', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Bajo' };
};

const ForensicPanel = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForense = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/incidentes/forense', {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' }
        });
        const json = await res.json();
        if (json.success) setCases(json.data);
      } catch {
        console.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    fetchForense();
  }, []);

  const criticos = cases.filter(c => (1 - (c.score_confianza_ia ?? 1)) * 100 > 75).length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex flex-col lg:flex-row">
      <aside className="w-full lg:w-64 bg-[#0B1E3D] p-8 flex flex-col gap-8">
        <div className="flex items-center gap-2 text-white">
          <Shield size={18} />
          <span className="font-bold">ShieldLens Forense</span>
        </div>
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-[#0B1E3D] text-xs font-bold shadow-lg">
            <Briefcase size={14} /> Casos Asignados
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-2 text-white/40 hover:text-red-400 text-xs font-bold transition-colors">
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </aside>

      <main className="flex-1 p-10 flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold">Bandeja <span className="font-light text-slate-400">de Análisis</span></h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">Alertas Críticas</p><p className="text-3xl font-bold text-red-500">{criticos}</p></div>
            <AlertCircle className="text-red-500" />
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between col-span-2">
             <TrendingUp className="text-blue-500" />
             <p className="text-xs font-bold text-slate-400 italic">Monitoreo de fraude activo mediante Redes Neuronales</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400">ID Caso / Cliente</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase text-slate-400 text-center">Riesgo IA</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase text-slate-400 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cases.map((item) => {
                  const meta = riskMeta(item.score_confianza_ia);
                  return (
                    <tr key={item.id_reclamacion} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-[#0B1E3D]">{item.id_reclamacion.substring(0,8)}</p>
                        <p className="text-[11px] text-slate-400">{item.cliente}</p>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => navigate(`/analyst/case-details/${item.id_reclamacion}`)} className="p-2 bg-slate-100 hover:bg-[#0B1E3D] hover:text-white rounded-lg transition-all">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForensicPanel;