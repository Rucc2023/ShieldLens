import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Car, Home, Umbrella,
  Zap, Package, ShieldCheck, Upload, X, FileImage,
  ScanSearch, Brain, Clock, AlertTriangle, Sparkles
} from 'lucide-react';

// --- CONFIGURACIÓN DE TIPOS PARA TYPESCRIPT ---
// Agregamos interfaces para que el editor deje de marcar "any"
interface ClaimData {
  type: string;
  date: string;
  location: string;
  description: string;
  policy: string;
}

const CLAIM_TYPES = [
  { id: 'colision',  label: 'Colisión vehicular',  icon: Car,           desc: 'Choque con vehículo u objeto'      },
  { id: 'robo',      label: 'Robo o hurto',          icon: AlertTriangle, desc: 'Robo total, parcial o autopartes' },
  { id: 'granizo',   label: 'Daños por clima',       icon: Umbrella,      desc: 'Granizo, inundación, viento'       },
  { id: 'incendio',  label: 'Incendio',               icon: Zap,           desc: 'Daños por fuego o explosión'       },
  { id: 'inmueble',  label: 'Daños al inmueble',      icon: Home,          desc: 'Daños estructurales al hogar'      },
  { id: 'otros',     label: 'Otros daños',           icon: Package,       desc: 'Cualquier otro siniestro'          },
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
              ${done ? 'bg-emerald-400 text-white' : active ? 'bg-[#0B1E3D] text-white ring-4 ring-[#0B1E3D]/10' : 'bg-slate-100 text-slate-400'}`}>
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

/* ── Step 1: Details ── */
const StepDetails = ({ data, onChange, onNext }: { data: ClaimData, onChange: any, onNext: any }) => {
  const valid = data.type && data.date && data.description.trim().length > 20;
  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 1 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Detalles del incidente</h2>
        <p className="text-sm text-slate-400 mt-1">Cuéntanos qué sucedió para comenzar tu reclamación.</p>
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3 block">Tipo de reclamo</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CLAIM_TYPES.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} type="button" onClick={() => onChange('type', id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200
                ${data.type === id ? 'bg-[#0B1E3D] border-[#0B1E3D]' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'}`}>
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
          <input type="date" value={data.date} max={new Date().toISOString().split('T')[0]}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all" />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Lugar del incidente</label>
          <input type="text" placeholder="Ej. Av. Central 45, Col. Centro" value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Descripción del incidente</label>
          <span className={`text-[10px] font-medium ${data.description.length < 20 ? 'text-slate-300' : 'text-emerald-500'}`}>
            {data.description.length}/500
          </span>
        </div>
        <textarea rows={4} placeholder="Describe con detalle lo que ocurrió: cómo sucedió, qué daños hay, si hubo terceros involucrados..."
          value={data.description} onChange={(e) => onChange('description', e.target.value.slice(0, 500))}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all resize-none" />
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Número de póliza</label>
        <input type="text" placeholder="Ej. VIP-9902" value={data.policy}
          onChange={(e) => onChange('policy', e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0B1E3D] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0B1E3D]/10 focus:border-[#0B1E3D]/30 transition-all" />
      </div>

      <button onClick={onNext} disabled={!valid}
        className="w-full py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
        Continuar <ArrowRight size={15} />
      </button>
    </div>
  );
};

/* ── Step 2: Photos ── */
const StepPhotos = ({ files, onAdd, onRemove, onNext, onBack }: { files: File[], onAdd: any, onRemove: any, onNext: any, onBack: any }) => {
  // ERROR CORREGIDO: useRef en TypeScript necesita inicializarse con null y definir el tipo de elemento HTML
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    // LÓGICA: Transformamos la FileList en un Array y filtramos solo imágenes
    if (e.target.files) {
      onAdd(Array.from(e.target.files).filter(f => f.type.startsWith('image/')));
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // LÓGICA: Accedemos a los archivos soltados mediante dataTransfer
    onAdd(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 2 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Fotografías del siniestro</h2>
        <p className="text-sm text-slate-400 mt-1">Sube al menos 1 foto clara del daño. Más evidencia = análisis más preciso.</p>
      </div>

      {/* ERROR CORREGIDO: inputRef.current puede ser null, agregamos el condicional ?.click() */}
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-[#0B1E3D]/30 bg-slate-50 hover:bg-slate-100/60 rounded-2xl p-10 text-center cursor-pointer transition-all group">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 group-hover:bg-[#0B1E3D]/10 flex items-center justify-center mx-auto mb-3 transition-colors">
          <Upload size={20} className="text-slate-400 group-hover:text-[#0B1E3D] transition-colors" />
        </div>
        <p className="text-sm font-semibold text-[#0B1E3D]">Arrastra fotos aquí o haz clic para seleccionar</p>
        <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, HEIC · Máx. 10 MB por imagen</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {files.map((file, i) => (
            <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
              <img src={URL.createObjectURL(file)} alt={`foto-${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <button onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <X size={12} className="text-slate-600" />
              </button>
            </div>
          ))}
          <div onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 flex items-center justify-center cursor-pointer transition-colors bg-slate-50 hover:bg-slate-100">
            <Upload size={16} className="text-slate-300" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
        <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-600 leading-relaxed">
          <span className="font-bold">Consejo:</span> Incluye fotos del daño, placa del vehículo y la escena completa. Evita imágenes borrosas o editadas.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0B1E3D] font-semibold rounded-xl transition-all text-sm flex items-center gap-2">
          <ArrowLeft size={15} /> Atrás
        </button>
        <button onClick={onNext} disabled={files.length < 1}
          className="flex-1 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
          Analizar con IA <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

/* ── Step 3: AI Review ── */
const StepAI = ({ data, files, onNext, onBack }: { data: ClaimData, files: File[], onNext: any, onBack: any }) => {
  const [phase, setPhase] = useState(0);
  const score = React.useMemo(() => Math.floor(Math.random() * 30) + 10, []);
  const claimLabel = CLAIM_TYPES.find(c => c.id === data.type)?.label || data.type;

  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1800);
    const t2 = setTimeout(() => setPhase(2), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const checks = [
    { label: 'Análisis de imágenes',        icon: ScanSearch,  done: phase >= 1 },
    { label: 'Verificación de metadatos',   icon: FileImage,    done: phase >= 1 },
    { label: 'Detección de anomalías',      icon: Brain,        done: phase >= 2 },
    { label: 'Validación de consistencia', icon: ShieldCheck,  done: phase >= 2 },
  ];

  return (
    <div className="space-y-7">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Paso 3 de 4</p>
        <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">Análisis de IA</h2>
        <p className="text-sm text-slate-400 mt-1">Nuestro modelo analiza tus fotos y valida la información del siniestro.</p>
      </div>

      <div className="bg-[#0B1E3D] rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-white/5" />
        <div className="absolute -right-2 -top-2 w-24 h-24 rounded-full border border-white/5" />

        <div className="relative z-10 flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${phase === 2 ? 'bg-emerald-400' : 'bg-white/10'}`}>
            {phase === 2
              ? <CheckCircle2 size={22} className="text-white" />
              : <Brain size={22} className="text-white/70 animate-pulse" />}
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {phase === 0 ? 'Escaneando fotografías...' : phase === 1 ? 'Analizando consistencia...' : 'Análisis completado'}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">
              {phase === 0 ? 'Detectando metadatos y daños visibles' : phase === 1 ? 'Verificando GPS, fechas y patrones' : 'Sin anomalías detectadas'}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          {checks.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${item.done ? 'bg-emerald-400' : 'bg-white/5 border border-white/10'}`}>
                {item.done ? <CheckCircle2 size={12} className="text-white" /> : <item.icon size={12} className="text-white/20" />}
              </div>
              <span className={`text-xs font-medium transition-colors ${item.done ? 'text-white/70' : 'text-white/25'}`}>{item.label}</span>
              {!item.done && <Clock size={11} className="ml-auto text-white/15 animate-spin" style={{ animationDuration: '3s' }} />}
            </div>
          ))}
        </div>
      </div>

      {phase === 2 && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Score de Riesgo</span>
              <span className="text-2xl font-bold text-emerald-500">{score}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${score}%` }} />
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
              <Sparkles size={13} />
              <p className="text-[11px] font-semibold">Riesgo bajo · validación automática aprobada</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Resumen del análisis</p>
            {[
              { label: 'Tipo de siniestro',         value: claimLabel },
              { label: 'Fotografías procesadas',    value: `${files.length} imagen${files.length !== 1 ? 'es' : ''}` },
              { label: 'Anomalías detectadas',      value: 'Ninguna' },
              { label: 'Estimado de cobertura',     value: '$45,000 – $60,000 MXN' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{row.label}</span>
                <span className="text-xs font-semibold text-[#0B1E3D]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#0B1E3D] font-semibold rounded-xl transition-all text-sm flex items-center gap-2">
          <ArrowLeft size={15} /> Atrás
        </button>
        <button onClick={onNext} disabled={phase < 2}
          className="flex-1 py-3.5 bg-[#0B1E3D] hover:bg-[#071328] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
          Confirmar y enviar <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

/* ── Step 4: Confirmation ── */
const StepConfirm = ({ data, files, navigate }: { data: ClaimData, files: File[], navigate: any }) => {
  const claimId = React.useMemo(() => `CLM-2026-${String(Math.floor(Math.random() * 900) + 100)}`, []);
  const claimLabel = CLAIM_TYPES.find(c => c.id === data.type)?.label || data.type;

  return (
    <div className="space-y-7 text-center">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0B1E3D] tracking-tight">¡Reclamación enviada!</h2>
          <p className="text-sm text-slate-400 mt-1">Tu caso fue registrado y está en revisión.</p>
        </div>
      </div>

      <div className="bg-[#0B1E3D] rounded-3xl p-7 text-left space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">ID de reclamación</span>
          <span className="text-sm font-bold text-white font-mono">{claimId}</span>
        </div>
        <div className="h-px bg-white/10" />
        {[
          { label: 'Tipo',         value: claimLabel },
          { label: 'Fecha',        value: data.date  || '—' },
          { label: 'Fotografías', value: `${files.length} adjunta${files.length !== 1 ? 's' : ''}` },
          { label: 'Estado',       value: 'En revisión' },
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

      <button onClick={() => navigate('/portal')}
        className="w-full py-3.5 bg-[#0B1E3D] hover:bg-[#071328] text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
        Volver al Portal
      </button>
    </div>
  );
};

/* ── Main wizard ── */
const NewClaim = () => {
  const navigate = useNavigate();
  const [step, setStep]   = useState(0);
  const [data, setData]   = useState<ClaimData>({ type: '', date: '', location: '', description: '', policy: '' });
  const [files, setFiles] = useState<File[]>([]);

  const updateData = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

  const addFiles = (newFiles: File[]) => {
    setFiles(prev => {
      // LÓGICA: Evitamos subir archivos duplicados basados en nombre y peso
      const existing = new Set(prev.map(f => f.name + f.size));
      return [...prev, ...newFiles.filter(f => !existing.has(f.name + f.size))].slice(0, 10);
    });
  };

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
          {step === 0 && <StepDetails data={data} onChange={updateData} onNext={() => setStep(1)} />}
          {step === 1 && <StepPhotos  files={files} onAdd={addFiles} onRemove={(i: number) => setFiles(f => f.filter((_, idx) => idx !== i))} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <StepAI      data={data} files={files} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <StepConfirm data={data} files={files} navigate={navigate} />}
        </div>
      </div>
    </div>
  );
};

export default NewClaim;