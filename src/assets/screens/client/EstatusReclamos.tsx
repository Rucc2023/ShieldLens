import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, 
  CircleDollarSign, Info, Loader2, AlertCircle 
} from 'lucide-react';

interface FullClaim {
  id_reclamacion: string;
  tipo_siniestro: string;
  fecha_reclamacion: string;
  estado_reclamacion: string;
  monto_reclamado: number;
  veredicto_ia: string;
  score_confianza_ia: number;
  descripcion_siniestro: string;
}

const ClaimStatus = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID de la URL
  const [claim, setClaim] = useState<FullClaim | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/incidentes/detalle/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' }
        });
        const json = await res.json();
        if (json.success) setClaim(json.data);
      } catch (err) {
        console.error("Error al cargar detalle");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-sm font-bold text-[#0B1E3D]">Cargando expediente forense...</p>
    </div>
  );

  if (!claim) return <div className="p-10 text-center">No se encontró el reporte.</div>;

  // Lógica de pasos basada en el estado de la BD
  const steps = [
    { label: 'Recibido', completed: true },
    { label: 'Análisis IA', completed: true },
    { label: 'En Revisión', completed: claim.estado_reclamacion !== 'Rechazado' },
    { label: 'Resolución', completed: claim.estado_reclamacion === 'Aceptado' },
  ];

  const iaScorePct = (claim.score_confianza_ia * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* BACK */}
        <button onClick={() => navigate('/portal')} className="flex items-center gap-2 text-slate-400 hover:text-[#0B1E3D] transition-all text-sm font-bold group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Portal
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="px-3 py-1 bg-[#0B1E3D] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                 Expediente Digital
               </span>
               <p className="text-[11px] font-bold text-slate-400 uppercase">
                 {claim.tipo_siniestro} · {new Date(claim.fecha_reclamacion).toLocaleDateString()}
               </p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter">{claim.id_reclamacion.substring(0, 13)}</h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2
              ${claim.estado_reclamacion === 'Pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${claim.estado_reclamacion === 'Pendiente' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {claim.estado_reclamacion}
            </span>
          </div>
        </div>

        {/* PROGRESS TRACKER */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheck size={120} />
          </div>
          
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-10">Línea de Tiempo del Proceso</h3>
          
          <div className="flex flex-col md:flex-row justify-between relative gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center z-10 w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all shadow-lg
                  ${step.completed ? 'bg-[#0B1E3D] text-white' : 'bg-slate-100 text-slate-300'}`}>
                  {step.completed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <p className={`text-xs font-bold ${step.completed ? 'text-[#0B1E3D]' : 'text-slate-300'}`}>{step.label}</p>
              </div>
            ))}
            {/* Connector line (Desktop) */}
            <div className="absolute top-6 left-0 w-full h-0.5 bg-slate-100 z-0 hidden md:block" />
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* IA INSIGHTS */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><ShieldCheck size={20}/></div>
              <h3 className="font-bold text-sm">Veredicto IA ShieldLens</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                <span>Nivel de Confianza</span>
                <span>{iaScorePct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${iaScorePct}%` }} />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${claim.veredicto_ia === 'SOSPECHOSO' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
              <p className="text-[11px] font-bold leading-relaxed flex items-center gap-2">
                <AlertCircle size={14} />
                {claim.veredicto_ia === 'SOSPECHOSO' 
                  ? "Se han detectado anomalías en la evidencia. El caso requiere revisión humana manual."
                  : "Análisis completado satisfactoriamente. No se detectaron patrones de fraude."}
              </p>
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CircleDollarSign size={20}/></div>
                <h3 className="font-bold text-sm">Monto de Reclamación</h3>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter">${claim.monto_reclamado.toLocaleString('es-MX')}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Estimación sujeta a deducible</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mt-6">
               <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Descripción Declarada:</p>
               <p className="text-[11px] text-[#0B1E3D] italic leading-relaxed">"{claim.descripcion_siniestro}"</p>
            </div>
          </div>
        </div>

        {/* HELP FOOTER */}
        <div className="bg-[#0B1E3D] rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Info className="text-blue-400" /></div>
             <div>
               <p className="text-sm font-bold">¿Tienes dudas sobre este folio?</p>
               <p className="text-xs text-white/50">Contacta a un asesor legal ShieldLens de inmediato.</p>
             </div>
          </div>
          <button className="bg-blue-500 hover:bg-blue-400 px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-xl shadow-blue-500/20">
            Hablar con soporte
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClaimStatus;