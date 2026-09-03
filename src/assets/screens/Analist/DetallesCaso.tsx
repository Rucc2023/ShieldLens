import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle,
  User, FileText, Calendar, MapPin, Loader2,
  Fingerprint, Scale, BrainCircuit, MessageSquareQuote,
  ShieldCheck, ShieldAlert, X,
} from "lucide-react";

const FONT = "'Inter', ui-sans-serif, system-ui, sans-serif";

/* ─── Confirm modal ── */
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  icon: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ title, message, confirmLabel, confirmClass, icon, onConfirm, onCancel }: ConfirmModalProps) => (
  <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6">
    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
      <div className="bg-[#0B1E3D] px-7 py-6 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full border border-white/5" />
        <button onClick={onCancel} className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X size={13} className="text-white/60" />
        </button>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">ShieldLens · Dictamen</p>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="px-7 py-6 space-y-5">
        <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="shrink-0 mt-0.5">{icon}</div>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl text-xs transition-all text-slate-600">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-3 font-semibold rounded-xl text-xs text-white transition-all active:scale-[0.98] ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Result modal ── */
interface ResultModalProps {
  success: boolean;
  message: string;
  onClose: () => void;
}

const ResultModal = ({ success, message, onClose }: ResultModalProps) => (
  <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-6">
    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center space-y-5">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto
        ${success ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
        {success
          ? <CheckCircle2 size={30} className="text-emerald-400" />
          : <XCircle     size={30} className="text-red-400" />}
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#0B1E3D]">{success ? '¡Dictamen aplicado!' : 'Error al procesar'}</h3>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
      </div>
      <button onClick={onClose}
        className="w-full py-3 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl text-xs transition-all active:scale-[0.98]">
        Entendido
      </button>
    </div>
  </div>
);

/* ─── Decision configs ── */
const DECISION_CONFIG: Record<string, {
  title: string; message: string; confirmLabel: string; confirmClass: string; icon: React.ReactNode;
}> = {
  aprobar: {
    title: 'Aprobar Caso',
    message: 'Al confirmar, el caso será marcado como aprobado. Esta acción quedará registrada en la bitácora.',
    confirmLabel: 'Sí, aprobar',
    confirmClass: 'bg-emerald-500 hover:bg-emerald-600',
    icon: <CheckCircle2 size={18} className="text-emerald-500" />,
  },
  fraude: {
    title: 'Confirmar Fraude',
    message: 'Al confirmar, el caso será marcado como fraude detectado. Se generará un reporte y se suspenderá la póliza del asegurado.',
    confirmLabel: 'Sí, confirmar fraude',
    confirmClass: 'bg-red-500 hover:bg-red-600',
    icon: <AlertTriangle size={18} className="text-red-500" />,
  },
  escalar: {
    title: 'Escalar Caso',
    message: 'El caso será enviado a revisión por un experto. Recibirás una notificación cuando se emita el dictamen final.',
    confirmLabel: 'Sí, escalar',
    confirmClass: 'bg-amber-400 hover:bg-amber-500',
    icon: <AlertTriangle size={18} className="text-amber-500" />,
  },
};

export default function DetalleCasoForense() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [activeTab,  setActiveTab]  = useState("vista-general");
  const [caso,       setCaso]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);

  /* Modal state */
  const [confirmKey,   setConfirmKey]   = useState<string | null>(null);
  const [resultModal,  setResultModal]  = useState<{ success: boolean; message: string } | null>(null);

  // Load the display typeface once (kept consistent with the rest of the app).
  useEffect(() => {
    if (!document.getElementById('font-inter')) {
      const link = document.createElement('link');
      link.id = 'font-inter';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const fetchDetalle = async () => {
    try {
      const res  = await fetch(`http://localhost:5000/api/incidentes/detalle-forense/${id}`, {
        headers: { "x-auth-token": localStorage.getItem("token") || "" },
      });
      const json = await res.json();
      if (json.success) setCaso(json.data);
    } catch (error) {
      console.error("Error API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchDetalle(); }, [id]);

  const handleDecision = async (decisionKey: string) => {
    setConfirmKey(null);
    setUpdating(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/incidentes/actualizar-estado/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-auth-token": localStorage.getItem("token") || "" },
        body: JSON.stringify({ decision: decisionKey }),
      });
      const json = await res.json();
      if (json.success) {
        setResultModal({ success: true,  message: "El dictamen fue registrado correctamente en ShieldBD y la bitácora fue actualizada." });
        fetchDetalle();
      } else {
        setResultModal({ success: false, message: json.message || "Ocurrió un error al procesar el dictamen." });
      }
    } catch {
      setResultModal({ success: false, message: "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente." });
    } finally {
      setUpdating(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F6F8] gap-4" style={{ fontFamily: FONT }}>
      <Loader2 size={28} className="animate-spin text-orange-400" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Sincronizando ShieldBD...</p>
    </div>
  );

  if (!caso) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F8]" style={{ fontFamily: FONT }}>
      <p className="text-sm font-medium text-slate-400">Expediente no localizado.</p>
    </div>
  );

  const riskScore  = Math.round((1 - (caso.score_confianza_ia || 0)) * 100);
  const isHighRisk = riskScore > 70;
  const firstEvid  = caso.evidencias?.[0];
  const automlPct  = ((firstEvid?.resultado_automl_score ?? 0) * 100);

  const TABS = [
    { id: "vista-general",        label: "Vista General",        icon: User },
    { id: "análisis-de-imágenes", label: "Análisis de Imágenes", icon: BrainCircuit },
  ];

  const confirmConfig = confirmKey ? DECISION_CONFIG[confirmKey] : null;

  return (
    <div className="min-h-screen bg-[#F6F6F8] text-[#0B1E3D]" style={{ fontFamily: FONT }}>

      {/* ── CONFIRM MODAL ── */}
      {confirmConfig && (
        <ConfirmModal
          {...confirmConfig}
          onCancel={() => setConfirmKey(null)}
          onConfirm={() => handleDecision(confirmKey!)}
        />
      )}

      {/* ── RESULT MODAL ── */}
      {resultModal && (
        <ResultModal
          success={resultModal.success}
          message={resultModal.message}
          onClose={() => setResultModal(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ── HEADER ── */}
        <div>
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-500 text-slate-500 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all mb-6 group">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver al Panel
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Expediente Forense</p>
              <h1 className="text-[1.7rem] font-extrabold tracking-tight text-[#0B1E3D] font-mono">
                {caso.id_reclamacion?.substring(0, 18)}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-500 font-medium">Asegurado:</span>
                <span className="text-xs font-bold text-[#0B1E3D]">{caso.nombre_cifrado}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
                  ID: {caso.id_cliente?.substring(0, 8)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl text-white ${isHighRisk ? 'bg-red-500' : 'bg-amber-400'}`}>
                {isHighRisk
                  ? <ShieldAlert size={22} className="text-white/70" strokeWidth={2.25} />
                  : <ShieldCheck size={22} className="text-white/70" strokeWidth={2.25} />}
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-widest opacity-80">Riesgo IA</span>
                  <span className="block text-2xl font-extrabold leading-tight tabular-nums">{riskScore}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center whitespace-nowrap">{caso.estado_reclamacion}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center whitespace-nowrap">{caso.estado_gestion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                  ${activeTab === tab.id ? "bg-[#0B1E3D] text-white shadow-sm" : "text-slate-400 hover:text-[#0B1E3D] hover:bg-white"}`}>
                <Icon size={13} className={activeTab === tab.id ? "text-orange-400" : "text-slate-300"} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── VISTA GENERAL ── */}
        {activeTab === "vista-general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-[28px] p-7">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <User size={13} className="text-orange-500" /> Perfil del Asegurado
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {[
                  { label: "Nombre",   value: caso.nombre_cifrado },
                  { label: "Correo",   value: caso.email_cifrado,  small: true },
                  { label: "Teléfono", value: caso.telefono || "No registrado" },
                ].map((f, i) => (
                  <div key={i} className={f.small ? "col-span-2" : ""}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                    <p className={`font-bold text-[#0B1E3D] ${f.small ? "text-xs truncate" : "text-sm"}`}>{f.value}</p>
                  </div>
                ))}
                <div className="col-span-2 pt-5 border-t border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monto de la Reclamación</p>
                  <p className="text-3xl font-extrabold text-emerald-500 tabular-nums">${caso.monto_reclamado?.toLocaleString()} <span className="text-sm font-semibold text-slate-400">MXN</span></p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[28px] p-7">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <FileText size={13} className="text-orange-500" /> Bitácora del Siniestro
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Calendar, label: "Fecha del incidente", value: new Date(caso.fecha_reclamacion).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) },
                  { icon: MapPin,   label: "Lugar reportado",     value: caso.lugar_incidente || "Ubicación ShieldBD" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-bold text-[#0B1E3D]">{value}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Descripción del siniestro</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{caso.descripcion_siniestro}"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANÁLISIS DE IMÁGENES ── */}
        {activeTab === "análisis-de-imágenes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {caso.evidencias?.length > 0 && (
                <div className="flex flex-col gap-4">
                  {caso.evidencias.map((img: any, idx: number) => (
                    <div key={idx} className="rounded-[28px] overflow-hidden border-4 border-white shadow-lg">
                      <img src={img.url_storage_imagen} className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700" alt={`Evidencia ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-white border border-slate-200 rounded-[28px] p-7 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none"><BrainCircuit size={160} /></div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-5">
                  <MessageSquareQuote size={13} className="text-orange-500" /> Justificación Técnica del Modelo
                </h3>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-5">
                  <p className="text-sm text-slate-600 leading-relaxed italic">"{caso.justificacion_ia || "El modelo no ha generado una justificación descriptiva para este expediente."}"</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-[#0B1E3D] text-white px-3 py-1.5 rounded-full">Gemini Pro Vision</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full">Protocolo: {caso.id_reclamacion?.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[#0B1E3D] rounded-[28px] p-7 text-white sticky top-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Fingerprint size={18} className="text-orange-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">AutoML Analysis</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-1">Score de confianza</p>
                  <p className="text-4xl font-extrabold tabular-nums">{automlPct.toFixed(1)}%</p>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full transition-all duration-700" style={{ width: `${automlPct}%` }} />
                </div>
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-bold
                  ${firstEvid?.deteccion_edicion ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                  {firstEvid?.deteccion_edicion ? <><AlertTriangle size={14} /> Manipulación detectada</> : <><ShieldCheck size={14} /> Imagen verificada</>}
                </div>
                <div className="h-px bg-white/10" />
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-2">SHA-256 Forense</p>
                  <p className="text-[9px] font-mono break-all text-orange-300/70 leading-relaxed">{firstEvid?.hash_sha256 || "PENDIENTE_DE_HASH"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL DE RESOLUCIÓN ── */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><Scale size={120} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Scale size={15} className="text-slate-400" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dictamen Oficial del Ajustador</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button disabled={updating} onClick={() => setConfirmKey("aprobar")}
                className="py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-100 hover:border-transparent">
                {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Aprobar Caso
              </button>
              <button disabled={updating} onClick={() => setConfirmKey("fraude")}
                className="py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-transparent">
                {updating ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                Confirmar Fraude
              </button>
              <button disabled={updating} onClick={() => setConfirmKey("escalar")}
                className="py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 bg-amber-50 hover:bg-amber-400 text-amber-600 hover:text-white border border-amber-100 hover:border-transparent">
                <AlertTriangle size={15} />
                Escalar Caso
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}