import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Settings, LogOut, 
  Search, Download, Plus, MoreVertical,
  BarChart2, Lock, FileText, PieChart
} from 'lucide-react';

/* ─── Interfaces ────────────────────────────────────────────────── */

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

/* ─── Subcomponentes ────────────────────────────────────────────── */

const MetricCard = ({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-3 shadow-sm">
    <div className={`w-1 h-4 rounded-full ${accent}`} />
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#0B1E3D] tracking-tight">{value}</p>
    </div>
    <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
  </div>
);

const DistributionChart = () => (
  <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
    <div className="mb-6">
      <h2 className="text-sm font-bold text-[#0B1E3D] flex items-center gap-2">
        <PieChart size={16} className="text-blue-500" /> Distribución de Reclamaciones
      </h2>
      <p className="text-[11px] text-slate-400 mt-1">Estado actual de todas las reclamaciones procesadas</p>
    </div>
    
    <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
      {/* Gráfico SVG recreado */}
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#E2E8F0" strokeWidth="3.5" />
          {/* Aprobadas 69% */}
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#22C55E" strokeWidth="3.8" strokeDasharray="69 100" />
          {/* Rechazadas 13% (offset 69) */}
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#EF4444" strokeWidth="3.8" strokeDasharray="13 100" strokeDashoffset="-69" />
          {/* En Revisión 7% (offset 82) */}
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#F59E0B" strokeWidth="3.8" strokeDasharray="7 100" strokeDashoffset="-82" />
          {/* Pendientes 12% (offset 89) */}
          <circle cx="18" cy="18" r="16" fill="transparent" stroke="#64748B" strokeWidth="3.8" strokeDasharray="11 100" strokeDashoffset="-89" />
        </svg>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <ChartLegend label="Aprobadas" percent="69%" color="bg-green-500" />
        <ChartLegend label="Rechazadas" percent="13%" color="bg-red-500" />
        <ChartLegend label="En Revisión" percent="7%" color="bg-amber-500" />
        <ChartLegend label="Pendientes" percent="12%" color="bg-slate-500" />
      </div>
    </div>
  </div>
);

const ChartLegend = ({ label, percent, color }: { label: string; percent: string; color: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
    <span className="text-xs font-semibold text-slate-600 w-24">{label}</span>
    <span className="text-xs font-bold text-[#0B1E3D]">{percent}</span>
  </div>
);

const RecentActivity = () => {
  const items = [
    { icon: Users, label: "Nuevo usuario registrado", detail: "Pedro Sánchez · Analista", time: "15 min", color: "bg-blue-50 text-blue-500 border-blue-100" },
    { icon: Settings, label: "Configuración actualizada", detail: "Umbral IA modificado a 85%", time: "1 h", color: "bg-violet-50 text-violet-500 border-violet-100" },
    { icon: FileText, label: "Reporte generado", detail: "Informe mensual · Feb 2026", time: "3 h", color: "bg-emerald-50 text-emerald-500 border-emerald-100" },
    { icon: Lock, label: "Alerta de seguridad", detail: "Acceso no autorizado bloqueado", time: "5 h", color: "bg-red-50 text-red-500 border-red-100" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
      <h2 className="text-sm font-bold text-[#0B1E3D] mb-6">Actividad Reciente</h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
              <item.icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0B1E3D]">{item.label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{item.detail}</p>
            </div>
            <span className="text-[10px] font-medium text-slate-300 uppercase tracking-widest shrink-0 mt-0.5">Hace {item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Panel ────────────────────────────────────────────────── */

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');

  const [userList] = useState<User[]>([
    { id: 1, name: 'Pedro Sánchez', email: 'p.sanchez@segurosvida.com', role: 'Analista', status: 'Activo' },
    { id: 2, name: 'Ana Martínez', email: 'a.martinez@segurosvida.com', role: 'Administrador', status: 'Activo' },
    { id: 3, name: 'Roberto Gómez', email: 'r.gomez@segurosvida.com', role: 'Soporte', status: 'Inactivo' },
    { id: 4, name: 'Laura Torres', email: 'l.torres@segurosvida.com', role: 'Analista', status: 'Activo' },
  ]);

  const exportToCSV = () => {
    const headers = "ID,Nombre,Email,Rol,Estado\n";
    const rows = userList.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios_shieldlens.csv';
    a.click();
  };

  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: BarChart2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'configuracion', label: 'Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex flex-col lg:flex-row">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#0B1E3D] lg:min-h-screen flex flex-col p-8 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1 text-white">
            <Shield size={18} className="text-white" />
            <span className="font-bold text-base tracking-tight">ShieldLens</span>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.18em] font-semibold pl-7">Administración</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">AM</div>
          <div>
            <p className="text-sm font-semibold text-white">Ana Martínez</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Admin Root</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1 mb-2">Navegación</p>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left
                ${activeTab === tab.id ? 'bg-white text-[#0B1E3D] shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

  
        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-2 text-white/25 hover:text-red-400 transition-colors text-xs font-semibold">
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">ShieldLens · Control Total</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B1E3D]">
            {activeTab === 'resumen' && <>Resumen <span className="font-light text-slate-400">del Sistema</span></>}
            {activeTab === 'usuarios' && <>Gestión <span className="font-light text-slate-400">de Usuarios</span></>}
          </h1>
        </div>

        {activeTab === 'resumen' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Usuarios Activos" value="247" sub="+12% mensual" accent="bg-blue-500" />
              <MetricCard label="Casos Procesados" value="1,243" sub="+8% vs ayer" accent="bg-emerald-500" />
              <MetricCard label="Fraudes Detectados" value="89" sub="−5% mensual" accent="bg-red-500" />
              <MetricCard label="Precisión" value="94.7%" sub="+2.3% mejora" accent="bg-violet-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DistributionChart />
              <RecentActivity />
            </div>
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-8 py-6 border-b border-slate-100">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input type="text" placeholder="Buscar por nombre o email..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10" />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B1E3D] px-5 py-2.5 rounded-xl text-xs font-semibold">
                  <Download size={13} /> Exportar CSV
                </button>
                <button className="flex items-center gap-2 bg-[#0B1E3D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/10">
                  <Plus size={13} /> Nuevo Usuario
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Usuario</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rol</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Estado</th>
                    <th className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {userList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs">{user.name[0]}</div>
                          <div>
                            <p className="text-sm font-bold text-[#0B1E3D]">{user.name}</p>
                            <p className="text-[11px] text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-xs text-slate-500">{user.role}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${user.status === 'Activo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Activo' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <MoreVertical size={14} className="text-slate-300 cursor-pointer hover:text-slate-600 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;