import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Car, Home,
  Zap, Package, ShieldCheck, Upload, X,
  Brain, AlertTriangle, ShieldAlert, MapPin, Calendar, FileText, Sparkles
} from 'lucide-react';

// --- INTERFACES ---
interface ClaimData {
  type: string;
  date: string;
  location: string;
  description: string;
  policy: string;
}

interface AIAnalysis {
  etiqueta: string;
  confianza: number;
  justificacion?: string; 
}

const CLAIM_TYPES = [
  { id: 'Colision',  label: 'Colisión vehicular',  icon: Car,            desc: 'Choque con vehículo u objeto'  },
  { id: 'Robo',      label: 'Robo o hurto',         icon: AlertTriangle, desc: 'Robo total, parcial o autopartes' },
  { id: 'Incendio',  label: 'Incendio',              icon: Zap,           desc: 'Daños por fuego o explosión'   },
  { id: 'Inmueble',  label: 'Daños al inmueble',      icon: Home,          desc: 'Daños estructurales al hogar' },
  { id: 'Otros',     label: 'Otros daños',           icon: Package,       desc: 'Cualquier otro siniestro'      },
];

const STEPS = ['Detalles', 'Fotografías', 'Análisis IA', 'Confirmación'];

/* ── COMPONENTE: BARRA DE PASOS ── */
const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center mb-10">
    {STEPS.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${done   ? 'bg-emerald-400 text-white shadow-lg shadow-emerald-100'
              : active ? 'bg-[#0B1E3D] text-white ring-4 ring-[#0B1E3D]/10'
              :          'bg-slate-100 text-slate-400'}`}
            >
              {done ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-[9px] font-semibold uppercase tracking-widest whitespace-nowrap
              ${active ? 'text-[#0B1E3D]' : done ? 'text-emerald-500' : 'text-slate-300'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all duration-500 ${i < current ? 'bg-emerald-300' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── COMPONENTE: WRAPPER DE CAMPOS ── */
const Field = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="relative group">
    <Icon className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-[#0B1E3D] transition-colors" size={15} />
    {children}
  </div>
);

const inputCls = "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all font-medium";

/* ── PASO 0: DETALLES ── */
const StepDetails = ({ data, setData, onNext }: { data: ClaimData; setData: (d: ClaimData) => void; onNext: () => void }) => {
  const valid = data.type && data.date && data.location && data.policy;
  
  return (
    <div className="space-y-7 animate-in fade-in duration-500">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 1 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight text-balance">Detalles del incidente</h2>
        <p className="text-sm text-slate-400 mt-1">Completa la información básica para el reporte.</p>
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3 block">Tipo de siniestro</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CLAIM_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setData({ ...data, type: id })}
              className={`text-left p-4 rounded-2xl border transition-all duration-200
                ${data.type === id ? 'bg-[#0B1E3D] border-[#0B1E3D] shadow-lg' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
            >
              <Icon size={17} className={`mb-2 ${data.type === id ? 'text-white/60' : 'text-slate-400'}`} />
              <p className={`text-xs font-bold leading-tight ${data.type === id ? 'text-white' : 'text-[#0B1E3D]'}`}>{label}</p>
              <p className={`text-[10px] mt-0.5 leading-tight ${data.type === id ? 'text-white/45' : 'text-slate-400'}`}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Fecha del incidente</label>
          <Field icon={Calendar}>
            <input type="date" value={data.date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setData({ ...data, date: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Monto Reclamado ($)</label>
          <Field icon={ShieldCheck}>
            <input type="number" placeholder="Ej. 15000" value={data.policy} onChange={(e) => setData({ ...data, policy: e.target.value })} className={inputCls} />
          </Field>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Lugar del incidente</label>
        <Field icon={MapPin}>
          <input type="text" placeholder="Dirección exacta del suceso" value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className={inputCls} />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Descripción de los hechos</label>
        </div>
        <Field icon={FileText}>
          <textarea rows={4} placeholder="Describe brevemente lo ocurrido..." value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} className={`${inputCls} resize-none pt-3`} />
        </Field>
      </div>

      <button onClick={onNext} disabled={!valid} className="w-full py-4 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-100 disabled:text-slate-300 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-900/10">
        Continuar a Fotografías <ArrowRight size={16} className="inline ml-2" />
      </button>
    </div>
  );
};

/* ── PASO 1: FOTOGRAFÍAS ── */
const StepPhotos = ({ files, setFiles, onNext, onBack }: any) => (
  <div className="space-y-7 animate-in fade-in duration-500">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 2 de 4</p>
      <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Carga de Evidencia</h2>
      <p className="text-sm text-slate-400 mt-1">Sube la fotografía principal del daño para el análisis forense.</p>
    </div>

    <label className="relative block border-2 border-dashed border-slate-200 hover:border-[#0B1E3D]/30 bg-slate-50 hover:bg-white rounded-[2rem] p-16 text-center cursor-pointer transition-all group">
      <Upload size={32} className="mx-auto mb-4 text-slate-300 group-hover:text-[#0B1E3D] transition-colors" />
      <p className="text-sm font-bold text-[#0B1E3D]">Haz clic para seleccionar imagen</p>
      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Formatos: JPG, PNG · Máx. 50MB</p>
      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setFiles([e.target.files[0]])} />
    </label>

    {files.length > 0 && (
      <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100 animate-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-emerald-200">
            <img src={URL.createObjectURL(files[0])} alt="preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-xs font-bold text-emerald-800 truncate max-w-[200px]">{files[0].name}</p>
        </div>
        <button onClick={() => setFiles([])} className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors"><X size={16} /></button>
      </div>
    )}

    <div className="flex gap-4">
      <button onClick={onBack} className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold rounded-xl transition-all">Atrás</button>
      <button onClick={onNext} disabled={files.length === 0} className="flex-1 py-4 bg-[#0B1E3D] text-white font-bold rounded-xl shadow-lg disabled:opacity-50">Comenzar Análisis IA</button>
    </div>
  </div>
);

/* ── PASO 2: ANÁLISIS IA (DISEÑO CON JUSTIFICACIÓN) ── */
const StepAI = ({ files, data, onNext, onBack }: any) => {
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        setPhase(1);
        const base64 = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.readAsDataURL(files[0]);
          reader.onload = () => res((reader.result as string).split(',')[1]);
          reader.onerror = rej;
        });

        const response = await fetch('http://localhost:5000/api/ia/analizar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('token') || '' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const resData = await response.json();
        if (resData.success) { 
          setResult(resData.analysis); 
          setPhase(2); 
        } else {
          throw new Error(resData.msg || 'Error de IA');
        }
      } catch (err: any) {
        setError(err.message);
        setPhase(0);
      }
    };
    if (phase === 0 && !result && !error) runAnalysis();
  }, [files, phase, result, error]);

  const handleFinalizar = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('imagen', files[0]);
      formData.append('monto_reclamado', data.policy);
      formData.append('score_confianza_ia', result.confianza.toString());
      formData.append('veredicto_ia', result.etiqueta === 'Reales' ? 'SINIESTRO REAL' : 'SOSPECHOSO');
      formData.append('tipo_siniestro', data.type);
      formData.append('descripcion_siniestro', data.description);
      formData.append('lugar_incidente', data.location);

      const response = await fetch('http://localhost:5000/api/incidentes/crear', {
        method: 'POST',
        headers: { 'x-auth-token': localStorage.getItem('token') || '' },
        body: formData,
      });

      if (response.ok) onNext();
      else throw new Error("No se pudo guardar en el servidor");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const score = (result?.confianza || 0) * 100;
  const isFraude = result?.etiqueta === 'Falsas';
  const colorBase = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red';

  return (
    <div className="space-y-7 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-[#0B1E3D] tracking-tight">Análisis Forense</h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Vertex AI + Gemini Flash</p>
        </div>
        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-[#0B1E3D]"><Brain size={20}/></div>
      </div>

      <div className={`rounded-[2.5rem] p-10 text-white transition-all duration-700 shadow-2xl relative overflow-hidden ${
        phase === 1 ? 'bg-[#0B1E3D]' : isFraude ? 'bg-red-600 shadow-red-200' : 'bg-emerald-600 shadow-emerald-200'
      }`}>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          {phase === 1 ? <Brain className="animate-pulse" size={48} /> : isFraude ? <ShieldAlert size={48} /> : <ShieldCheck size={48} />}
          <h3 className="text-2xl font-black">{phase === 1 ? 'Analizando píxeles...' : isFraude ? 'Riesgo Detectado' : 'Evidencia Validada'}</h3>
        </div>
      </div>

      {phase === 2 && result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border-2 border-slate-50 p-7 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-end mb-4">
               <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Score Confianza</p>
                  <p className={`text-4xl font-black text-${colorBase}-500`}>{score.toFixed(1)}%</p>
               </div>
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-${colorBase}-50 text-${colorBase}-600`}>
                  {isFraude ? 'Alto Riesgo' : 'Bajo Riesgo'}
               </div>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full transition-all duration-1000 bg-${colorBase}-500`} style={{ width: `${score}%` }} />
            </div>
          </div>

          {/* JUSTIFICACIÓN DE GEMINI */}
          <div className="bg-slate-50 border-l-4 border-[#0B1E3D] p-6 rounded-r-3xl relative">
             <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[#0B1E3D]" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Análisis del Perito IA</span>
             </div>
             <p className="text-sm text-slate-700 leading-relaxed font-semibold italic">
                "{result.justificacion || 'Generando análisis detallado de la evidencia fotográfica...'}"
             </p>
          </div>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14}/> {error}</div>}

      <div className="flex gap-4">
        <button onClick={onBack} disabled={phase === 1 || isSaving} className="px-8 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl transition-all hover:bg-slate-100">Atrás</button>
        <button onClick={handleFinalizar} disabled={phase !== 2 || isSaving} className="flex-1 py-4 bg-[#0B1E3D] text-white rounded-2xl font-black shadow-xl disabled:bg-slate-100">
           {isSaving ? 'Guardando Reporte...' : 'Confirmar y Enviar'}
        </button>
      </div>
    </div>
  );
};

/* ── PASO 3: CONFIRMACIÓN ── */
const StepConfirm = ({ navigate }: { navigate: (p: string) => void }) => {
  const [folio] = useState(() => `SHIELD-2026-${Math.floor(Math.random() * 8999) + 1000}`);
  
  return (
    <div className="text-center space-y-8 py-10 animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={48} /></div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-[#0B1E3D] tracking-tight">¡Reporte Exitoso!</h2>
        <p className="text-slate-400 font-medium px-10">Tu reclamación ha sido registrada en el sistema forense.</p>
      </div>
      
      <div className="bg-[#0B1E3D] p-8 rounded-[2.5rem] text-white inline-block px-14 shadow-2xl shadow-blue-900/30">
        <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.3em] mb-2">Folio de seguimiento</p>
        <p className="text-3xl font-mono font-black tracking-tighter">{folio}</p>
      </div>

      <div className="space-y-4 pt-6">
         <button onClick={() => navigate('/portal')} className="w-full py-5 bg-[#0B1E3D] text-white rounded-2xl font-black shadow-xl hover:scale-[1.02] transition-transform">Finalizar y salir</button>
         <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">ShieldLens Security Protocol v2026</p>
      </div>
    </div>
  );
};

/* ── WIZARD PRINCIPAL ── */
const NewClaim = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [data, setData] = useState<ClaimData>({ type: '', date: '', location: '', description: '', policy: '' });

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-sans selection:bg-[#0B1E3D] selection:text-white">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => step === 0 ? navigate('/portal') : setStep(s => s - 1)} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-[#0B1E3D] transition-colors font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16} /> {step === 0 ? 'Volver al Portal' : 'Regresar'}
        </button>

        <div className="bg-white rounded-[3rem] p-8 lg:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
          <StepBar current={step} />
          {step === 0 && <StepDetails data={data} setData={setData} onNext={() => setStep(1)} />}
          {step === 1 && <StepPhotos files={files} setFiles={setFiles} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepAI files={files} data={data} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepConfirm navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};

export default NewClaim;