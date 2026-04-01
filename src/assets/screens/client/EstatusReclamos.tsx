import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  CircleDollarSign, 
  Info,
  HelpCircle
} from 'lucide-react';

const ClaimStatus = () => {
  const navigate = useNavigate();

  const claimData = {
    id: "CLM-2024-001",
    type: "Colisión",
    date: "19/03/2026",
    status: "En Revisión",
    iaScore: 23,
    estimatedAmount: "$45,000 MXN"
  };

  const steps = [
    { label: 'Recibido',         date: '20 Mar, 10:30 AM', completed: true,  current: false },
    { label: 'Validación por IA', date: '20 Mar, 10:35 AM', completed: true,  current: false },
    { label: 'En Revisión',      date: '20 Mar, 11:00 AM', completed: true,  current: true  },
    { label: 'Pago Autorizado',  date: 'Pendiente',         completed: false, current: false },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPct = ((completedCount - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-[#0B1E3D] p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* BACK */}
        <button 
          onClick={() => navigate('/portal')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0B1E3D] transition-colors text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Portal
        </button>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">
              {claimData.type} · Reportado el {claimData.date}
            </p>
            <h1 className="text-[2rem] font-bold tracking-tight">{claimData.id}</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {claimData.status}
          </span>
        </div>

        {/* TIMELINE */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-sm font-bold text-[#0B1E3D]">Progreso de la Reclamación</h2>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              {completedCount} de {steps.length} pasos
            </span>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-10 md:gap-0">
            {/* Track line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 hidden md:block">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center w-full md:w-auto">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500
                  ${step.completed
                    ? step.current
                      ? 'bg-[#0B1E3D] text-white ring-4 ring-[#0B1E3D]/10'
                      : 'bg-emerald-400 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-300'}`}
                >
                  {step.completed ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                </div>
                <p className={`text-xs font-semibold mb-0.5 ${step.completed ? 'text-[#0B1E3D]' : 'text-slate-300'}`}>
                  {step.label}
                </p>
                <p className={`text-[10px] font-medium uppercase tracking-wide ${step.current ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {step.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ANALYSIS + AMOUNT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* IA SCORE */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8">
            <h3 className="text-sm font-bold text-[#0B1E3D] mb-6">Análisis de IA</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Score de Riesgo</span>
                <span className="text-2xl font-bold text-[#0B1E3D]">{claimData.iaScore}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${claimData.iaScore}%` }}
                />
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <p className="text-[11px] font-semibold text-emerald-700 leading-relaxed">
                  Validación automática aprobada. Riesgo bajo detectado.
                </p>
              </div>
            </div>
          </div>

          {/* AMOUNT */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0B1E3D] mb-6">Monto Estimado</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <CircleDollarSign size={22} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1E3D] tracking-tight">{claimData.estimatedAmount}</p>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Monto aproximado</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-600 leading-relaxed">
                El depósito se reflejará en tu cuenta en un máximo de 24 horas tras la aprobación final.
              </p>
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8">
          <h3 className="text-sm font-bold text-[#0B1E3D] mb-5">Próximos Pasos</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Clock size={15} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B1E3D]">En proceso</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Nuestro equipo está revisando su caso. Le notificaremos cuando haya actualizaciones.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-blue-50 border border-blue-100 p-5 rounded-2xl hover:bg-blue-50/80 transition-colors cursor-pointer group">
              <div className="w-9 h-9 rounded-xl bg-white border border-blue-100 flex items-center justify-center shrink-0">
                <HelpCircle size={15} className="text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700">¿Necesitas ayuda?</p>
                <p className="text-[11px] text-blue-500/70 mt-0.5 leading-relaxed">
                  Nuestro asistente virtual está disponible 24/7 para responder tus preguntas.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClaimStatus;