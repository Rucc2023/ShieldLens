import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  FileText,
  Calendar,
  MapPin,
  Loader2,
  ShieldCheck,
  Fingerprint,
  Image as ImageIcon,
  Scale,
} from "lucide-react";

export default function DetalleCasoForense() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados de la interfaz
  const [activeTab, setActiveTab] = useState("vista-general");
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Carga de datos desde el backend
  const fetchDetalle = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/incidentes/detalle-forense/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') || '' }
      });
      const json = await res.json();
      if (json.success) {
        setCaso(json.data);
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetalle();
  }, [id]);

  // Función para actualizar estados respetando los Constraints de la BD
  const handleDecision = async (decisionKey: string) => {
    const confirmacion = window.confirm(`¿Confirmar acción de dictamen: ${decisionKey.toUpperCase()}?`);
    if (!confirmacion) return;

    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/incidentes/actualizar-estado/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token') || '' 
        },
        body: JSON.stringify({ decision: decisionKey }) 
      });

      const json = await res.json();
      if (json.success) {
        alert("ShieldBD Sincronizada Correctamente");
        fetchDetalle(); // Refrescar datos
      } else {
        alert("ALERTA DE SISTEMA: " + json.message);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
      <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic">Accediendo a ShieldBD...</p>
    </div>
  );

  if (!caso) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
        <XCircle className="text-red-400 mb-4" size={48} />
        <p className="p-10 text-center font-bold font-sans text-slate-600">Expediente no localizado en el sistema forense.</p>
        <button onClick={() => navigate(-1)} className="text-blue-500 font-bold underline">Regresar</button>
    </div>
  );

  const riskScore = Math.round((1 - (caso.score_confianza_ia || 0)) * 100);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1A202C] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER SUPERIOR --- */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-black text-sm mb-4 transition-colors font-bold"
            >
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-3xl font-black mb-1 italic tracking-tight text-[#0B1E3D] uppercase">
                {caso.id_reclamacion?.substring(0,18) || "SIN ID"}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
               Asegurado: <span className="text-slate-800 font-bold">{caso.nombre_cifrado || "No disponible"}</span> • 
               <span className="ml-2 text-blue-500 font-bold tracking-widest">ID: {caso.id_cliente?.substring(0,8) || "N/A"}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <div className={`${riskScore > 70 ? 'bg-[#E53E3E]' : 'bg-orange-500'} text-white px-6 py-2 rounded-xl font-black shadow-lg shadow-red-500/10`}>
              RIESGO IA: {riskScore}%
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              ESTADO ACTUAL: {caso.estado_reclamacion || "PENDIENTE"}
            </span>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-2 mb-8 p-1.5 bg-slate-200/50 w-fit rounded-2xl border border-slate-200">
          {[
            { id: "vista-general", label: "Vista General" },
            { id: "análisis-de-imágenes", label: "Análisis de Imágenes" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all
                ${activeTab === tab.id ? "bg-[#0B1E3D] text-white shadow-lg" : "text-slate-500 hover:bg-white/40"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- CONTENIDO: VISTA GENERAL --- */}
        {activeTab === "vista-general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-blue-500 uppercase mb-8 flex items-center gap-2 border-b pb-4 tracking-[0.15em]">
                <User size={16} /> Perfil del Asegurado
              </h3>
              <div className="grid grid-cols-2 gap-y-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre</p>
                  <p className="font-bold text-slate-700">{caso.nombre_cifrado || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p>
                  <p className="font-bold text-xs truncate text-slate-600">{caso.email_cifrado || "---"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Teléfono</p>
                  <p className="font-bold text-slate-700">{caso.telefono || '961 166 8107'}</p>
                </div>
                <div className="col-span-2 pt-4 border-t border-slate-50">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Monto de Reclamación</p>
                   <p className="font-black text-2xl text-emerald-600">
                     ${caso.monto_reclamado?.toLocaleString() || "0.00"} MXN
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-blue-500 uppercase mb-8 flex items-center gap-2 border-b pb-4 tracking-[0.15em]">
                <FileText size={16} /> Bitácora Incidente
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-50 rounded-2xl"><Calendar size={18} className="text-slate-400" /></div>
                   <p className="text-sm font-bold text-slate-700">
                     {caso.fecha_reclamacion ? new Date(caso.fecha_reclamacion).toLocaleDateString() : "---"}
                   </p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-50 rounded-2xl"><MapPin size={18} className="text-slate-400" /></div>
                   <p className="text-sm font-bold text-slate-700">{caso.lugar_incidente || 'Chiapas, MX'}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                   <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                     "{caso.descripcion_siniestro || 'Sin descripción detallada disponible.'}"
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CONTENIDO: ANÁLISIS DE IMÁGENES --- */}
        {activeTab === "análisis-de-imágenes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 space-y-4">
               {caso.evidencias && caso.evidencias.length > 0 ? (
                  caso.evidencias.map((img: any, idx: number) => (
                    <div key={idx} className="rounded-4xl overflow-hidden border-8 border-white shadow-sm">
                       <img 
                        src={img.url_storage_imagen} 
                        className="w-full h-auto object-cover" 
                        alt={`Evidencia Forense ${idx + 1}`} 
                        onError={(e:any) => e.target.src = 'https://via.placeholder.com/800x400?text=Error+al+cargar+imagen'}
                       />
                    </div>
                  ))
               ) : (
                <div className="bg-white p-10 rounded-4xl text-center border-2 border-dashed border-slate-200">
                    <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-400 font-bold uppercase text-xs">No hay imágenes de evidencia vinculadas</p>
                </div>
               )}
            </div>
            
            <div className="bg-[#0B1E3D] p-8 rounded-[2.5rem] text-white h-fit shadow-2xl">
               <Fingerprint className="text-blue-400 mb-4" size={32} />
               <p className="text-[9px] font-black text-white/40 uppercase mb-2 tracking-widest">AutoML Analysis</p>
               <p className="text-4xl font-black italic mb-6">
                 {(caso.evidencias?.[0]?.resultado_automl_score * 100 || 0).toFixed(2)}%
               </p>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black mb-4">
                  {caso.evidencias?.[0]?.deteccion_edicion ? '🚩 POSIBLE MANIPULACIÓN' : '✅ IMAGEN ÍNTEGRA'}
               </div>
               <div className="overflow-hidden">
                  <p className="text-[8px] font-bold text-blue-300/50 uppercase mb-1">Hash SHA-256</p>
                  <p className="text-[8px] font-mono break-all text-blue-200 bg-black/20 p-2 rounded-lg">
                    {caso.evidencias?.[0]?.hash_sha256 || "N/A"}
                  </p>
               </div>
            </div>
          </div>
        )}

        {/* --- PANEL DE RESOLUCIÓN --- */}
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Scale size={120} /></div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase mb-10 tracking-[0.4em] flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> Panel de Dictamen ShieldLens
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <button 
              disabled={updating} 
              onClick={() => handleDecision("aprobar")} 
              className="bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
            >
              {updating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} APROBAR
            </button>
            
            <button 
              disabled={updating} 
              onClick={() => handleDecision("fraude")} 
              className="bg-[#E53E3E] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 active:scale-95"
            >
              {updating ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />} MARCAR FRAUDE
            </button>
            
            <button 
              disabled={updating} 
              onClick={() => handleDecision("escalar")} 
              className="bg-white border-2 border-slate-200 text-slate-500 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-95"
            >
              <AlertTriangle size={18} /> ESCALAR
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}