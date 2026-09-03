import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageBackground from '../../components/PageBackground';

const JAKARTA = "font-['Plus_Jakarta_Sans']";

interface FullClaim {
  id_reclamacion: string;
  tipo_siniestro: string;
  fecha_reclamacion: string;
  estado_reclamacion: string;
  monto_reclamado: number;
  veredicto_ia: string;
  score_confianza_ia: number;
  descripcion_siniestro: string;
  lugar_incidente?: string;
}

const buildSteps = (estado: string) => {
  const s        = estado?.toUpperCase();
  const resolved = ['REVISADO', 'APROBADO', 'ACEPTADO', 'RECHAZADO', 'FRAUDE'].includes(s);
  return [
    { label: 'Recibido',    icon: 'check',    done: true,     active: false },
    { label: 'Análisis IA', icon: 'check',    done: true,     active: false },
    { label: 'En Revisión', icon: 'schedule', done: resolved, active: !resolved },
    { label: 'Resolución',  icon: 'verified', done: resolved, active: resolved  },
  ];
};

const ClaimStatus = () => {
  const navigate = useNavigate();
  const { id }   = useParams();
  const [claim,   setClaim]   = useState<FullClaim | null>(null);
  const [perfil,  setPerfil]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shared,  setShared]  = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      const headers = { 'x-auth-token': localStorage.getItem('token') || '' };
      try {
        const [resC, resP] = await Promise.all([
          fetch(`http://localhost:5000/api/incidentes/detalle/${id}`, { headers }),
          fetch('http://localhost:5000/api/incidentes/perfil-cliente', { headers }),
        ]);
        const [jsonC, jsonP] = await Promise.all([resC.json(), resP.json()]);
        if (jsonC.success) setClaim(jsonC.data);
        if (jsonP.success) setPerfil(jsonP.data);
      } catch { /* null state handles it */ }
      finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  if (loading) return (
    <PageBackground>
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-[32px] text-gold-500 animate-spin">progress_activity</span>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-navy/50">Cargando expediente...</p>
    </div>
    </PageBackground>
  );

  if (!claim) return (
    <PageBackground>
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <span className="material-symbols-outlined text-[32px] text-navy/30">search_off</span>
      <p className="text-sm text-navy/50 font-medium">No se encontró el reporte.</p>
    </div>
    </PageBackground>
  );

  const steps           = buildSteps(claim.estado_reclamacion);
  const iaScorePct       = Math.round((claim.score_confianza_ia ?? 0) * 100);
  const isFraude         = claim.veredicto_ia === 'SOSPECHOSO';
  const completedCount   = steps.filter(s => s.done).length;
  const gaugeCircumference = 251.2;
  const gaugeOffset      = gaugeCircumference * (1 - Math.min(100, Math.max(0, iaScorePct)) / 100);

  const statusStyle = (() => {
    const s = claim.estado_reclamacion?.toUpperCase();
    if (s === 'PENDIENTE')                                 return { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500', pulse: true  };
    if (['ACEPTADO', 'APROBADO', 'REVISADO'].includes(s)) return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', pulse: false };
    if (['RECHAZADO', 'FRAUDE'].includes(s))               return { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-500',   pulse: false };
    return                                                        { bg: 'bg-gold-50',    text: 'text-gold-700',    dot: 'bg-gold-400',  pulse: false };
  })();

  const handleDownload = () => {
    const lines = [
      `ShieldLens — Resumen de Expediente`,
      `Folio: ${claim.id_reclamacion}`,
      `Tipo de siniestro: ${claim.tipo_siniestro}`,
      `Fecha: ${new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      `Estado: ${claim.estado_reclamacion}`,
      `Monto reclamado: $${claim.monto_reclamado.toLocaleString('es-MX')} MXN`,
      `Veredicto IA: ${claim.veredicto_ia} (${iaScorePct}% de confianza)`,
      claim.lugar_incidente ? `Lugar: ${claim.lugar_incidente}` : '',
      `Descripción: ${claim.descripcion_siniestro}`,
    ].filter(Boolean);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `expediente_${claim.id_reclamacion.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Folio ${claim.id_reclamacion.substring(0, 8)}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch { /* usuario canceló el share */ }
  };

  return (
    <PageBackground>
    <div className="min-h-screen font-sans text-navy" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── TOP ACTION ROW ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/portal')}
            className="inline-flex items-center gap-1.5 text-navy/70 hover:text-navy transition-colors text-sm font-semibold group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Volver al Portal
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 text-navy/60 text-xs font-semibold">
              Expediente Digital
            </span>
            <button onClick={handleDownload} title="Descargar resumen del expediente"
              className="p-2 rounded-xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] text-navy/60 hover:text-navy hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <button onClick={handleShare} title="Compartir folio"
              className="p-2 rounded-xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] text-navy/60 hover:text-navy hover:bg-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30">
              <span className="material-symbols-outlined text-[18px]">{shared ? 'check' : 'share'}</span>
            </button>
          </div>
        </div>

        {/* ── HEADER MODULE CARD ── */}
        <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-navy/5 text-navy/70 text-xs font-semibold">
                <span className="material-symbols-outlined text-[14px]">folder_shared</span>
                Expediente Digital
              </span>
              <span className="text-slate-300 text-xs">·</span>
              <span className="text-xs font-medium text-slate-500">
                {claim.tipo_siniestro} · {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className={`${JAKARTA} text-2xl sm:text-3xl font-bold text-navy tracking-tight font-mono`}>
                {claim.id_reclamacion.substring(0, 13).toUpperCase()}
              </h1>
              {perfil?.id_poliza && (
                <span className="text-xs text-slate-400 font-medium">Póliza vigente: {perfil.id_poliza.substring(0, 12).toUpperCase()}</span>
              )}
            </div>
          </div>

          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
            <span className="relative flex h-2 w-2">
              {statusStyle.pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.dot}`} />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.dot}`} />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest">{claim.estado_reclamacion}</span>
          </span>
        </section>

        {/* ── TIMELINE ── */}
        <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 sm:p-7 flex flex-col gap-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <span className="material-symbols-outlined text-[20px]">linear_scale</span>
              </div>
              <div className="flex flex-col">
                <h2 className={`${JAKARTA} text-base font-bold text-navy`}>Progreso de la Reclamación</h2>
                <span className="text-xs text-slate-400">Flujo automatizado de validación pericial</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/60 border border-white/50 text-navy/70 text-xs font-semibold">
              {completedCount} de {steps.length} pasos completados
            </span>
          </div>

          <div className="relative pt-1 pb-1">
            <div className="hidden md:block absolute top-[26px] left-[12%] right-[12%] h-1 bg-slate-100 rounded-full" />
            <div className="hidden md:block absolute top-[26px] left-[12%] h-1 bg-emerald-300 rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / steps.length) * 76}%` }} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-500
                    ${step.done && step.active
                      ? 'bg-navy text-white shadow-lg ring-4 ring-navy/10'
                      : step.done
                        ? 'bg-emerald-400 text-white shadow-sm'
                        : 'bg-white/60 border border-white/50 text-slate-300'}`}>
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${step.done && step.active ? 'text-navy' : step.done ? 'text-navy' : 'text-slate-400'}`}>
                      {i + 1}. {step.label}
                    </span>
                    {step.active && step.done && <span className="text-[10px] font-semibold text-gold-600 uppercase tracking-widest mt-0.5">En curso activo</span>}
                    {step.active && !step.done && <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-widest mt-0.5">En curso</span>}
                    {step.done && step.label === 'Resolución' && !step.active && <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">Finalizado</span>}
                    {!step.done && step.label !== 'En Revisión' && <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest mt-0.5">Pendiente</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INFO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* VEREDICTO IA */}
          <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5 pb-4">
                <div className="w-9 h-9 rounded-xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                  <span className="material-symbols-outlined text-[20px]">shield_person</span>
                </div>
                <div>
                  <h3 className={`${JAKARTA} text-base font-bold text-navy`}>Veredicto IA ShieldLens</h3>
                  <span className="text-xs text-slate-400">Vertex AI + Gemini Flash</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-56 h-32 flex items-end justify-center overflow-hidden">
                  <svg className="w-56 h-32" viewBox="0 0 200 110">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeLinecap="round" strokeWidth="18" />
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={isFraude ? '#f87171' : '#34d399'}
                      strokeDasharray={gaugeCircumference} strokeDashoffset={gaugeOffset} strokeLinecap="round" strokeWidth="18"
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                  </svg>
                  <div className="absolute bottom-1 flex flex-col items-center">
                    <span className={`${JAKARTA} text-4xl text-navy leading-none font-bold`}>{iaScorePct}%</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Nivel de Confianza</span>
                  </div>
                </div>

                {isFraude ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold">Anomalía Detectada · Revisión Requerida</span>
                  </div>
                ) : (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold">Índice Óptimo · Coherencia Alta</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-xl p-4 flex flex-col gap-2 border ${isFraude ? 'bg-red-50/60 border-red-100' : 'bg-white/50 border-white/50'}`}>
              <div className={`flex items-center gap-2 ${isFraude ? 'text-red-600' : 'text-emerald-700'}`}>
                <span className="material-symbols-outlined text-[20px]">{isFraude ? 'warning' : 'verified'}</span>
                <span className="text-sm font-bold">{isFraude ? 'Anomalías detectadas' : 'Sin anomalías detectadas'}</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {isFraude
                  ? 'Se detectaron patrones inconsistentes en la evidencia. El caso fue escalado para revisión humana.'
                  : 'Análisis completado. No se detectaron patrones de fraude ni discrepancias en la evidencia fotográfica.'}
              </p>
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                <span>Veredicto: {claim.veredicto_ia}</span>
                <span className="font-mono text-navy/60">Folio: {claim.id_reclamacion.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </section>

          {/* MONTO DE RECLAMACIÓN */}
          <section className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_10px_30px_-12px_rgba(11,30,61,0.18)] rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2.5 pb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <span className="material-symbols-outlined text-[20px]">monetization_on</span>
                </div>
                <div>
                  <h3 className={`${JAKARTA} text-base font-bold text-navy`}>Monto de Reclamación</h3>
                  <span className="text-xs text-slate-400">Cálculo de valuación inicial</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Monto Estimado Solicitado</span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`${JAKARTA} text-4xl text-navy tracking-tight font-extrabold`}>${claim.monto_reclamado.toLocaleString('es-MX')}</span>
                  <span className="text-base font-semibold text-slate-400">MXN</span>
                </div>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">info</span>
                  Estimación sujeta a deducible contratado
                </span>
              </div>

              {perfil && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-navy to-navy-dark text-white shadow-[0_10px_30px_-12px_rgba(11,30,61,0.35)] flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-white/50 uppercase tracking-widest truncate">{perfil.tipo_poliza || perfil.plan || 'Cobertura Vigente'}</span>
                    <span className="font-mono font-bold tracking-widest mt-1">•••• {perfil.id_poliza ? perfil.id_poliza.slice(-4) : '----'}</span>
                    <span className="text-[11px] text-white/60 mt-1">Límite máximo: ${(perfil.monto_cobertura || 50000).toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-[24px]">contactless</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl p-4 bg-white/50 border border-white/50 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Declaración de Siniestro</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {new Date(claim.fecha_reclamacion).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">"{claim.descripcion_siniestro}"</p>
              {claim.lugar_incidente && (
                <div className="flex items-center gap-1.5 pt-1 text-navy/70 text-xs font-medium">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {claim.lugar_incidente}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── SUPPORT FOOTER ── */}
        <section className="bg-navy/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full border border-white/5 pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-11 h-11 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-gold-400 text-[22px]">support_agent</span>
            </div>
            <div>
              <p className={`${JAKARTA} text-sm font-bold text-white`}>¿Tienes dudas sobre este folio?</p>
              <p className="text-xs text-white/40 mt-0.5">Contacta a un asesor legal ShieldLens.</p>
            </div>
          </div>
          <button className="relative z-10 shrink-0 inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            Hablar con soporte
          </button>
        </section>

      </div>
    </div>
    </PageBackground>
  );
};

export default ClaimStatus;
