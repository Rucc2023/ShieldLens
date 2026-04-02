import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, LogOut, Plus, MoreVertical,
  BarChart2, X, ChevronDown
} from 'lucide-react';

/* ─── Interfaces ────────────────────────────────────────────────── */

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

/* ─── Componentes del Dashboard ─────────────────────────────────── */

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

const RecentActivity = ({ logs }: { logs: LogForense[] }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-sm">
      <h2 className="text-sm font-bold text-[#0B1E3D] mb-6">Auditoría Forense Reciente</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No hay logs registrados.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id_log} className="flex gap-3 items-start border-b border-slate-50 pb-3 last:border-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                log.resultado === 'exito' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
              }`}>
                {log.resultado === 'exito' ? <Shield size={13} /> : <X size={13} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0B1E3D]">{log.accion_realizada}</p>
                <p className="text-[10px] text-slate-400 truncate">
                  ID: {log.usuario_ejecuta || 'Sistema'} • IP: {log.ip_origin}
                </p>
              </div>
              <span className="text-[10px] text-slate-300 whitespace-nowrap">
                {new Date(log.fecha_hora_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ─── Main Panel ────────────────────────────────────────────────── */

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const [viewMode, setViewMode] = useState<'ajustadores' | 'clientes'>('ajustadores');
  const [showModal, setShowModal] = useState(false);
  
  const [ajustadores, setAjustadores] = useState<Ajustador[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const [logs, setLogs] = useState<LogForense[]>([]);

  const [formData, setFormData] = useState({ 
    nombre: '', 
    numero_empleado: '', 
    rol: 'Analista',
    password: '' // Nuevo campo
});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resAju, resCli, resLogs] = await Promise.all([
        fetch('http://localhost:5000/api/auth/ajustadores'),
        fetch('http://localhost:5000/api/auth/clientes'),
        fetch('http://localhost:5000/api/auth/logs') 
      ]);
      if (resAju.ok) setAjustadores(await resAju.json());
      if (resCli.ok) setClientes(await resCli.json());
      if (resLogs.ok) {
      const data = await resLogs.json();
      // Ordenamos para ver los más recientes primero (basado en fecha_hora_utc)
      setLogs(data.slice(0, 50)); 
    }
  } catch (err) {
      console.error("Error ShieldLens:", err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/ajustadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowModal(false);
        setFormData({ nombre: '', numero_empleado: '', rol: '', password: '' });
        fetchData();
      }
    } catch { 
        alert("No se pudo conectar con el servidor en el puerto 5000"); // Error capturado en imagen
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] flex flex-col lg:flex-row relative">
      
      {/* MODAL FORMULARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0B1E3D]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Nuevo Ajustador</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
    {/* Campos anteriores: nombre y número de empleado */}
    {/* Campo: Nombre Completo */}
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Nombre Completo
        </label>
        <input 
            type="text" 
            value={formData.nombre} 
            onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder="Ej. Luis P"
            required 
        />
    </div>

    {/* Campo: Número de Empleado */}
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Número de Empleado
        </label>
        <input 
            type="text" 
            value={formData.numero_empleado} 
            onChange={(e) => setFormData({...formData, numero_empleado: e.target.value})} 
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder="Aj-2026-02"
            required 
        />
    </div>
    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Contraseña de Acceso
        </label>
        <input 
            type="password" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder="Mínimo 8 caracteres"
            required 
        />
    </div>

    <div>
        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Rol de Usuario</label>
        <div className="relative">
            <select 
                value={formData.rol} 
                onChange={(e) => setFormData({...formData, rol: e.target.value})} 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm appearance-none cursor-pointer outline-none"
            >
                <option value="Analista">Analista</option>
                <option value="Auditor">Auditor</option>
                <option value="Administrador">Administrador</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40"/>
        </div>
    </div>

    <div className="pt-4 flex gap-3">
        <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 font-bold rounded-2xl text-xs uppercase text-slate-600">
            Cancelar
        </button>
        <button type="submit" className="flex-1 py-3 bg-[#0B1E3D] text-white font-bold rounded-2xl text-xs uppercase shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
            Guardar Ajustador
        </button>
    </div>
</form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-[#0B1E3D] lg:min-h-screen p-8 flex flex-col gap-8 text-white">
        <div className="flex items-center gap-2.5">
          <Shield size={18} /> <span className="font-bold text-base tracking-tight">ShieldLens</span>
        </div>

        {/* PERFIL DE USUARIO RESTAURADO */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-xs shrink-0">AM</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">Ana Martínez</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Admin Root</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('resumen')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'resumen' ? 'bg-white text-[#0B1E3D]' : 'text-white/40 hover:bg-white/5'}`}>
            <BarChart2 size={14} /> Resumen
          </button>
          <button onClick={() => setActiveTab('usuarios')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${activeTab === 'usuarios' ? 'bg-white text-[#0B1E3D]' : 'text-white/40 hover:bg-white/5'}`}>
            <Users size={14} /> Usuarios
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="mt-auto flex items-center gap-2 text-white/25 text-xs font-semibold hover:text-red-400 transition-colors">
          <LogOut size={14} /> Salir
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 lg:p-10 flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B1E3D]">
          {activeTab === 'resumen' ? 'Dashboard' : 'Gestión de Usuarios'}
        </h1>

        {activeTab === 'resumen' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Usuarios Activos" value={String(ajustadores.length + clientes.length)} sub="+12% mensual" accent="bg-blue-500" />
              <MetricCard label="Casos Cifrados" value="1,243" sub="Protección Azure" accent="bg-emerald-500" />
            </div>
            <RecentActivity logs={logs} />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-4xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('ajustadores')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'ajustadores' ? 'bg-white shadow-sm text-[#0B1E3D]' : 'text-slate-400'}`}>Ajustadores</button>
                <button onClick={() => setViewMode('clientes')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${viewMode === 'clientes' ? 'bg-white shadow-sm text-[#0B1E3D]' : 'text-slate-400'}`}>Clientes</button>
              </div>
              <button onClick={() => setShowModal(true)} className="bg-[#0B1E3D] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/10">
                <Plus size={14} /> Nuevo
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-4">Usuario</th>
                    <th className="px-4 py-4">{viewMode === 'ajustadores' ? 'Rol' : 'Teléfono'}</th>
                    <th className="px-4 py-4">Estado</th>
                    <th className="px-8 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="text-center py-10 text-xs text-slate-400">Conectando a Azure SQL Server...</td></tr>
                  ) : (
                    /* SOLUCIÓN SENCILLA AL ANY USANDO UNIÓN DE TIPOS DIRECTA */
                    (viewMode === 'ajustadores' ? ajustadores : clientes).map((item: Ajustador | Cliente) => {
                      // Helper para extraer campos comunes dinámicamente
                      const nombre = 'nombre' in item ? item.nombre : item.nombre_cifrado;
                      const subtitulo = 'numero_empleado' in item ? `ID: ${item.numero_empleado}` : item.email_cifrado;
                      const detalle = 'rol' in item ? item.rol : item.telefono;

                      return (
                        <tr key={'id_ajustador' in item ? item.id_ajustador : item.id_cliente} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0B1E3D]">
                                {nombre?.[0].toUpperCase()}
                              </div>
                              {/* INFORMACIÓN DEL USUARIO RESTAURADA */}
                              <div>
                                <p className="text-sm font-bold text-[#0B1E3D] leading-none mb-1">{nombre}</p>
                                <p className="text-[11px] text-slate-400">{subtitulo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-slate-500">{detalle}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-3 py-1 rounded-full border ${item.is_deleted ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                              {item.is_deleted ? 'Inactivo' : 'Activo'}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            <MoreVertical size={14} className="text-slate-300 cursor-pointer hover:text-slate-600 ml-auto transition-colors" />
                          </td>
                        </tr>
                      );
                    })
                  )}
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