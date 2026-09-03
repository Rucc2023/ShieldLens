import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useUser } from '../../../context/useUser';
import { useDismissableModal } from '../../components/useDismissableModal';
import PageBackground from '../../components/PageBackground';
import {
  Shield, Users, LogOut, Plus, MoreVertical,
  BarChart2, X, Search, Download,
  CheckCircle, AlertCircle, CheckCircle2, XCircle, User, ChevronRight, ChevronLeft,
  FileText, UserCheck, UserCog, ShieldCheck, Activity,
} from 'lucide-react';

/**
 * Design system for this module (documented shape/color scale — impeccable "Operate" mode +
 * taste-skill consistency locks):
 *   Radius  → rounded-3xl: panels/cards/modals · rounded-2xl: icon/avatar badges · rounded-xl: buttons/inputs/nav items · rounded-full: pills/dots/status
 *   Color   → navy: marca/selección · dorado: CTA sobre navy + valor/IA · azul: reservado a tips · emerald/red: solo estado semántico (activo/inactivo, éxito/error)
 *   Surface → glass: bg-white/85 backdrop-blur-xl border border-white/70 sobre PageBackground (Fondo3)
 *   Motion  → Tailwind utilities only (transition/duration/ease + active:scale), sin CSS nuevo
 */

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
  tipo_poliza: string;
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

const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

const timeAgo = (iso: string) => {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `hace ${diffHr}h`;
  return `hace ${Math.floor(diffHr / 24)}d`;
};

/* ─── KPI card ── */
type KpiTone = 'navy' | 'gold' | 'emerald' | 'blue';

const KPI_TONES: Record<KpiTone, { bg: string; icon: string; bar: string }> = {
  navy:    { bg: 'bg-navy/10',     icon: 'text-navy',        bar: 'bg-navy' },
  gold:    { bg: 'bg-gold-50',     icon: 'text-gold-600',    bar: 'bg-gold-400' },
  emerald: { bg: 'bg-emerald-50',  icon: 'text-emerald-500', bar: 'bg-emerald-400' },
  blue:    { bg: 'bg-blue-50',     icon: 'text-blue-500',    bar: 'bg-blue-400' },
};

const KpiCard = ({ icon: Icon, label, value, sub, fill, tone }: {
  icon: any; label: string; value: string | number; sub: string; fill: number; tone: KpiTone;
}) => {
  const t = KPI_TONES[tone];
  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{label}</p>
          <h3 className="text-3xl font-extrabold text-navy mt-1 tabular-nums">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-2xl ${t.bg} flex items-center justify-center shrink-0`}>
          <Icon size={17} className={t.icon} strokeWidth={2.25} />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500">{sub}</span>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
          <div className={`h-full rounded-full transition-[width] duration-500 ${t.bar}`} style={{ width: `${fill}%` }} />
        </div>
      </div>
    </div>
  );
};

/* ─── Donut chart ── */
const DONUT_COLORS = { Ajustadores: 'var(--color-gold-400)', Clientes: '#10b981' };

const DonutTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-navy-dark border border-white/10 rounded-2xl px-3 py-2 shadow-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">{name}</p>
      <p className="text-sm font-bold text-white tabular-nums">{value}</p>
    </div>
  );
};

const DonutChart = ({ ajustadores, clientes }: { ajustadores: number; clientes: number }) => {
  const total = ajustadores + clientes;
  const data  = [
    { name: 'Ajustadores', value: ajustadores },
    { name: 'Clientes',    value: clientes },
  ];

  if (total === 0) return (
    <div className="flex items-center justify-center w-full h-36 text-slate-300 text-xs">Sin datos</div>
  );

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
      <div className="relative shrink-0" style={{ width: 132, height: 132 }} role="img" aria-label={`${total} usuarios: ${ajustadores} ajustadores, ${clientes} clientes`}>
        <PieChart width={132} height={132}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%"
            innerRadius={44} outerRadius={60} paddingAngle={3} stroke="none"
            startAngle={90} endAngle={-270} animationDuration={600} animationEasing="ease-out">
            {data.map((entry) => <Cell key={entry.name} fill={DONUT_COLORS[entry.name as keyof typeof DONUT_COLORS]} />)}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-extrabold text-navy leading-none tabular-nums">{total}</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Usuarios</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 flex-1 w-full">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gold-50/70 border border-gold-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-500 ring-2 ring-gold-100 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Ajustadores</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-extrabold text-gold-700 tabular-nums">{ajustadores}</div>
            <div className="text-[10px] font-semibold text-slate-400">{pct(ajustadores, total)}%</div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" />
            <span className="text-xs font-bold text-slate-700">Clientes</span>
          </div>
          <div className="text-right">
            <div className="text-xs font-extrabold text-emerald-700 tabular-nums">{clientes}</div>
            <div className="text-[10px] font-semibold text-slate-400">{pct(clientes, total)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Recent activity / audit feed ── */
const RecentActivity = ({ logs }: { logs: LogForense[] }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? logs : logs.slice(0, 6);

  return (
    <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 flex-1 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-navy flex items-center gap-2">
          <Activity size={14} className="text-gold-600" /> Auditoría en Tiempo Real
        </h4>
        <p className="text-xs text-slate-400 mt-0.5 mb-4">Últimos eventos del sistema</p>
        <div className="space-y-2.5">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No hay logs registrados.</p>
          ) : (
            visible.map((log) => (
              <div key={log.id_log} className="flex items-start justify-between gap-2 p-2.5 rounded-2xl hover:bg-white/60 transition border border-transparent hover:border-white/50">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                    ${log.resultado === 'exito' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {log.resultado === 'exito' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-navy leading-snug truncate">{log.accion_realizada}</p>
                    <p className="text-[11px] text-slate-400 truncate">{log.usuario_ejecuta || 'Sistema'}</p>
                    <span className="font-mono text-[10px] text-slate-400">IP: {log.ip_origin}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400 whitespace-nowrap">{timeAgo(log.fecha_hora_utc)}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {logs.length > 6 && (
        <div className="pt-4 mt-2 border-t border-slate-100">
          <button onClick={() => setExpanded(v => !v)}
            className="w-full py-2 bg-white/60 hover:bg-white/80 text-navy text-xs font-semibold rounded-xl border border-white/50 transition text-center">
            {expanded ? 'Mostrar menos' : `Ver ${logs.length - 6} registros más`}
          </button>
        </div>
      )}
    </section>
  );
};

/* ─── Result modal ── */
const ResultModal = ({ success, message, onClose }: { success: boolean; message: string; onClose: () => void }) => {
  const { visible, dismiss, panelRef } = useDismissableModal(true, onClose);

  return (
    <div className={`fixed inset-0 bg-black/25 backdrop-blur-sm z-[70] flex items-center justify-center p-6 transition-opacity duration-200 ease-out ${visible ? "opacity-100" : "opacity-0"}`}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="admin-result-title"
        className={`bg-white/85 backdrop-blur-xl border border-white/70 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-5 transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity motion-reduce:scale-100 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border
          ${success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          {success
            ? <CheckCircle2 size={30} className="text-emerald-400" />
            : <XCircle      size={30} className="text-red-400" />}
        </div>
        <div>
          <h3 id="admin-result-title" className="text-lg font-bold text-navy">{success ? 'Operación exitosa' : 'Algo salió mal'}</h3>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
        </div>
        <button onClick={() => dismiss()}
          className="w-full py-3 bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2">
          Entendido
        </button>
      </div>
    </div>
  );
};

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

const PAGE_SIZE = 6;
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

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
  const [tablePage,       setTablePage]       = useState(0);
  const [polizaData,      setPolizaData]      = useState({ tipo_seguro: 'Deluxe' });
  const [resultModal,     setResultModal]     = useState<{ success: boolean; message: string } | null>(null);

  const [ajustadores, setAjustadores] = useState<Ajustador[]>([]);
  const [clientes,    setClientes]    = useState<Cliente[]>([]);
  const [logs,        setLogs]        = useState<LogForense[]>([]);
  const [loading,     setLoading]     = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', numero_empleado: '', email: '', telefono: '', rol: 'Analista', password: '',
  });

  const topRef          = useRef<HTMLDivElement>(null);
  const usuariosRef      = useRef<HTMLDivElement>(null);
  const searchInputRef  = useRef<HTMLInputElement>(null);

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
  useEffect(() => { setTablePage(0); }, [search, viewMode]);

  const registroModal = useDismissableModal(showModal, () => setShowModal(false));
  const polizaModal   = useDismissableModal(showPolizaModal, () => setShowPolizaModal(false));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token    = localStorage.getItem('token');
    const headers  = { 'Content-Type': 'application/json', 'x-auth-token': token || '' };
    const endpoint = viewMode === 'ajustadores' ? 'http://localhost:5000/api/auth/ajustadores' : 'http://localhost:5000/api/auth/register';
    try {
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(formData) });
      if (res.ok) {
        registroModal.dismiss();
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
        polizaModal.dismiss();
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

  const totalTablePages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedUsers  = filtered.slice(tablePage * PAGE_SIZE, tablePage * PAGE_SIZE + PAGE_SIZE);

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

  const POLICY_STYLES: Record<string, { bar: string; dot: string }> = {
    Deluxe:  { bar: 'bg-navy',        dot: 'bg-navy' },
    Amplia:  { bar: 'bg-gold-500',    dot: 'bg-gold-500' },
    Premium: { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
    Otra:    { bar: 'bg-blue-400',    dot: 'bg-blue-400' },
  };
  // ShieldBD guarda a veces el valor corto ('Deluxe') y a veces la etiqueta completa
  // ('Seguro de Auto Deluxe'), además del centinela 'Sin póliza' — se normaliza aquí
  // para que la distribución no cuente clientes sin plan como si tuvieran uno.
  const normalizePoliza = (raw?: string): string | null => {
    if (!raw || raw === 'Sin póliza') return null;
    const match = PLAN_OPTIONS.find(p => raw === p.value || raw === p.label);
    return match ? match.value : 'Otra';
  };
  const tienePoliza        = (c: Cliente) => normalizePoliza(c.tipo_poliza) !== null;
  const policyBreakdown    = PLAN_OPTIONS.map(p => ({ ...p, count: clientes.filter(c => normalizePoliza(c.tipo_poliza) === p.value).length }));
  const clientesSinPoliza  = clientes.filter(c => !tienePoliza(c)).length;
  const clientesOtraPoliza = clientes.filter(c => normalizePoliza(c.tipo_poliza) === 'Otra').length;
  const clientesConPoliza  = clientes.length - clientesSinPoliza;
  const policyDenominator  = clientes.length || 1;

  const weekActivity = WEEKDAY_LABELS.map((label, idx) => {
    const jsDay = (idx + 1) % 7; // Lun=1 ... Sáb=6, Dom=0
    return { label, count: logs.filter(l => new Date(l.fecha_hora_utc).getDay() === jsDay).length };
  });
  const maxWeekCount = Math.max(1, ...weekActivity.map(d => d.count));

  const goToTab = (tab: 'resumen' | 'usuarios') => {
    setActiveTab(tab);
    const ref = tab === 'usuarios' ? usuariosRef : topRef;
    requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const focusSearch = () => {
    goToTab('usuarios');
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  return (
    <PageBackground>
    <div className="min-h-screen font-sans text-navy">
      <div className="max-w-[1580px] mx-auto p-4 md:p-6 lg:p-8 space-y-6">

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
          <div className={`fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6 transition-opacity duration-200 ease-out ${registroModal.visible ? "opacity-100" : "opacity-0"}`}>
            <div ref={registroModal.panelRef} role="dialog" aria-modal="true" aria-labelledby="registro-modal-title"
              className={`bg-white/85 backdrop-blur-xl border border-white/70 rounded-3xl shadow-2xl w-full max-w-md p-8 overflow-y-auto max-h-[90vh] transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity motion-reduce:scale-100 ${registroModal.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <div className="flex justify-between items-start mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-navy text-white flex items-center justify-center shrink-0">
                    <User size={16} className="text-gold-400" />
                  </div>
                  <div>
                    <h2 id="registro-modal-title" className="text-base font-bold text-navy">Registrar Nuevo Usuario</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Añade un ajustador forense o un cliente asegurado</p>
                  </div>
                </div>
                <button onClick={() => registroModal.dismiss()} aria-label="Cerrar"
                  className="w-8 h-8 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
                  <X size={14} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Tipo de Usuario</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ajustadores', 'clientes'] as const).map((mode) => (
                      <label key={mode}
                        className={`flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer transition
                          ${viewMode === mode ? 'border-navy bg-navy/5' : 'border-white/60 bg-white/40 hover:bg-white/60'}`}>
                        <input type="radio" name="tipoUsuario" checked={viewMode === mode} onChange={() => setViewMode(mode)}
                          className="text-navy focus:ring-navy" />
                        <span className="text-xs font-semibold text-navy">{mode === 'ajustadores' ? 'Ajustador Forense' : 'Cliente Asegurado'}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input type="text" value={formData.nombre} required onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all" />
                  </div>
                </div>
                {viewMode === 'ajustadores' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Número de empleado</label>
                      <input type="text" placeholder="Ej. EMP-0042" onChange={(e) => setFormData({ ...formData, numero_empleado: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Rol</label>
                      <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all">
                        <option>Analista</option><option>Auditor</option><option>Administrador</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Correo electrónico</label>
                      <input type="email" placeholder="correo@ejemplo.com" onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Teléfono</label>
                      <input type="tel" placeholder="10 dígitos" onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Contraseña</label>
                  <input type="password" placeholder="••••••••" onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => registroModal.dismiss()}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-xs transition-all text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-3 bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2">Guardar Usuario</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── MODAL PÓLIZA ── */}
        {showPolizaModal && selectedCliente && (
          <div className={`fixed inset-0 bg-black/25 backdrop-blur-sm z-[60] flex items-center justify-center p-6 transition-opacity duration-200 ease-out ${polizaModal.visible ? "opacity-100" : "opacity-0"}`}>
            <div ref={polizaModal.panelRef} role="dialog" aria-modal="true" aria-labelledby="poliza-modal-title"
              className={`bg-white/85 backdrop-blur-xl border border-white/70 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity motion-reduce:scale-100 ${polizaModal.visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              <div className="bg-navy/90 backdrop-blur-xl px-7 py-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border border-white/5" />
                <button onClick={() => polizaModal.dismiss()} aria-label="Cerrar"
                  className="absolute top-4 right-4 w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                  <X size={13} className="text-white/60" />
                </button>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">ShieldLens Admin</p>
                <h3 id="poliza-modal-title" className="text-xl font-bold text-white">Vincular Póliza</h3>
              </div>
              <div className="px-7 py-6 space-y-5">
                <div className="flex items-center gap-3 bg-white/60 border border-white/60 rounded-2xl px-4 py-3">
                  <div className="w-9 h-9 rounded-2xl bg-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedCliente.nombre_cifrado?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 leading-none mb-0.5">Cliente seleccionado</p>
                    <p className="text-sm font-semibold text-navy truncate">{selectedCliente.nombre_cifrado}</p>
                  </div>
                </div>
                <form onSubmit={handleAsignarPoliza} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">Tipo de Póliza</label>
                    <div className="flex flex-col gap-2">
                      {PLAN_OPTIONS.map((plan) => (
                        <button key={plan.value} type="button" onClick={() => setPolizaData({ tipo_seguro: plan.value })}
                          className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition-all
                            ${polizaData.tipo_seguro === plan.value ? 'bg-navy border-navy' : 'bg-white/60 border-white/60 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                              ${polizaData.tipo_seguro === plan.value ? 'border-white bg-white' : 'border-slate-300'}`}>
                              {polizaData.tipo_seguro === plan.value && <div className="w-2.5 h-2.5 rounded-full bg-navy" />}
                            </div>
                            <span className={`text-sm font-semibold ${polizaData.tipo_seguro === plan.value ? 'text-white' : 'text-navy'}`}>{plan.label}</span>
                          </div>
                          <ChevronRight size={14} className={polizaData.tipo_seguro === plan.value ? 'text-white/40' : 'text-slate-300'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-gold-50 border border-gold-100 rounded-2xl p-4">
                    <FileText size={14} className="text-gold-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gold-700 leading-relaxed">Al confirmar, se generará el número de póliza y se notificará al cliente.</p>
                  </div>
                  <button type="submit"
                    className="w-full py-3.5 bg-navy hover:bg-navy-dark text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Shield size={15} /> Confirmar Póliza
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── TOP NAV ── */}
        <header ref={topRef} className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-navy flex items-center justify-center shrink-0 shadow-sm ring-4 ring-white/30">
              <ShieldCheck size={18} className="text-gold-400" strokeWidth={2.25} />
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
              <span className="text-sm font-semibold text-navy">ShieldLens</span>
            </div>
          </div>

          <nav className="bg-white/70 backdrop-blur-xl p-1.5 rounded-full border border-white/60 flex items-center gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => goToTab(id)}
                className={`px-5 py-1.5 text-xs md:text-sm font-semibold rounded-full transition duration-150 flex items-center gap-1.5
                  ${activeTab === id ? 'bg-navy text-white shadow-sm' : 'text-navy/50 hover:text-navy hover:bg-white/60'}`}>
                <Icon size={13} className={activeTab === id ? 'text-gold-400' : ''} /> {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button onClick={() => setShowModal(true)}
              className="bg-navy hover:bg-navy-dark text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 transition active:scale-95">
              <Plus size={15} className="text-gold-400" /> Nuevo Usuario
            </button>
            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-xl p-1 rounded-2xl border border-white/60">
              <button onClick={focusSearch} aria-label="Buscar usuarios" title="Buscar usuarios"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-navy/50 hover:bg-white/70 hover:text-navy transition">
                <Search size={15} />
              </button>
              <div className="w-8 h-8 rounded-xl bg-navy text-white flex items-center justify-center text-xs font-bold" title={userName || 'Administrador'}>
                {initials}
              </div>
              <button onClick={() => navigate('/')} aria-label="Cerrar sesión" title="Cerrar sesión"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-navy/50 hover:bg-red-50 hover:text-red-500 transition">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* ── GREETING ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pt-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight">Buen día, {userName?.split(' ')[0] || 'Administrador'}</h1>
            <p className="text-sm md:text-base text-navy/50 mt-0.5">Actividades y estado operativo del sistema.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-navy/50">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/70 backdrop-blur-xl rounded-lg border border-white/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Sesión segura
            </span>
            <span className="text-navy/20">|</span>
            <span className="font-semibold text-navy/60 uppercase tracking-wide text-[11px]">{userRole || 'Administrador'}</span>
          </div>
        </div>

        {/* ── TOP KPI GRID ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Total Usuarios" value={loading ? '—' : totalUsuarios}
            sub={loading ? 'Cargando...' : `${ajActivos + cliActivos} activos de ${totalUsuarios}`}
            fill={pct(ajActivos + cliActivos, totalUsuarios)} tone="navy" />
          <KpiCard icon={UserCog} label="Ajustadores" value={loading ? '—' : ajustadores.length}
            sub={loading ? 'Cargando...' : `${pct(ajustadores.length, totalUsuarios)}% del total`}
            fill={pct(ajustadores.length, totalUsuarios)} tone="gold" />
          <KpiCard icon={UserCheck} label="Clientes Asegurados" value={loading ? '—' : clientes.length}
            sub={loading ? 'Cargando...' : `${pct(clientes.length, totalUsuarios)}% del total`}
            fill={pct(clientes.length, totalUsuarios)} tone="emerald" />
          <KpiCard icon={FileText} label="Registros Forenses" value={loading ? '—' : logs.length}
            sub={loading ? 'Cargando...' : `${logs.filter(l => l.resultado === 'exito').length} exitosos`}
            fill={pct(logs.filter(l => l.resultado === 'exito').length, logs.length || 1)} tone="blue" />
        </section>

        {/* ── BENTO GRID ── */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Columna izquierda */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Gestión de usuarios */}
            <section ref={usuariosRef} className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 scroll-mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex bg-slate-100 p-1 rounded-2xl items-center gap-1 border border-slate-200/60 shrink-0">
                  {(['ajustadores', 'clientes'] as const).map((mode) => (
                    <button key={mode} onClick={() => { setViewMode(mode); setSearch(''); }}
                      aria-pressed={viewMode === mode}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30
                        ${viewMode === mode ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-navy'}`}>
                      {mode} <span className="opacity-50">({mode === 'ajustadores' ? ajustadores.length : clientes.length})</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input ref={searchInputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre..."
                      className="pl-9 pr-4 py-2.5 bg-white/60 border border-white/60 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-navy/10 transition-all placeholder:text-slate-400 w-56 md:w-64" />
                  </div>
                  <button onClick={() => exportCSV(rawList, viewMode)} title="Exportar reporte CSV"
                    className="p-2.5 bg-white/55 hover:bg-white/75 border border-slate-200 text-slate-600 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
                    <Download size={15} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar mt-4">
                <table key={viewMode} className="w-full text-left border-collapse animate-panel-in">
                  <thead>
                    <tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="pb-3 px-3">Usuario / Contacto</th>
                      <th className="pb-3 px-3">{viewMode === 'ajustadores' ? 'Rol' : 'Tipo'}</th>
                      {viewMode === 'clientes' && <th className="pb-3 px-3">Póliza</th>}
                      <th className="pb-3 px-3">Estado</th>
                      {viewMode === 'clientes' && <th className="pb-3 px-3 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                              <div className="h-3 w-32 rounded-full bg-slate-100 animate-pulse" />
                            </div>
                          </td>
                          <td className="py-3 px-3"><div className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" /></td>
                          {viewMode === 'clientes' && <td className="py-3 px-3"><div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" /></td>}
                          <td className="py-3 px-3"><div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" /></td>
                          {viewMode === 'clientes' && <td className="py-3 px-3 text-right"><div className="h-6 w-28 rounded-full bg-slate-100 animate-pulse ml-auto" /></td>}
                        </tr>
                      ))
                    ) : paginatedUsers.length === 0 ? (
                      <tr><td colSpan={viewMode === 'clientes' ? 5 : 3} className="text-center py-12 text-xs text-slate-400 font-medium">{search ? `Sin resultados para "${search}"` : 'No hay registros.'}</td></tr>
                    ) : (
                      paginatedUsers.map((item) => {
                        const nombre = 'nombre' in item ? item.nombre : item.nombre_cifrado;
                        const isCliente = 'nombre_cifrado' in item;
                        const contacto = isCliente ? (item as Cliente).email_cifrado : (item as Ajustador).numero_empleado;
                        return (
                          <tr key={`${viewMode}-${'id_cliente' in item ? item.id_cliente : item.id_ajustador}`}
                            className="group hover:bg-white/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0
                                  ${isCliente ? 'bg-slate-100 border border-slate-200 text-navy' : 'bg-navy text-gold-300'}`}>
                                  {nombre?.[0]?.toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-navy truncate">{nombre}</div>
                                  <div className="text-xs text-slate-400 font-mono truncate">{contacto || '—'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {isCliente ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">Cliente Asegurado</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">{(item as Ajustador).rol}</span>
                              )}
                            </td>
                            {viewMode === 'clientes' && (
                              <td className="py-3 px-3">
                                {item && 'tipo_poliza' in item && tienePoliza(item as Cliente) ? (
                                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-50 text-gold-800 border border-gold-200/60">{item.tipo_poliza}</span>
                                ) : (
                                  <span className="text-xs font-medium text-slate-400 italic">Pendiente asignar</span>
                                )}
                              </td>
                            )}
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                                ${item.is_deleted ? 'text-red-700 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${item.is_deleted ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                {item.is_deleted ? 'Inactivo' : 'Activo'}
                              </span>
                            </td>
                            {viewMode === 'clientes' && (
                              <td className="py-3 px-3 text-right">
                                <button onClick={() => { setSelectedCliente(item as Cliente); setShowPolizaModal(true); }}
                                  className="text-xs font-semibold text-slate-700 hover:text-navy hover:underline mr-2">
                                  {tienePoliza(item as Cliente) ? 'Vincular' : 'Asignar Ahora'}
                                </button>
                                <button aria-label="Más opciones" className="text-slate-400 hover:text-slate-600 inline-flex">
                                  <MoreVertical size={14} />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    Mostrando <b className="text-navy font-semibold">{paginatedUsers.length}</b> de <b className="text-navy font-semibold">{filtered.length}</b> {viewMode}
                    {' · '}{rawList.filter(i => !i.is_deleted).length} activos
                  </span>
                  {totalTablePages > 1 && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setTablePage(p => Math.max(0, p - 1))} disabled={tablePage === 0}
                        className="px-2.5 py-1 rounded-lg border border-white/60 bg-white/60 text-navy hover:bg-white/80 disabled:opacity-40 transition">
                        <ChevronLeft size={13} />
                      </button>
                      {Array.from({ length: totalTablePages }).map((_, i) => (
                        <button key={i} onClick={() => setTablePage(i)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${i === tablePage ? 'bg-navy text-white' : 'border border-white/60 bg-white/60 text-navy hover:bg-white/80'}`}>
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => setTablePage(p => Math.min(totalTablePages - 1, p + 1))} disabled={tablePage === totalTablePages - 1}
                        className="px-2.5 py-1 rounded-lg border border-white/60 bg-white/60 text-navy hover:bg-white/80 disabled:opacity-40 transition">
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Distribución + actividad semanal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h4 className="text-sm font-bold text-navy flex items-center gap-2"><Users size={14} className="text-gold-600" /> Distribución de Usuarios</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Ajustadores vs. Clientes Asegurados</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center py-3">
                  <DonutChart ajustadores={ajustadores.length} clientes={clientes.length} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-slate-100 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-400 font-medium">Activos</span>
                    <span className="font-bold text-navy text-sm mt-0.5 tabular-nums">{pct(ajActivos + cliActivos, totalUsuarios)}%</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] text-slate-400 font-medium">Inactivos</span>
                    <span className="font-bold text-navy text-sm mt-0.5 tabular-nums">{totalUsuarios - (ajActivos + cliActivos)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-navy flex items-center gap-2"><BarChart2 size={14} className="text-gold-600" /> Actividad Forense</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Registros por día de la semana</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl uppercase tracking-widest">{logs.length} eventos</span>
                </div>
                <div className="flex-1 flex items-end justify-between gap-2 h-36 border-b border-slate-100 pb-2">
                  {weekActivity.map((d) => {
                    const isMax = d.count === maxWeekCount && d.count > 0;
                    const barPx = 10 + (d.count / maxWeekCount) * 96;
                    return (
                      <div key={d.label} className="flex flex-col items-center gap-1.5 flex-1" title={`${d.count} eventos`}>
                        <div className={`w-full max-w-[26px] rounded-lg transition-all duration-300 ${isMax ? 'bg-gold-500' : 'bg-navy/15'}`} style={{ height: `${barPx}px` }} />
                        <span className={`text-[10px] font-semibold ${isMax ? 'text-gold-600' : 'text-slate-400'}`}>{d.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
                  <span>Promedio diario: <b className="text-navy">{Math.round(logs.length / 7)} registros</b></span>
                  <span className="text-slate-400 text-[11px]">{logs.length} eventos capturados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Distribución de pólizas */}
            <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-navy flex items-center gap-2"><Shield size={14} className="text-gold-600" /> Distribución de Pólizas</h4>
                <span className="text-xs font-semibold text-slate-400">{clientes.length} clientes</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/60 border border-white/50 mb-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-medium text-slate-400">Pólizas asignadas</span>
                    <div className="text-2xl font-extrabold text-navy mt-0.5 tabular-nums">{clientesConPoliza} <span className="text-sm font-normal text-slate-500">de {clientes.length}</span></div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">{pct(clientesConPoliza, policyDenominator)}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex mb-4">
                {policyBreakdown.map(p => (
                  <div key={p.value} className={`h-full ${POLICY_STYLES[p.value].bar}`} style={{ width: `${(p.count / policyDenominator) * 100}%` }} title={`${p.label}: ${p.count}`} />
                ))}
                {clientesOtraPoliza > 0 && (
                  <div className={`h-full ${POLICY_STYLES.Otra.bar}`} style={{ width: `${(clientesOtraPoliza / policyDenominator) * 100}%` }} title={`Otra póliza: ${clientesOtraPoliza}`} />
                )}
                <div className="bg-slate-300 h-full" style={{ width: `${(clientesSinPoliza / policyDenominator) * 100}%` }} title={`Sin asignar: ${clientesSinPoliza}`} />
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {policyBreakdown.map(p => (
                  <div key={p.value} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${POLICY_STYLES[p.value].dot}`} />
                    <span className="text-slate-600 truncate">{p.value} <b className="text-navy">({p.count})</b></span>
                  </div>
                ))}
                {clientesOtraPoliza > 0 && (
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${POLICY_STYLES.Otra.dot}`} />
                    <span className="text-slate-600 truncate">Otra póliza <b className="text-navy">({clientesOtraPoliza})</b></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-slate-600 truncate">Sin asignar <b className="text-navy">({clientesSinPoliza})</b></span>
                </div>
              </div>
            </section>

            {/* Auditoría en tiempo real */}
            <RecentActivity logs={logs} />
          </div>
        </main>
      </div>
    </div>
    </PageBackground>
  );
};

export default AdminPanel;
