import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/useUser';
import { 
  Shield, Users, LogOut, Plus, MoreVertical,
  BarChart2, X, ChevronDown, Search, Download,
  CheckCircle, AlertCircle,
} from 'lucide-react';

/* ─── Interfaces ── */
interface Ajustador {
  id_ajustador: number;
  nombre: string;
  numero_empleado: string;
  rol: string;
  is_deleted: boolean;
}

interface Cliente {
  id_cliente: number;
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

/* ─── Main ── */
const AdminPanel = () => {
  const navigate = useNavigate();
  const { userName, userRole } = useUser();

  const [activeTab, setActiveTab]   = useState<'resumen' | 'usuarios'>('resumen');
  const [viewMode,  setViewMode]    = useState<'ajustadores' | 'clientes'>('ajustadores');
  const [showModal, setShowModal]   = useState(false);
  const [search,    setSearch]      = useState('');

  const [ajustadores, setAjustadores] = useState<Ajustador[]>([]);
  const [clientes,    setClientes]    = useState<Cliente[]>([]);
  const [logs,        setLogs]        = useState<LogForense[]>([]);
  const [loading,     setLoading]     = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', numero_empleado: '', rol: 'Analista', password: '',
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
    try {
      const res = await fetch('http://localhost:5000/api/auth/ajustadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ nombre: '', numero_empleado: '', rol: 'Analista', password: '' });
        fetchData();
      }
    } catch { alert('No se pudo conectar con el servidor.'); }
  };

  /* Filtered rows */
  const rawList   = viewMode === 'ajustadores' ? ajustadores : clientes;
  const filtered  = rawList.filter((item) => {
    const name = 'nombre' in item ? item.nombre : item.nombre_cifrado;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  const TABS = [
    { id: 'resumen',  label: 'Resumen',  icon: BarChart2 },
    { id: 'usuarios', label: 'Usuarios', icon: Users      },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex">

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">ShieldLens Admin</p>
                <h2 className="text-xl font-bold text-[#0B1E3D]">Nuevo Ajustador</h2>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                <X size={14} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Nombre completo',      key: 'nombre',           type: 'text',     placeholder: 'Ej. Luis Pasquett'    },
                { label: 'Número de empleado',   key: 'numero_empleado',  type: 'text',     placeholder: 'Aj-2026-02'           },
                { label: 'Contraseña de acceso', key: 'password',         type: 'password', placeholder: 'Mínimo 8 caracteres'  },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder={placeholder}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all placeholder:text-slate-300"
                  />
                </div>
              ))}

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Rol de usuario</label>
                <div className="relative">
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 transition-all"
                  >
                    <option>Analista</option>
                    <option>Auditor</option>
                    <option>Administrador</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-xs transition-all text-slate-600">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98]">
                  Guardar ajustador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside className="w-64 shrink-0 bg-[#0B1E3D] min-h-screen flex flex-col p-7 gap-7">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <Shield size={13} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-none">ShieldLens</p>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.18em] font-semibold leading-none mt-0.5">Administración</p>
          </div>
        </div>

        {/* User chip */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-none mb-1">{userName || 'Usuario'}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider truncate">{userRole || 'Sin Rol'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25 px-1 mb-2">Navegación</p>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left
                ${activeTab === id
                  ? 'bg-white text-[#0B1E3D]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={() => navigate('/')}
          className="mt-auto flex items-center gap-2 text-white/25 hover:text-red-400 transition-colors text-xs font-semibold"
        >
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6 min-h-screen">

        {/* Page title */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">ShieldLens Admin</p>
          <h1 className="text-[1.75rem] font-bold tracking-tight">
            {activeTab === 'resumen'
              ? <>Dashboard <span className="font-light text-slate-400">General</span></>
              : <>Gestión <span className="font-light text-slate-400">de Usuarios</span></>}
          </h1>
        </div>

        {/* ── RESUMEN ── */}
        {activeTab === 'resumen' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Usuarios Activos"  value={String(ajustadores.length + clientes.length)} sub="+12% mensual"    accent="bg-blue-500"    />
              <MetricCard label="Ajustadores"        value={String(ajustadores.length)}                   sub="Personal activo" accent="bg-violet-500"  />
              <MetricCard label="Clientes"           value={String(clientes.length)}                       sub="Asegurados"      accent="bg-emerald-500" />
              <MetricCard label="Casos Cifrados"     value="1,243"                                         sub="Protección Azure" accent="bg-amber-500"  />
            </div>
            <RecentActivity logs={logs} />
          </div>
        )}

        {/* ── USUARIOS ── */}
        {activeTab === 'usuarios' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">

            {/* Toolbar */}
            <div className="px-7 py-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">

              {/* Toggle + search */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Segmented control */}
                <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                  {(['ajustadores', 'clientes'] as const).map((mode) => (
                    <button key={mode} onClick={() => { setViewMode(mode); setSearch(''); }}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-widest transition-all
                        ${viewMode === mode ? 'bg-white shadow-sm text-[#0B1E3D]' : 'text-slate-400 hover:text-slate-600'}`}>
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => exportCSV(rawList, viewMode)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0B1E3D] rounded-xl text-xs font-semibold transition-all"
                >
                  <Download size={13} /> Exportar CSV
                </button>
                {viewMode === 'ajustadores' && (
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1E3D] hover:bg-[#071328] text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]">
                    <Plus size={13} /> Nuevo ajustador
                  </button>
                )}
              </div>
            </div>

            {/* Result count */}
            {search && (
              <div className="px-7 py-2.5 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para "{search}"
                </p>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Usuario</th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      {viewMode === 'ajustadores' ? 'Rol' : 'Teléfono'}
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Estado</th>
                    <th className="px-8 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-xs text-slate-400 font-medium">
                        Conectando a Azure SQL Server...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12">
                        <p className="text-xs text-slate-400 font-medium">
                          {search ? `Sin resultados para "${search}"` : 'No hay usuarios registrados.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item: Ajustador | Cliente) => {
                      const nombre    = 'nombre' in item ? item.nombre : item.nombre_cifrado;
                      const subtitulo = 'numero_empleado' in item ? `ID: ${item.numero_empleado}` : item.email_cifrado;
                      const detalle   = 'rol' in item ? item.rol : item.telefono;
                      const key       = 'id_ajustador' in item ? item.id_ajustador : item.id_cliente;

                      return (
                        <tr key={key} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0B1E3D] shrink-0">
                                {nombre?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#0B1E3D] leading-none mb-0.5">{nombre}</p>
                                <p className="text-[11px] text-slate-400">{subtitulo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-slate-500">{detalle}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-3 py-1 rounded-full border
                              ${item.is_deleted
                                ? 'bg-red-50 text-red-500 border-red-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_deleted ? 'bg-red-400' : 'bg-emerald-400'}`} />
                              {item.is_deleted ? 'Inactivo' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center ml-auto transition-colors">
                              <MoreVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            {!loading && (
              <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {filtered.length} de {rawList.length} {viewMode}
                </span>
                <span className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">
                  {rawList.filter(i => !i.is_deleted).length} activos · {rawList.filter(i => i.is_deleted).length} inactivos
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;