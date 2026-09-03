import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageBackground from '../../components/PageBackground';
import {
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, 
  CircleDollarSign, Info, Loader2, AlertCircle,
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

const buildSteps = (estado: string) => {
  const s        = estado?.toUpperCase();
  const resolved = ['REVISADO', 'APROBADO', 'ACEPTADO', 'RECHAZADO', 'FRAUDE'].includes(s);
  return [
    { label: 'Recibido',    done: true,     active: false },
    { label: 'Análisis IA', done: true,     active: false },
    { label: 'En Revisión', done: resolved, active: !resolved },
    { label: 'Resolución',  done: resolved, active: resolved  },
  ];
};

const ClaimStatus = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [claim,   setClaim]   = useState<FullClaim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/incidentes/detalle/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        });
        const json = await res.json();
        if (json.success) setClaim(json.data);
      } catch { /* null state handles it */ }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <PageBackground>
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 size={26} className="animate-spin text-gold-500" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">Cargando expediente...</p>
    </div>
    </PageBackground>
  );

  if (!claim) return (
    <PageBackground>
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-slate-400 font-medium">No se encontró el reporte.</p>
    </div>
    </PageBackground>
  );

  const steps         = buildSteps(claim.estado_reclamacion);
  const iaScorePct    = Math.round((claim.score_confianza_ia ?? 0) * 100);
  const isFraude      = claim.veredicto_ia === 'SOSPECHOSO';
  const completedCount = steps.filter(s => s.done).length;

  const statusStyle = (() => {
    const s = claim.estado_reclamacion?.toUpperCase();
    if (s === 'PENDIENTE')                                    return { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400',   pulse: true  };
    if (['ACEPTADO', 'APROBADO', 'REVISADO'].includes(s))    return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400', pulse: false };
    if (['RECHAZADO', 'FRAUDE'].includes(s))                  return { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400',     pulse: false };
    return                                                           { bg: 'bg-gold-50',    text: 'text-gold-700',    dot: 'bg-gold-400',    pulse: false };
  })();

  return (
    <PageBackground>
    <div className="min-h-screen font-sans text-navy">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 space-y-6">

        {/* BACK */}
        <button
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 text-slate-400 hover:text-navy transition-colors text-sm font-medium group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 rounded-lg"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Volver al Portal
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-navy text-white text-[10px] font-semibold uppercase tracking-widest rounded-lg">
                Expediente Digital
              </span>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                {claim.tipo_siniestro} · {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-mono">{claim.id_reclamacion.substring(0, 13)}</h1>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${statusStyle.pulse ? 'animate-pulse' : ''}`} />
            {claim.estado_reclamacion}
          </span>
        </div>

        {/* ── TIMELINE ── */}
        <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl px-8 pt-7 pb-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-navy">Progreso de la Reclamación</h3>
            <span className="text-[10px] font-semibold text-slate-400 bg-white/55 border border-white/50 px-3 py-1 rounded-full uppercase tracking-widest">
              {completedCount} de {steps.length} pasos
            </span>
          </div>

          {/* Row: [node]──[connector]──[node]──[connector]──[node] */}
          <div className="flex items-start">
            {steps.map((step, i) => (
              <div key={i} className={`flex items-start ${i < steps.length - 1 ? 'flex-1' : ''}`}>

                {/* Node + label */}
                <div className="flex flex-col items-center">
                  <div aria-current={step.active ? 'step' : undefined} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 shrink-0
                    ${step.done && step.active
                      ? 'bg-navy text-white ring-4 ring-navy/10'
                      : step.done
                        ? 'bg-emerald-400 text-white'
                        : 'bg-slate-100 text-slate-300 border border-slate-200'}`}
                  >
                    {step.done ? <CheckCircle2 size={16} /> : <Clock size={15} />}
                  </div>

                  <p className={`text-[11px] font-semibold mt-2.5 whitespace-nowrap text-center
                    ${step.done ? 'text-navy' : 'text-slate-300'}`}>
                    {step.label}
                  </p>

                  {/* Sub-label */}
                  {step.active && step.done && (
                    <span className="text-[10px] font-semibold text-gold-600 uppercase tracking-widest mt-0.5">Actual</span>
                  )}
                  {step.active && !step.done && (
                    <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mt-0.5">En curso</span>
                  )}
                  {step.done && step.label === 'Resolución' && !step.active && (
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">Finalizado</span>
                  )}
                </div>

                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="flex-1 px-2 mt-4.5">
                    <div className="h-0.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                        style={{
                          width: step.done && steps[i + 1].done ? '100%'
                               : step.done                       ? '50%'
                               :                                   '0%',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* IA INSIGHTS */}
          <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-7 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={17} className="text-gold-600" />
              </div>
              <h3 className="text-sm font-bold">Veredicto IA ShieldLens</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Nivel de confianza</span>
                <span className="text-lg font-bold text-navy">{iaScorePct}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isFraude ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${iaScorePct}%` }}
                />
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-2xl border
              ${isFraude ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
              {isFraude
                ? <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                : <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />}
              <p className={`text-[11px] font-semibold leading-relaxed ${isFraude ? 'text-red-600' : 'text-emerald-600'}`}>
                {isFraude
                  ? 'Se detectaron anomalías en la evidencia. El caso requiere revisión humana.'
                  : 'Análisis completado. No se detectaron patrones de fraude.'}
              </p>
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <CircleDollarSign size={17} className="text-emerald-500" />
              </div>
              <h3 className="text-sm font-bold">Monto de Reclamación</h3>
            </div>

            <div>
              <p className="text-3xl font-bold tracking-tight">
                ${claim.monto_reclamado.toLocaleString('es-MX')}
                <span className="text-base font-medium text-slate-400 ml-1">MXN</span>
              </p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                Estimación sujeta a deducible
              </p>
            </div>

            <div className="bg-white/55 border border-white/50 rounded-2xl p-4 flex-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Descripción declarada</p>
              <p className="text-[11px] text-slate-600 italic leading-relaxed">"{claim.descripcion_siniestro}"</p>
            </div>
          </div>
        </div>

        {/* HELP FOOTER */}
        <div className="bg-navy/90 backdrop-blur-xl rounded-3xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full border border-white/5 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Info size={16} className="text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">¿Tienes dudas sobre este folio?</p>
              <p className="text-[11px] text-white/40 mt-0.5">Contacta a un asesor legal ShieldLens.</p>
            </div>
          </div>
          <button className="relative z-10 shrink-0 bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            Hablar con soporte
          </button>
        </div>

      </div>
    </div>
    </PageBackground>
  );
};

export default ClaimStatus;