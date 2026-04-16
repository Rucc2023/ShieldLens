import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle,
  User, FileText, Calendar, MapPin, Loader2,
  Fingerprint, Scale, BrainCircuit, MessageSquareQuote,
  ShieldCheck,
} from "lucide-react";

export default function DetalleCasoForense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("vista-general");
  const [caso, setCaso]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [updating, setUpdating]   = useState(false);

  const fetchDetalle = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/incidentes/detalle-forense/${id}`, {
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
    if (!window.confirm(`¿Confirmar dictamen: ${decisionKey.toUpperCase()}?`)) return;
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/incidentes/actualizar-estado/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token") || "",
        },
        body: JSON.stringify({ decision: decisionKey }),
      });
      const json = await res.json();
      if (json.success) { alert("ShieldBD sincronizada correctamente"); fetchDetalle(); }
      else alert("Error: " + json.message);
    } catch { alert("Error de conexión."); }
    finally { setUpdating(false); }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-4">
      <Loader2 size={28} className="animate-spin text-blue-400" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Sincronizando ShieldBD...</p>
    </div>
  );

  if (!caso) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <p className="text-sm font-medium text-slate-400">Expediente no localizado.</p>
    </div>
  );

  const riskScore   = Math.round((1 - (caso.score_confianza_ia || 0)) * 100);
  const isHighRisk  = riskScore > 70;
  const firstEvid   = caso.evidencias?.[0];

  const TABS = [
    { id: "vista-general",       label: "Vista General"       },
    { id: "análisis-de-imágenes", label: "Análisis de Imágenes" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ── HEADER ── */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-[#0B1E3D] text-xs font-medium transition-colors mb-5 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Volver al Panel
          </button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Expediente Forense</p>
              <h1 className="text-2xl font-bold tracking-tight text-[#0B1E3D] font-mono">
                {caso.id_reclamacion?.substring(0, 18)}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500 font-medium">Asegurado:</span>
                <span className="text-xs font-semibold text-[#0B1E3D]">{caso.nombre_cifrado}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                  ID: {caso.id_cliente?.substring(0, 8)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Risk badge */}
              <div className={`flex flex-col items-center px-6 py-3 rounded-2xl text-white
                ${isHighRisk ? 'bg-red-500' : 'bg-orange-400'}`}>
                <span className="text-[9px] font-semibold uppercase tracking-widest opacity-70">Riesgo IA</span>
                <span className="text-2xl font-bold leading-tight">{riskScore}%</span>
              </div>
              {/* Status pill */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                  {caso.estado_reclamacion}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                  {caso.estado_gestion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1.5 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all
                ${activeTab === tab.id
                  ? "bg-[#0B1E3D] text-white shadow-sm"
                  : "text-slate-400 hover:text-[#0B1E3D] hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── VISTA GENERAL ── */}
        {activeTab === "vista-general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Perfil */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <User size={13} className="text-blue-500" /> Perfil del Asegurado
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {[
                  { label: "Nombre",  value: caso.nombre_cifrado },
                  { label: "Correo",  value: caso.email_cifrado,  small: true },
                  { label: "Teléfono", value: caso.telefono || "No registrado" },
                ].map((f, i) => (
                  <div key={i} className={f.small ? "col-span-2" : ""}>
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                    <p className={`font-semibold text-[#0B1E3D] ${f.small ? "text-xs truncate" : "text-sm"}`}>{f.value}</p>
                  </div>
                ))}
                <div className="col-span-2 pt-5 border-t border-slate-100">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Monto de la Reclamación</p>
                  <p className="text-2xl font-bold text-emerald-500">${caso.monto_reclamado?.toLocaleString()} <span className="text-sm font-medium text-slate-400">MXN</span></p>
                </div>
              </div>
            </div>

            {/* Bitácora */}
            <div className="bg-white border border-slate-200 rounded-3xl p-7">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <FileText size={13} className="text-blue-500" /> Bitácora del Siniestro
              </h3>
              <div className="space-y-4">
                {[
                  { icon: Calendar, label: "Fecha del incidente", value: new Date(caso.fecha_reclamacion).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" }) },
                  { icon: MapPin,   label: "Lugar reportado",      value: caso.lugar_incidente || "Ubicación ShieldBD" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-semibold text-[#0B1E3D]">{value}</p>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Descripción del siniestro</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic">"{caso.descripcion_siniestro}"</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ANÁLISIS DE IMÁGENES ── */}
        {activeTab === "análisis-de-imágenes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: images + justification */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Images */}
              {caso.evidencias?.length > 0 && (
                <div className="flex flex-col gap-4">
                  {caso.evidencias.map((img: any, idx: number) => (
                    <div key={idx} className="rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={img.url_storage_imagen}
                        className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700"
                        alt={`Evidencia ${idx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* AI Justification */}
              <div className="bg-white border border-slate-200 rounded-3xl p-7 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 opacity-[0.03] pointer-events-none">
                  <BrainCircuit size={160} />
                </div>
                <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-5">
                  <MessageSquareQuote size={13} className="text-blue-500" /> Justificación Técnica del Modelo
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-5">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{caso.justificacion_ia || "El modelo no ha generado una justificación descriptiva para este expediente."}"
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-widest bg-[#0B1E3D] text-white px-3 py-1.5 rounded-full">
                    Gemini Pro Vision
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-widest bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full">
                    Protocolo: {caso.id_reclamacion?.substring(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: forensic panel */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#0B1E3D] rounded-3xl p-7 text-white sticky top-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Fingerprint size={18} className="text-blue-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">AutoML Analysis</p>
                </div>

                {/* Score */}
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 mb-1">Score de confianza</p>
                  <p className="text-4xl font-bold">
                    {((firstEvid?.resultado_automl_score ?? 0) * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Score bar */}
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${((firstEvid?.resultado_automl_score ?? 0) * 100).toFixed(1)}%` }}
                  />
                </div>

                {/* Manipulation badge */}
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-semibold
                  ${firstEvid?.deteccion_edicion
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}>
                  {firstEvid?.deteccion_edicion
                    ? <><AlertTriangle size={14} /> Manipulación detectada</>
                    : <><ShieldCheck size={14} /> Imagen verificada</>}
                </div>

                {/* SHA */}
                <div className="h-px bg-white/10" />
                <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/20 mb-2">SHA-256 Forense</p>
                  <p className="text-[9px] font-mono break-all text-blue-300/70 leading-relaxed">
                    {firstEvid?.hash_sha256 || "PENDIENTE_DE_HASH"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PANEL DE RESOLUCIÓN ── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Scale size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Scale size={15} className="text-slate-400" />
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Dictamen Oficial del Ajustador</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              <button
                disabled={updating}
                onClick={() => handleDecision("aprobar")}
                className="py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50
                  bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-100 hover:border-transparent"
              >
                {updating ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Aprobar Pago
              </button>

              <button
                disabled={updating}
                onClick={() => handleDecision("fraude")}
                className="py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50
                  bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-100 hover:border-transparent"
              >
                {updating ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                Confirmar Fraude
              </button>

              <button
                disabled={updating}
                onClick={() => handleDecision("escalar")}
                className="py-4 rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50
                  bg-amber-50 hover:bg-amber-400 text-amber-600 hover:text-white border border-amber-100 hover:border-transparent"
              >
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