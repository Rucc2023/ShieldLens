import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  AlertCircle,
  TrendingUp,
  Shield,
  Eye,
  Filter,
  LogOut,
  Settings,
  Briefcase
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────── */
const riskMeta = (risk: number) => {
  if (risk > 80) return { bar: 'bg-red-500', badge: 'text-red-700 bg-red-50 border-red-200', label: 'Crítico' };
  if (risk > 60) return { bar: 'bg-orange-400', badge: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Alto' };
  if (risk > 40) return { bar: 'bg-amber-400', badge: 'text-amber-700 bg-amber-50 border-amber-200', label: 'Medio' };
  return { bar: 'bg-emerald-400', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Bajo' };
};

const accentMap: Record<string, string> = {
  Crítico: 'bg-red-500',
  Alto: 'bg-orange-400',
  Medio: 'bg-amber-400',
  Bajo: 'bg-emerald-400',
};

/* ─── component ─────────────────────────────────────────────────────── */
const ForensicPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('casos');

  const stats = [
    { label: 'Casos Críticos', value: '2', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Casos Bajo Riesgo', value: '1', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pérdidas Evitadas', value: '$1.2M', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const cases = [
    { id: 'CLM-2024-007', customer: 'Juan Pérez', type: 'Colisión múltiple', risk: 92, flags: ['Foto editada', 'GPS no coincide'] },
    { id: 'CLM-2024-006', customer: 'María González', type: 'Robo total', risk: 78, flags: ['Taller sospechoso'] },
    { id: 'CLM-2024-005', customer: 'Carlos Ramírez', type: 'Daños por granizo', risk: 65, flags: ['Costo elevado'] },
    { id: 'CLM-2024-001', customer: 'Roberto Silva', type: 'Colisión', risk: 23, flags: [] },
  ];

  const menuItems = [
    { id: 'casos', label: 'Casos', icon: Briefcase },
    { id: 'config', label: 'Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex flex-col lg:flex-row">

      {/* ── SIDEBAR (Igual a AdminPanel) ── */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0B1E3D] lg:min-h-screen flex flex-col p-8 gap-8">
        
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-1 text-white">
            <Shield size={18} className="text-white" />
            <span className="font-bold text-base tracking-tight">ShieldLens</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.18em] font-semibold pl-7">Panel Forense</p>
        </div>

        {/* User Chip */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">CR</div>
          <div>
            <p className="text-sm font-semibold text-white">Carlos Ramírez</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Analista Senior</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1 mb-2">Navegación</p>
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left
                ${activeTab === item.id ? 'bg-white text-[#0B1E3D] shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={14} /> {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-2 text-white/25 hover:text-red-400 transition-colors text-xs font-semibold">
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        
        {/* Header Title */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Detección de Fraude · ML</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B1E3D]">
            Bandeja <span className="font-light text-slate-400">de Casos</span>
          </h1>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={20} className={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por ID o cliente..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
            <Filter size={14} /> Filtrar
          </button>
        </div>

        {/* Cases Table */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ref / Cliente</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Nivel de Riesgo</th>
                  <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Alertas Detectadas</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cases.map((item) => {
                  const meta = riskMeta(item.risk);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-1 h-8 rounded-full ${accentMap[meta.label]}`} />
                          <div>
                            <p className="text-sm font-bold text-[#0B1E3D]">{item.id}</p>
                            <p className="text-xs text-slate-500 font-medium">{item.customer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${meta.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.bar}`} />
                          {meta.label} ({item.risk}%)
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {item.flags.length > 0 ? item.flags.map((f, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200">
                              {f}
                            </span>
                          )) : (
                            <span className="text-[10px] text-emerald-500 font-bold italic">✓ Limpio</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => navigate('/analyst/case-details')}
                          className="p-2.5 bg-slate-50 text-[#0B1E3D] hover:bg-[#0B1E3D] hover:text-white rounded-xl transition-all border border-slate-200"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForensicPanel;