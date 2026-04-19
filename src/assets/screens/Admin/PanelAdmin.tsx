import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/useUser';
import { 
  Shield, Users, LogOut, Plus, MoreVertical,
  BarChart2, X, Search, Download,
  CheckCircle, AlertCircle, User
} from 'lucide-react';

/* ─── Interfaces ── */
interface Ajustador {
  id_ajustador: string; // Cambiado a string por el uso de UUID en SQL Server
  nombre: string;
  numero_empleado: string;
  rol: string;
  is_deleted: boolean;
}

interface Cliente {
  id_cliente: string; // Cambiado a string por el uso de UUID en SQL Server
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

/* ─── Metric card ── */
const MetricCard = ({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col gap-3">
    <div className={`w-1 h-4 rounded-full ${accent}`} />
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#0B1E3D] tracking-tight">{value}</p>
    </div>
    <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
  </div>
);

/* ─── Recent activity ── */
const RecentActivity = ({ logs }: { logs: LogForense[] }) => (
  <div className="bg-white border border-slate-200 rounded-3xl p-7">
    <h2 className="text-sm font-bold text-[#0B1E3D] mb-6">Auditoría Forense Reciente</h2>
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
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
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {log.usuario_ejecuta || 'Sistema'} · IP {log.ip_origin}
              </p>
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

/* ─── CSV export ── */
const exportCSV = (data: (Ajustador | Cliente)[], mode: 'ajustadores' | 'clientes') => {
  let headers: string;
  let rows: string[];

  if (mode === 'ajustadores') {
    headers = 'ID,Nombre,Número Empleado,Rol,Estado';
    rows = (data as Ajustador[]).map(a =>
      `${a.id_ajustador},"${a.nombre}","${a.numero_empleado}","${a.rol}","${a.is_deleted ? 'Inactivo' : 'Activo'}"`
    );
  } else {
    headers = 'ID,Nombre,Email,Teléfono,Estado';
    rows = (data as Cliente[]).map(c =>
      `${c.id_cliente},"${c.nombre_cifrado}","${c.email_cifrado}","${c.telefono}","${c.is_deleted ? 'Inactivo' : 'Activo'}"`
    );
  }

  const csv  = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `shieldlens_${mode}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── Main Component ── */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { userName, userRole } = useUser();

  const [activeTab, setActiveTab]   = useState<'resumen' | 'usuarios'>('resumen');
  const [viewMode,  setViewMode]    = useState<'ajustadores' | 'clientes'>('ajustadores');
  const [showModal, setShowModal]   = useState(false);
  const [search,    setSearch]      = useState('');

  // --- NUEVOS ESTADOS PARA PÓLIZAS ---
  const [showPolizaModal, setShowPolizaModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [polizaData, setPolizaData] = useState({
    tipo_seguro: 'Auto',
    //monto_cobertura: ''
  });

  const [ajustadores, setAjustadores] = useState<Ajustador[]>([]);
  const [clientes,    setClientes]    = useState<Cliente[]>([]);
  const [logs,        setLogs]        = useState<LogForense[]>([]);
  const [loading,     setLoading]     = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', 
    numero_empleado: '', 
    email: '', 
    telefono: '', 
    rol: 'Analista', 
    password: '',
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
    } catch (err) {
      console.error('Error ShieldLens:', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', 'x-auth-token': token || '' };
    const endpoint = viewMode === 'ajustadores' ? 'http://localhost:5000/api/auth/ajustadores' : 'http://localhost:5000/api/auth/register';

    try {
        const res = await fetch(endpoint, { method: 'POST', headers: headers, body: JSON.stringify(formData) });
        if (res.ok) {
            setShowModal(false);
            setFormData({ nombre: '', numero_empleado: '', email: '', telefono: '', rol: 'Analista', password: '' });
            fetchData();
        }
    } catch { alert('Error al registrar'); }
  };

  // --- FUNCIÓN PARA ASIGNAR PÓLIZA ---
  const handleAsignarPoliza = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/asignar-poliza', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-auth-token': localStorage.getItem('token') || '' 
        },
        body: JSON.stringify({
          id_cliente: selectedCliente?.id_cliente,
          ...polizaData
        }),
      });

      if (res.ok) {
        setShowPolizaModal(false);
        setPolizaData({ tipo_seguro: 'Auto' });
        alert("Póliza vinculada correctamente");
      }
    } catch { alert("Error al conectar con el servidor"); }
  };

  const rawList   = viewMode === 'ajustadores' ? ajustadores : clientes;
  const filtered  = rawList.filter((item) => {
    const name = 'nombre' in item ? item.nombre : item.nombre_cifrado;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const initials = userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : '??';

  const TABS = [
    { id: 'resumen',  label: 'Resumen',  icon: BarChart2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users      },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex">

      {/* ── MODAL REGISTRO USUARIO (ORIGINAL) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">ShieldLens Admin</p>
                <h2 className="text-xl font-bold text-[#0B1E3D]">Nuevo {viewMode === 'ajustadores' ? 'Ajustador' : 'Cliente'}</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center"><X size={14} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Nombre completo</label>
                <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input type="text" value={formData.nombre} required onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              </div>
              {viewMode === 'ajustadores' ? (
                <>
                  <input type="text" placeholder="Número de empleado" onChange={(e) => setFormData({ ...formData, numero_empleado: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none"><option>Analista</option><option>Auditor</option><option>Administrador</option></select>
                </>
              ) : (
                <>
                  <input type="email" placeholder="Correo" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  <input type="tel" placeholder="Teléfono" onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                </>
              )}
              <input type="password" placeholder="Contraseña" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
              <button type="submit" className="w-full py-3 bg-[#0B1E3D] text-white font-semibold rounded-xl text-xs">Guardar</button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ASIGNAR PÓLIZA (NUEVO) ── */}
      {showPolizaModal && selectedCliente && (
        <div className="fixed inset-0 bg-[#0B1E3D]/40 backdrop-blur-md z-[60] flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0B1E3D]">Vincular Póliza</h2>
              <button onClick={() => setShowPolizaModal(false)} className="text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleAsignarPoliza} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente Seleccionado</p>
                <p className="text-sm font-semibold truncate">{selectedCliente.nombre_cifrado}</p>
              </div>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={polizaData.tipo_seguro} onChange={(e) => setPolizaData({...polizaData, tipo_seguro: e.target.value})}>
                <option value="Deluxe">Seguro de Auto Deluxe</option>
                <option value="Amplia">Seguro de Auto Cobertura Amplia</option>
                <option value="Premiun">Seguro de Auto Premium</option>
              </select>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-bold">Confirmar Póliza</button>
            </form>
          </div>
        </div>
      )}

      {/* ── SIDEBAR (ORIGINAL) ── */}
      <aside className="w-64 shrink-0 bg-[#0B1E3D] min-h-screen flex flex-col p-7 gap-7">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><Shield size={13} className="text-white" /></div>
          <div><p className="text-sm font-bold text-white tracking-tight leading-none">ShieldLens</p><p className="text-[9px] text-white/30 uppercase tracking-[0.18em] font-semibold leading-none mt-0.5">Administración</p></div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-white flex items-center justify-center font-bold text-xs shrink-0">{initials}</div>
          <div className="min-w-0"><p className="text-sm font-semibold text-white truncate leading-none mb-1">{userName || 'Usuario'}</p><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" /><p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider truncate">{userRole || 'Sin Rol'}</p></div></div>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === id ? 'bg-white text-[#0B1E3D]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Icon size={14} /> {label}</button>
          ))}
        </nav>
        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-2 text-white/25 hover:text-red-400 transition-colors text-xs font-semibold"><LogOut size={14} /> Salir</button>
      </aside>

      {/* ── MAIN (ORIGINAL) ── */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6 min-h-screen">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">ShieldLens Admin</p><h1 className="text-[1.75rem] font-bold tracking-tight">{activeTab === 'resumen' ? 'Dashboard General' : 'Gestión de Usuarios'}</h1></div>

        {activeTab === 'resumen' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Usuarios Activos" value={String(ajustadores.length + clientes.length)} sub="+12% mensual" accent="bg-blue-500" />
              <MetricCard label="Ajustadores" value={String(ajustadores.length)} sub="Personal activo" accent="bg-violet-500" />
              <MetricCard label="Clientes" value={String(clientes.length)} sub="Asegurados" accent="bg-emerald-500" />
              <MetricCard label="Casos Cifrados" value="1,243" sub="Protección Azure" accent="bg-amber-500" />
            </div>
            <RecentActivity logs={logs} />
          </div>
        )}

        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  {(['ajustadores', 'clientes'] as const).map((mode) => (
                    <button key={mode} onClick={() => setViewMode(mode)} className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest ${viewMode === mode ? 'bg-white shadow-sm text-[#0B1E3D]' : 'text-slate-400'}`}>{mode}</button>
                  ))}
                </div>
                <div className="relative flex-1 md:w-64"><Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" /></div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => exportCSV(rawList, viewMode)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"><Download size={13} /> Exportar</button>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1E3D] text-white rounded-xl text-xs font-semibold"><Plus size={13} /> Nuevo {viewMode}</button>
              </div>
            </div>

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
                {filtered.map((item) => {
                  const nombre = 'nombre' in item ? item.nombre : item.nombre_cifrado;
                  const key = 'id_ajustador' in item ? item.id_ajustador : item.id_cliente;
                  return (
                    <tr key={key} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0B1E3D] shrink-0">{nombre?.[0]?.toUpperCase()}</div>
                          <div><p className="text-sm font-semibold text-[#0B1E3D] leading-none mb-0.5">{nombre}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-500">{'rol' in item ? item.rol : item.telefono}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${item.is_deleted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{item.is_deleted ? 'Inactivo' : 'Activo'}</span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        {/* --- BOTÓN NUEVO DENTRO DE LA FILA DE CLIENTES --- */}
                        {viewMode === 'clientes' && (
                          <button 
                            onClick={() => { setSelectedCliente(item as Cliente); setShowPolizaModal(true); }}
                            className="mr-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors"
                          >
                            ASIGNAR PÓLIZA
                          </button>
                        )}
                        <button className="w-8 h-8 rounded-lg hover:bg-slate-100 inline-flex items-center justify-center ml-auto transition-colors"><MoreVertical size={14} className="text-slate-300 group-hover:text-slate-500" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;