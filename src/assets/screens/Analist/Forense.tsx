import { useNavigate } from 'react-router-dom';
import {
  Search,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Eye,
  Filter,
  LogOut,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────── */
const riskMeta = (risk) => {
  if (risk > 80) return { bar: 'bg-red-500',    badge: 'text-red-700 bg-red-50 border-red-200',    label: 'Crítico'  };
  if (risk > 60) return { bar: 'bg-orange-400',  badge: 'text-orange-700 bg-orange-50 border-orange-200', label: 'Alto'     };
  if (risk > 40) return { bar: 'bg-amber-400',   badge: 'text-amber-700 bg-amber-50 border-amber-200',  label: 'Medio'    };
  return           { bar: 'bg-emerald-400', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Bajo'     };
};

const accentMap = {
  Crítico : 'bg-red-500',
  Alto    : 'bg-orange-400',
  Medio   : 'bg-amber-400',
  Bajo    : 'bg-emerald-400',
};

/* ─── data ─────────────────────────────────────────────────────────── */
const stats = [
  { label: 'Casos Alto Riesgo', value: '2',      icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-100'     },
  { label: 'Pérdidas Evitadas', value: '$1,250K', icon: TrendingUp,  color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  { label: 'Tiempo Promedio',   value: '4.2h',    icon: ShieldCheck, color: 'text-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
];

const cases = [
  { id: 'CLM-2024-007', customer: 'Juan Pérez',     type: 'Colisión múltiple', risk: 92, date: '20 Mar 2026', flags: ['Foto editada', 'GPS no coincide', 'Red detectada'] },
  { id: 'CLM-2024-006', customer: 'María González', type: 'Robo total',         risk: 78, date: '19 Mar 2026', flags: ['Foto antigua', 'Taller sospechoso'] },
  { id: 'CLM-2024-005', customer: 'Carlos Ramírez', type: 'Daños por granizo',  risk: 65, date: '18 Mar 2026', flags: ['Costo elevado'] },
  { id: 'CLM-2024-001', customer: 'Roberto Silva',  type: 'Colisión',           risk: 23, date: '19 Mar 2026', flags: [] },
];

/* ─── component ─────────────────────────────────────────────────────── */
const ForensicPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex flex-col lg:flex-row">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#0B1E3D] lg:min-h-screen flex flex-col p-8 gap-8">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <ShieldCheck size={13} className="text-red-400" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight">ShieldLens</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.18em] font-semibold pl-9">Panel Forense</p>
        </div>

        {/* Analyst chip */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">CR</div>
          <div>
            <p className="text-sm font-semibold text-white">Carlos Ramírez</p>
            <p className="text-[10px] text-white/40 font-medium">Analista Forense</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1">Métricas del día</p>
          {stats.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Risk legend */}
        <div className="mt-auto">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1 mb-3">Niveles de riesgo</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Crítico  > 80%', color: 'bg-red-500'     },
              { label: 'Alto     > 60%', color: 'bg-orange-400'  },
              { label: 'Medio   > 40%', color: 'bg-amber-400'   },
              { label: 'Bajo    ≤ 40%', color: 'bg-emerald-400' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${r.color} shrink-0`} />
                <span className="text-[10px] text-white/40 font-mono">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors text-xs font-semibold"
        >
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6">

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">Sistema de Detección de Fraude · ML</p>
            <h1 className="text-[1.75rem] font-bold tracking-tight">
              Bandeja <span className="font-light text-slate-400">de Casos</span>
            </h1>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest self-start md:self-center">
            {cases.length} casos activos · Actualizado hace 2 min
          </span>
        </div>

        {/* Search + filter */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-2 p-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
            <input
              type="text"
              placeholder="Buscar por ID o nombre del cliente..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl cursor-pointer hover:border-slate-200 transition-colors min-w-44 justify-between">
            <span className="text-sm font-medium text-slate-400">Todos los estados</span>
            <Filter size={13} className="text-slate-300" />
          </div>
        </div>

        {/* Cases list */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden flex-1">

          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-100 bg-slate-50">
            <span className="col-span-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400" />
            <span className="col-span-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Caso / Cliente</span>
            <span className="col-span-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Nivel de Riesgo</span>
            <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Alertas</span>
            <span className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Acción</span>
          </div>

          <div className="divide-y divide-slate-50">
            {cases.map((item, i) => {
              const meta = riskMeta(item.risk);
              return (
                <div
                  key={i}
                  onClick={() => navigate('/analyst/case-details')}
                  className="grid grid-cols-12 items-center px-6 py-5 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Accent bar */}
                  <div className="col-span-1 flex justify-start">
                    <div className={`w-1 h-10 rounded-full ${accentMap[meta.label]}`} />
                  </div>

                  {/* ID + customer */}
                  <div className="col-span-4 space-y-0.5">
                    <p className="text-sm font-bold text-[#0B1E3D]">{item.id}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.customer}</p>
                    <p className="text-[10px] text-slate-300 uppercase tracking-wide">{item.type}</p>
                  </div>

                  {/* Risk */}
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${meta.bar}`} style={{ width: `${item.risk}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.risk}%</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                      <span className={`w-1 h-1 rounded-full ${meta.bar}`} />
                      {meta.label}
                    </span>
                  </div>

                  {/* Flags */}
                  <div className="col-span-2">
                    {item.flags.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.flags.slice(0, 2).map((flag, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <AlertTriangle size={9} className="text-slate-400 shrink-0" />
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide truncate">{flag}</span>
                          </div>
                        ))}
                        {item.flags.length > 2 && (
                          <span className="text-[9px] text-slate-300 font-semibold">+{item.flags.length - 2} más</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium italic">Sin alertas</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/analyst/case-details'); }}
                      className="flex items-center gap-1.5 bg-slate-50 group-hover:bg-[#0B1E3D] group-hover:text-white text-[#0B1E3D] border border-slate-200 group-hover:border-transparent px-4 py-2 rounded-xl text-[11px] font-semibold transition-all"
                    >
                      <Eye size={12} />
                      Analizar
                      <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 -ml-0.5 transition-opacity" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Mostrando {cases.length} de {cases.length} casos</span>
            <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">Ordenado por riesgo ↓</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default ForensicPanel;