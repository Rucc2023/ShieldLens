import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/useUser';
import { 
  Shield, Users, LogOut, Plus, MoreVertical,
  BarChart2, X, Search, Download,
  CheckCircle, AlertCircle, CheckCircle2, XCircle, User, ChevronRight,
  FileText, UserCheck, UserCog,
} from 'lucide-react';

/* ─── Interfaces ── */
interface Ajustador {
  id_ajustador: string;
  nombre: string;
  numero_empleado: string;
  rol: string;
  is_deleted: boolean;
}

interface Cliente {
  id_cliente: string;
  nombre_cifrado: string;
  email_cifrado: string;
  telefono: string;
  is_deleted: boolean;
}

interface LogForense {
  id_log: number;
  usuario_ejecuta: string;
  fecha_hora_utc: string;
  accion_realizada: string;
  resultado: string;
  ip_origin: string;
  modulo_responsable: string;
}

/* ─── Donut chart ── */
const DonutChart = ({ ajustadores, clientes }: { ajustadores: number; clientes: number }) => {
  const total   = ajustadores + clientes;
  const R       = 56;
  const CX      = 80; const CY = 80;
  const strokeW = 16;
  const circumf = 2 * Math.PI * R;
  const ajPct   = total > 0 ? ajustadores / total : 0;
  const cliPct  = total > 0 ? clientes    / total : 0;
  const ajDash  = circumf * ajPct;
  const cliDash = circumf * cliPct;
  const cliOff  = circumf * (1 - ajPct);

  if (total === 0) return (
    <div className="flex items-center justify-center w-full h-36 text-slate-300 text-xs">Sin datos</div>
  );

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#34d399" strokeWidth={strokeW}
          strokeDasharray={`${cliDash} ${circumf - cliDash}`}
          strokeDashoffset={cliOff}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#8b5cf6" strokeWidth={strokeW}
          strokeDasharray={`${ajDash} ${circumf - ajDash}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`} />
        <text x={CX} y={CY - 6} textAnchor="middle" fill="#0B1E3D" fontSize="20" fontWeight="700">{total}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600" letterSpacing="1">USUARIOS</text>
      </svg>
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Ajustadores</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B1E3D]">{ajustadores}</span>
            <span className="text-[10px] text-slate-400">{Math.round(ajPct * 100)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">Clientes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#0B1E3D]">{clientes}</span>
            <span className="text-[10px] text-slate-400">{Math.round(cliPct * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Recent activity ── */
const RecentActivity = ({ logs }: { logs: LogForense[] }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-7">
    <h2 className="text-sm font-bold text-[#0B1E3D] mb-6">Auditoría Forense Reciente</h2>
    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
      {logs.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">No hay logs registrados.</p>
      ) : (
        logs.map((log) => (
          <div key={log.id_log} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
              ${log.resultado === 'exito' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
              {log.resultado === 'exito'
                ? <CheckCircle size={13} className="text-emerald-500" />
                : <AlertCircle size={13} className="text-red-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#0B1E3D] leading-snug">{log.accion_realizada}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{log.usuario_ejecuta || 'Sistema'} · IP {log.ip_origin}</p>
            </div>
            <span className="text-[10px] text-slate-300 whitespace-nowrap mt-0.5">
              {new Date(log.fecha_hora_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);

/* ─── Result modal ── */
const ResultModal = ({ success, message, onClose }: { success: boolean; message: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-70 flex items-center justify-center p-6">
    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-5">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border
        ${success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
        {success
          ? <CheckCircle2 size={30} className="text-emerald-400" />
          : <XCircle      size={30} className="text-red-400" />}
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#0B1E3D]">{success ? 'Operación exitosa' : 'Algo salió mal'}</h3>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose}
        className="w-full py-3 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98]">
        Entendido
      </button>
    </div>
  </div>
);

/* ─── CSV export ── */
const exportCSV = (data: (Ajustador | Cliente)[], mode: 'ajustadores' | 'clientes') => {
  const headers = mode === 'ajustadores' ? 'ID,Nombre,Número Empleado,Rol,Estado' : 'ID,Nombre,Email,Teléfono,Estado';
  const rows = mode === 'ajustadores'
    ? (data as Ajustador[]).map(a => `${a.id_ajustador},"${a.nombre}","${a.numero_empleado}","${a.rol}","${a.is_deleted ? 'Inactivo' : 'Activo'}"`)
    : (data as Cliente[]).map(c => `${c.id_cliente},"${c.nombre_cifrado}","${c.email_cifrado}","${c.telefono}","${c.is_deleted ? 'Inactivo' : 'Activo'}"`);
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `shieldlens_${mode}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
};

/* ─── Main ── */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { userName, userRole } = useUser();

  const [activeTab,       setActiveTab]       = useState<'resumen' | 'usuarios'>('resumen');
  const [viewMode,        setViewMode]        = useState<'ajustadores' | 'clientes'>('ajustadores');
  const [showModal,       setShowModal]       = useState(false);
  const [showPolizaModal, setShowPolizaModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [search,          setSearch]          = useState('');
  const [polizaData,      setPolizaData]      = useState({ tipo_seguro: 'Deluxe' });
  const [resultModal,     setResultModal]     = useState<{ success: boolean; message: string } | null>(null);

  const [ajustadores, setAjustadores] = useState<Ajustador[]>([]);
  const [clientes,    setClientes]    = useState<Cliente[]>([]);
  const [logs,        setLogs]        = useState<LogForense[]>([]);
  const [loading,     setLoading]     = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', numero_empleado: '', email: '', telefono: '', rol: 'Analista', password: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAju, resCli, resLogs] = await Promise.all([
        fetch('http://localhost:5000/api/auth/ajustadores'),
        fetch('http://localhost:5000/api/auth/clientes'),
        fetch('http://localhost:5000/api/auth/logs'),
      ]);
      if (resAju.ok)  setAjustadores(await resAju.json());
      if (resCli.ok)  setClientes(await resCli.json());
      if (resLogs.ok) setLogs((await resLogs.json()).slice(0, 50));
    } catch (err) { console.error('Error ShieldLens:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token    = localStorage.getItem('token');
    const headers  = { 'Content-Type': 'application/json', 'x-auth-token': token || '' };
    const endpoint = viewMode === 'ajustadores' ? 'http://localhost:5000/api/auth/ajustadores' : 'http://localhost:5000/api/auth/register';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(formData) });
      if (res.ok) {
        setShowModal(false);
        setFormData({ nombre: '', numero_empleado: '', email: '', telefono: '', rol: 'Analista', password: '' });
        fetchData();
        setResultModal({ success: true, message: `${viewMode === 'ajustadores' ? 'Ajustador' : 'Cliente'} registrado correctamente en ShieldBD.` });
      } else {
        setResultModal({ success: false, message: 'No se pudo completar el registro. Verifica los datos e intenta de nuevo.' });
      }
    } catch {
      setResultModal({ success: false, message: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.' });
    }
  };

  const handleAsignarPoliza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/asignar-poliza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') || '' },
        body: JSON.stringify({ id_cliente: selectedCliente?.id_cliente, ...polizaData }),
      });
      if (res.ok) {
        setShowPolizaModal(false);
        setPolizaData({ tipo_seguro: 'Deluxe' });
        setResultModal({ success: true, message: 'La póliza fue vinculada correctamente. El cliente recibirá una notificación de activación.' });
      } else {
        setResultModal({ success: false, message: 'No se pudo vincular la póliza. Intenta de nuevo.' });
      }
    } catch {
      setResultModal({ success: false, message: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.' });
    }
  };

  const rawList  = viewMode === 'ajustadores' ? ajustadores : clientes;
  const filtered = rawList.filter((item) => {
    const name = 'nombre' in item ? item.nombre : item.nombre_cifrado;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  const totalUsuarios = ajustadores.length + clientes.length;
  const ajActivos     = ajustadores.filter(a => !a.is_deleted).length;
  const cliActivos    = clientes.filter(c => !c.is_deleted).length;

  const TABS = [
    { id: 'resumen',  label: 'Resumen',  icon: BarChart2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users      },
  ] as const;

  const PLAN_OPTIONS = [
    { value: 'Deluxe',  label: 'Seguro de Auto Deluxe'          },
    { value: 'Amplia',  label: 'Seguro de Auto Cobertura Amplia' },
    { value: 'Premium', label: 'Seguro de Auto Premium'          },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex">

      {/* ── RESULT MODAL ── */}
      {resultModal && (
        <ResultModal
          success={resultModal.success}
          message={resultModal.message}
          onClose={() => setResultModal(null)}
        />
      )}

      {/* ── MODAL REGISTRO ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">ShieldLens Admin</p>
                <h2 className="text-xl font-bold text-[#0B1E3D]">Nuevo {viewMode === 'ajustadores' ? 'Ajustador' : 'Cliente'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input type="text" value={formData.nombre} required onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all" />
                </div>
              </div>
              {viewMode === 'ajustadores' ? (
                <>
                  <input type="text" placeholder="Número de empleado" onChange={(e) => setFormData({ ...formData, numero_empleado: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all" />
                  <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:outline-none transition-all">
                    <option>Analista</option><option>Auditor</option><option>Administrador</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="email" placeholder="Correo electrónico" onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all" />
                  <input type="tel" placeholder="Teléfono" onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all" />
                </>
              )}
              <input type="password" placeholder="Contraseña" onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-xs transition-all text-slate-600">Cancelar</button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PÓLIZA ── */}
      {showPolizaModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-60 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#0B1E3D] px-7 py-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border border-white/5" />
              <button onClick={() => setShowPolizaModal(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={13} className="text-white/60" />
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">ShieldLens Admin</p>
              <h3 className="text-xl font-bold text-white">Vincular Póliza</h3>
            </div>
            <div className="px-7 py-6 space-y-5">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B1E3D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedCliente.nombre_cifrado?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 leading-none mb-0.5">Cliente seleccionado</p>
                  <p className="text-sm font-semibold text-[#0B1E3D] truncate">{selectedCliente.nombre_cifrado}</p>
                </div>
              </div>
              <form onSubmit={handleAsignarPoliza} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Tipo de Póliza</label>
                  <div className="flex flex-col gap-2">
                    {PLAN_OPTIONS.map((plan) => (
                      <button key={plan.value} type="button" onClick={() => setPolizaData({ tipo_seguro: plan.value })}
                        className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all
                          ${polizaData.tipo_seguro === plan.value ? 'bg-[#0B1E3D] border-[#0B1E3D]' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${polizaData.tipo_seguro === plan.value ? 'border-white bg-white' : 'border-slate-300'}`}>
                            {polizaData.tipo_seguro === plan.value && <div className="w-2.5 h-2.5 rounded-full bg-[#0B1E3D]" />}
                          </div>
                          <span className={`text-sm font-semibold ${polizaData.tipo_seguro === plan.value ? 'text-white' : 'text-[#0B1E3D]'}`}>{plan.label}</span>
                        </div>
                        <ChevronRight size={14} className={polizaData.tipo_seguro === plan.value ? 'text-white/40' : 'text-slate-300'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <FileText size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-600 leading-relaxed">Al confirmar, se generará el número de póliza y se notificará al cliente.</p>
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Shield size={15} /> Confirmar Póliza
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="w-64 shrink-0 bg-[#0B1E3D] min-h-screen flex flex-col p-7 gap-7">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/src/assets/images/Logo.png" className="w-8 h-8 object-contain" alt="ShieldLens" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">ShieldLens</p>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.18em] font-semibold mt-0.5">Administración</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-white flex items-center justify-center font-bold text-xs shrink-0">{initials}</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none mb-1">{userName || 'Usuario'}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider truncate">{userRole || 'Sin Rol'}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1 mb-2">Navegación</p>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left
                ${activeTab === id ? 'bg-white text-[#0B1E3D]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate('/')}
          className="mt-auto flex items-center gap-2 text-white/25 hover:text-red-400 transition-colors text-xs font-semibold">
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="px-8 pt-8 pb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">ShieldLens Admin</p>
          <h1 className="text-[1.75rem] font-bold tracking-tight">
            {activeTab === 'resumen'
              ? <>Dashboard <span className="font-light text-slate-400">General</span></>
              : <>Gestión <span className="font-light text-slate-400">de Usuarios</span></>}
          </h1>
        </header>

        <div className="px-8 pb-10 flex flex-col gap-6 flex-1">

          {/* ── RESUMEN ── */}
          {activeTab === 'resumen' && (
            <div className="flex flex-col gap-5">

              {/* Row 1: 4 stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                  { label: 'Total usuarios',   value: totalUsuarios,          icon: Users,      bg: 'bg-blue-50',    border: 'border-blue-100',    iconCls: 'text-blue-500'    },
                  { label: 'Ajustadores',      value: ajustadores.length,     icon: UserCog,    bg: 'bg-violet-50',  border: 'border-violet-100',  iconCls: 'text-violet-500'  },
                  { label: 'Clientes',         value: clientes.length,        icon: UserCheck,  bg: 'bg-emerald-50', border: 'border-emerald-100', iconCls: 'text-emerald-500' },
                  { label: 'Usuarios activos', value: ajActivos + cliActivos, icon: CheckCircle,bg: 'bg-amber-50',   border: 'border-amber-100',   iconCls: 'text-amber-500'   },
                ] as const).map((s, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col gap-3">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${s.bg} ${s.border}`}>
                      <s.icon size={17} className={s.iconCls} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                      <p className="text-3xl font-bold text-[#0B1E3D] tracking-tight">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 2: status card + donut + activity bars */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Log summary card */}
                <div className="lg:col-span-5 relative overflow-hidden bg-[#0B1E3D] rounded-3xl p-7 text-white flex flex-col gap-5">
                  <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute -right-4  -top-4  w-32 h-32 rounded-full border border-white/5 pointer-events-none" />

                  <div className="relative z-10">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">ShieldLens · Bitácora</p>
                    <h2 className="text-base font-bold">Resumen de Actividad</h2>
                  </div>

                  <div className="relative z-10 flex flex-col gap-2">
                    {[
                      {
                        label: 'Registros de clientes',
                        count: logs.filter((l: LogForense) => l.accion_realizada?.toLowerCase().includes('registro') || l.accion_realizada?.toLowerCase().includes('cliente')).length,
                        cls: 'text-blue-300',
                        dot: 'bg-blue-400',
                      },
                      {
                        label: 'Asignación de pólizas',
                        count: logs.filter((l: LogForense) => l.accion_realizada?.toLowerCase().includes('póliza') || l.accion_realizada?.toLowerCase().includes('poliza') || l.accion_realizada?.toLowerCase().includes('asign')).length,
                        cls: 'text-violet-300',
                        dot: 'bg-violet-400',
                      },
                      {
                        label: 'Inicios de sesión',
                        count: logs.filter((l: LogForense) => l.accion_realizada?.toLowerCase().includes('login') || l.accion_realizada?.toLowerCase().includes('sesi') || l.accion_realizada?.toLowerCase().includes('acceso')).length,
                        cls: 'text-emerald-300',
                        dot: 'bg-emerald-400',
                      },
                      {
                        label: 'Actualización de dictamen',
                        count: logs.filter((l: LogForense) => l.accion_realizada?.toLowerCase().includes('dictamen') || l.accion_realizada?.toLowerCase().includes('actuali') || l.accion_realizada?.toLowerCase().includes('estado')).length,
                        cls: 'text-amber-300',
                        dot: 'bg-amber-400',
                      },
                    ].map((cat, i) => (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${cat.cls}`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cat.dot}`} />
                          <span className="text-[11px] font-semibold">{cat.label}</span>
                        </div>
                        <span className="text-sm font-bold tabular-nums">{cat.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
                    <span className="text-[10px] text-white/30 font-medium">Total Registrado</span>
                    <span className="text-sm font-bold text-white">{logs.length}</span>
                  </div>
                </div>

                {/* Donut chart — right */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-7 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-[#0B1E3D]">Distribución de usuarios</h3>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                      En tiempo real
                    </span>
                  </div>
                  <div className="flex-1 flex items-center">
                    <DonutChart ajustadores={ajustadores.length} clientes={clientes.length} />
                  </div>
                </div>
              </div>

              <RecentActivity logs={logs} />
            </div>
          )}

          {/* ── USUARIOS ── */}
          {activeTab === 'usuarios' && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-7 py-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                    {(['ajustadores', 'clientes'] as const).map((mode) => (
                      <button key={mode} onClick={() => { setViewMode(mode); setSearch(''); }}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all
                          ${viewMode === mode ? 'bg-white shadow-sm text-[#0B1E3D]' : 'text-slate-400 hover:text-slate-600'}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1 md:w-64">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all placeholder:text-slate-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => exportCSV(rawList, viewMode)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold transition-all">
                    <Download size={13} /> Exportar CSV
                  </button>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1E3D] hover:bg-[#071328] text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]">
                    <Plus size={13} /> Nuevo {viewMode === 'ajustadores' ? 'Ajustador' : 'Cliente'}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Usuario</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{viewMode === 'ajustadores' ? 'Rol' : 'Teléfono'}</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Estado</th>
                      <th className="px-8 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-12 text-xs text-slate-400 font-medium">Conectando a Azure SQL Server...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-xs text-slate-400 font-medium">{search ? `Sin resultados para "${search}"` : 'No hay registros.'}</td></tr>
                    ) : (
                      filtered.map((item) => {
                        const nombre = 'nombre' in item ? item.nombre : item.nombre_cifrado;
                        const key    = 'id_ajustador' in item ? item.id_ajustador : item.id_cliente;
                        return (
                          <tr key={key} className="hover:bg-slate-50/60 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0B1E3D] shrink-0">
                                  {nombre?.[0]?.toUpperCase()}
                                </div>
                                <p className="text-sm font-semibold text-[#0B1E3D]">{nombre}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs font-medium text-slate-500">{'rol' in item ? item.rol : item.telefono}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border
                                ${item.is_deleted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.is_deleted ? 'bg-red-400' : 'bg-emerald-400'}`} />
                                {item.is_deleted ? 'Inactivo' : 'Activo'}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {viewMode === 'clientes' && (
                                  <button onClick={() => { setSelectedCliente(item as Cliente); setShowPolizaModal(true); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white border border-blue-100 hover:border-transparent rounded-xl text-[10px] font-semibold transition-all">
                                    <Shield size={11} /> Asignar Póliza
                                  </button>
                                )}
                                <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                                  <MoreVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && (
                <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">{filtered.length} de {rawList.length} {viewMode}</span>
                  <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                    {rawList.filter(i => !i.is_deleted).length} activos · {rawList.filter(i => i.is_deleted).length} inactivos
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;