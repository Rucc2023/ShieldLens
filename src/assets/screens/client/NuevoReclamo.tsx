import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Car, Home,
  Zap, Package, ShieldCheck, Upload, X,
  Brain, AlertTriangle, ShieldAlert, MapPin, Calendar, FileText
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
}

const CLAIM_TYPES = [
  { id: 'Colision',  label: 'Colisión vehicular',  icon: Car,           desc: 'Choque con vehículo u objeto'  },
  { id: 'Robo',      label: 'Robo o hurto',         icon: AlertTriangle, desc: 'Robo total, parcial o autopartes' },
  { id: 'Incendio',  label: 'Incendio',              icon: Zap,           desc: 'Daños por fuego o explosión'  },
  { id: 'Inmueble',  label: 'Daños al inmueble',     icon: Home,          desc: 'Daños estructurales al hogar' },
  { id: 'Otros',     label: 'Otros daños',           icon: Package,       desc: 'Cualquier otro siniestro'     },
];

const STEPS = ['Detalles', 'Fotografías', 'Análisis IA', 'Confirmación'];

/* ── Step bar ── */
const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center mb-10">
    {STEPS.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${done   ? 'bg-emerald-400 text-white'
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

/* ── Field wrapper ── */
const Field = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="relative group">
    <Icon className="absolute left-3.5 top-3.5 text-slate-300 group-focus-within:text-[#0B1E3D] transition-colors" size={15} />
    {children}
  </div>
);

const inputCls = "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all";

/* ── Step 0: Details ── */
const StepDetails = ({ data, setData, onNext }: { data: ClaimData; setData: (d: ClaimData) => void; onNext: () => void }) => {
  const valid = data.type && data.date;
  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 1 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Detalles del incidente</h2>
        <p className="text-sm text-slate-400 mt-1">Cuéntanos qué sucedió para comenzar tu reclamación.</p>
      </div>

      {/* Tipo */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3 block">Tipo de siniestro</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CLAIM_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setData({ ...data, type: id })}
              className={`text-left p-4 rounded-2xl border transition-all duration-200
                ${data.type === id
                  ? 'bg-[#0B1E3D] border-[#0B1E3D]'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'}`}
            >
              <Icon size={17} className={`mb-2 ${data.type === id ? 'text-white/60' : 'text-slate-400'}`} />
              <p className={`text-xs font-bold leading-tight ${data.type === id ? 'text-white' : 'text-[#0B1E3D]'}`}>{label}</p>
              <p className={`text-[10px] mt-0.5 leading-tight ${data.type === id ? 'text-white/45' : 'text-slate-400'}`}>{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Date + policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Fecha del incidente</label>
          <Field icon={Calendar}>
            <input
              type="date"
              value={data.date}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Monto Reclamado</label>
          <Field icon={ShieldCheck}>
            <input
              type="number"
              placeholder="Ej. 10000"
              value={data.policy}
              onChange={(e) => setData({ ...data, policy: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Lugar del incidente</label>
        <Field icon={MapPin}>
          <input
            type="text"
            placeholder="Ej. Av. Central 45, Col. Centro"
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Descripción del incidente</label>
          <span className={`text-[10px] font-medium ${data.description.length < 20 ? 'text-slate-300' : 'text-emerald-500'}`}>
            {data.description.length}/500
          </span>
        </div>
        <Field icon={FileText}>
          <textarea
            rows={4}
            placeholder="Describe con detalle lo que ocurrió: cómo sucedió, qué daños hay, si hubo terceros..."
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value.slice(0, 500) })}
            className={`${inputCls} resize-none pt-3`}
          />
        </Field>
      </div>

      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
      >
        Continuar <ArrowRight size={15} />
      </button>
    </div>
  );
};

/* ── Step 1: Photos ── */
const StepPhotos = ({
  files, setFiles, onNext, onBack,
}: {
  files: File[]; setFiles: (f: File[]) => void; onNext: () => void; onBack: () => void;
}) => (
  <div className="space-y-7">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 2 de 4</p>
      <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Fotografías del siniestro</h2>
      <p className="text-sm text-slate-400 mt-1">Sube evidencia fotográfica del daño para el análisis de IA.</p>
    </div>

    {/* Dropzone */}
    <label className="relative block border-2 border-dashed border-slate-200 hover:border-[#0B1E3D]/30 bg-slate-50 hover:bg-slate-100/60 rounded-2xl p-12 text-center cursor-pointer transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-slate-200 group-hover:bg-[#0B1E3D]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
        <Upload size={20} className="text-slate-400 group-hover:text-[#0B1E3D] transition-colors" />
      </div>
      <p className="text-sm font-semibold text-[#0B1E3D]">Haz clic o arrastra fotos aquí</p>
      <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, HEIC · Máx. 50 MB</p>
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => { if (e.target.files) setFiles([e.target.files[0]]); }}
      />
    </label>

    {/* Preview */}
    {files.length > 0 && (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-200 shrink-0">
            <img src={URL.createObjectURL(files[0])} alt="preview" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-700 truncate max-w-48">{files[0].name}</p>
            <p className="text-[10px] text-emerald-500 font-medium">Lista para análisis</p>
          </div>
        </div>
        <button onClick={() => setFiles([])} className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors">
          <X size={13} className="text-emerald-600" />
        </button>
      </div>
    )}

    {/* Tip */}
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
      <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
      <p className="text-[11px] text-blue-600 leading-relaxed">
        <span className="font-bold">Consejo:</span> Incluye fotos del daño, placa del vehículo y la escena. Evita imágenes borrosas o editadas.
      </p>
    </div>

    <div className="flex gap-3">
      <button onClick={onBack} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0B1E3D] font-semibold rounded-xl transition-all text-sm flex items-center gap-2">
        <ArrowLeft size={15} /> Atrás
      </button>
      <button
        onClick={onNext}
        disabled={files.length === 0}
        className="flex-1 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] text-sm"
      >
        Analizar con IA
      </button>
    </div>
  </div>
);

/* ── Step 2: AI (Integrado con el envío a SQL Server) ── */
const StepAI = ({ 
  files, 
  data, 
  onNext, 
  onBack 
}: { 
  files: File[]; 
  data: ClaimData; 
  onNext: () => void; 
  onBack: () => void 
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Efecto para llamar a Vertex AI al cargar el componente
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
          headers: { 
            'Content-Type': 'application/json', 
            'x-auth-token': localStorage.getItem('token') || '' 
          },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const resData = await response.json();
        if (resData.success) { 
          setResult(resData.analysis); 
          setPhase(2); 
        } else {
          throw new Error(resData.msg || 'Error de IA');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setPhase(0);
      }
    };

    if (phase === 0 && !result && !error) runAnalysis();
  }, [files, phase, result, error]);

  // 2. Función para guardar la reclamación final en SQL Server
  const handleFinalizar = async () => {
  if (!result) return;
  setIsSaving(true);
  try {
    const response = await fetch('http://localhost:5000/api/incidentes/crear', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-auth-token': localStorage.getItem('token') || '' 
      },
      body: JSON.stringify({
        monto_reclamado: parseFloat(data.policy),
        score_confianza_ia: result.confianza,
        veredicto_ia: result.etiqueta === 'Reales' ? 'SINIESTRO REAL' : 'SOSPECHOSO',
        
        // --- AQUÍ ESTÁN LOS NUEVOS CAMPOS ---
        tipo_siniestro: data.type,               // Envía 'Colision', 'Robo', etc.
        descripcion_siniestro: data.description, // Envía el texto del textarea
        referencia_poliza: data.location         // Se queda por si es Ajustador
      }),
    });

    const saveRes = await response.json();
    if (saveRes.success) onNext();
    else throw new Error(saveRes.msg);
  } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Ocurrió un error inesperado al guardar.");
  }
}
};

  const score = (result?.confianza || 0) * 100;
  const isFraude = result?.etiqueta === 'Falsas';

  const scoreColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-red-500';
  const barColor = score >= 80 ? 'bg-emerald-400' : score >= 60 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 3 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Análisis de IA</h2>
        <p className="text-sm text-slate-400 mt-1">Vertex AI Engine v3.0 analiza la evidencia fotográfica.</p>
      </div>

      {/* AI status card */}
      <div className={`rounded-3xl p-8 text-white relative overflow-hidden transition-all duration-500
        ${phase === 1 ? 'bg-[#0B1E3D]' : isFraude ? 'bg-red-600' : 'bg-emerald-500'}`}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-white/5" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-white/5" />
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          {phase === 1
            ? <Brain size={44} className="animate-pulse text-white/70" />
            : isFraude
              ? <ShieldAlert size={44} />
              : <CheckCircle2 size={44} />}
          <p className="text-lg font-bold">
            {phase === 1 ? 'Analizando evidencia...' : isFraude ? 'Inconsistencia detectada' : 'Evidencia validada'}
          </p>
          <p className="text-[11px] text-white/40 font-medium">
            {phase === 1 ? 'Detectando patrones y metadatos' : isFraude ? 'Se detectaron anomalías en la imagen' : 'Sin anomalías detectadas'}
          </p>
        </div>
      </div>

      {/* Result Card */}
      {phase === 2 && result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Score de Confianza</span>
              <span className={`text-2xl font-bold ${scoreColor}`}>{score.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className={`h-full rounded-full transition-all duration-1000 ${barColor}`} style={{ width: `${score}%` }} />
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Veredicto IA</span>
              <span className={`text-sm font-bold uppercase tracking-wide ${isFraude ? 'text-red-600' : 'text-emerald-600'}`}>
                {isFraude ? 'SOSPECHOSO' : 'SINIESTRO REAL'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 p-4 rounded-2xl animate-pulse">
          <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-600 font-semibold leading-relaxed">{error}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={phase === 1 || isSaving}
          className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-[#0B1E3D] font-semibold rounded-xl transition-all text-sm flex items-center gap-2"
        >
          <ArrowLeft size={15} /> Atrás
        </button>
        <button
          onClick={handleFinalizar}
          disabled={phase !== 2 || isSaving}
          className="flex-1 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>Confirmar y enviar</>
          )}
        </button>
      </div>
    </div>
  );
};

/* ── Step 3: Confirm ── */
const StepConfirm = ({ navigate }: { navigate: (p: string) => void }) => {
  const [folio] = useState(() => `SHIELD-2026-${Math.floor(Math.random() * 8999) + 1000}`);
  return (
    <div className="space-y-7 text-center">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">¡Reporte enviado!</h2>
          <p className="text-sm text-slate-400 mt-1">Tu caso fue registrado y está en revisión.</p>
        </div>
      </div>

      <div className="bg-[#0B1E3D] rounded-3xl p-7 text-left space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Folio de seguimiento</span>
          <span className="text-sm font-bold text-white font-mono">{folio}</span>
        </div>
        <div className="h-px bg-white/10" />
        {[
          { label: 'Estado',    value: 'En revisión' },
          { label: 'Prioridad', value: 'Normal'      },
          { label: 'Plazo',     value: '1–3 días hábiles' },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-white/40">{row.label}</span>
            <span className="text-xs font-semibold text-white/80">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">Próximos pasos</p>
        {[
          'Recibirás un correo de confirmación en las próximas horas.',
          'Un ajustador revisará tu caso en 1–3 días hábiles.',
          'Puedes dar seguimiento desde "Mis Reclamaciones".',
        ].map((txt, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0 mt-1.5" />
            <p className="text-[11px] text-blue-600 leading-relaxed">{txt}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/portal')}
        className="w-full py-3.5 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl transition-all active:scale-[0.98] text-sm"
      >
        Volver al Portal
      </button>
    </div>
  );
};

/* ── Main wizard ── */
const NewClaim = () => {
  const navigate = useNavigate();
  const [step, setStep]   = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [data, setData]   = useState<ClaimData>({ type: '', date: '', location: '', description: '', policy: '' });

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => step === 0 ? navigate('/portal') : setStep(s => s - 1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0B1E3D] transition-colors text-sm font-medium mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          {step === 0 ? 'Volver al Portal' : 'Paso anterior'}
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10">
          <StepBar current={step} />
          {step === 0 && <StepDetails data={data} setData={setData} onNext={() => setStep(1)} />}
          {step === 1 && <StepPhotos  files={files} setFiles={setFiles} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepAI     files={files} data={data} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepConfirm navigate={navigate} />}
        </div>

      </div>
    </div>
  );
};

export default NewClaim;