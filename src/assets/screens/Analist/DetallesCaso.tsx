import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  FileText,
  Calendar,
  MapPin,
} from "lucide-react";

export default function DetalleCasoForense() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("vista-general");

  // Datos basados exactamente en la imagen proporcionada
  const caseData = {
    id: "CLM-2024-007",
    client: {
      name: "Juan Pérez",
      policy: "POL-2023-456",
      vehicle: "Honda Accord 2019",
      phone: "+52 55 1234 5678",
    },
    incident: {
      type: "Colisión múltiple",
      date: "2026-03-21 14:30",
      location: "Av. Insurgentes Sur 1234, CDMX",
      description: "Colisión trasera en zona de alto tráfico. El asegurado reporta que fue impactado por detrás mientras esperaba en semáforo.",
    },
    riskScore: 92,
    flags: ["Foto editada", "GPS no coincide", "Red detectada", "Costo excesivo"],
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#1A202C] p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Superior */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-600 hover:text-black text-sm mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Volver al Panel
            </button>
            <h1 className="text-3xl font-bold mb-1">{caseData.id}</h1>
            <p className="text-gray-500 text-sm">{caseData.client.name} • {caseData.incident.type}</p>
          </div>
          <div className="bg-[#E53E3E] text-white px-6 py-2 rounded-lg font-bold">
            Riesgo: {caseData.riskScore}%
          </div>
        </div>

        {/* Alertas Detectadas */}
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-[#E53E3E]" size={20} />
            <span className="text-[#C53030] font-bold text-sm">Alertas detectadas por el sistema</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {caseData.flags.map((flag, i) => (
              <span key={i} className="bg-white border border-[#FED7D7] px-3 py-1 rounded-full text-[11px] font-semibold text-[#C53030]">
                {flag}
              </span>
            ))}
          </div>
        </div>

        {/* Navegación de Pestañas */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {["Vista General", "Análisis de Imágenes", "Explicabilidad IA"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(/ /g, "-"))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.toLowerCase().replace(/ /g, "-") 
                  ? "bg-white shadow-sm text-black" 
                  : "text-gray-500 hover:bg-gray-100"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sección de Información Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tarjeta de Cliente */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-6 flex items-center gap-2">
              <User size={18} /> Información del Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Nombre</p>
                <p className="font-semibold">{caseData.client.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Póliza</p>
                <p className="font-semibold">{caseData.client.policy}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Vehículo</p>
                <p className="font-semibold">{caseData.client.vehicle}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase">Teléfono</p>
                <p className="font-semibold">{caseData.client.phone}</p>
              </div>
            </div>
          </div>

          {/* Tarjeta de Siniestro */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-6 flex items-center gap-2">
              <FileText size={18} /> Detalles del Siniestro
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Fecha y Hora</p>
                </div>
                <p className="font-semibold">{caseData.incident.date}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-gray-400" />
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Ubicación</p>
                </div>
                <p className="font-semibold">{caseData.incident.location}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Descripción</p>
                <p className="text-sm text-gray-600 leading-relaxed">{caseData.incident.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Decisión Final */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-6">Panel de Decisión Final</h3>
          <div className="mb-6">
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-2">
              Notas Legales (Encriptadas con Cloud KMS)
            </label>
            <textarea 
              className="w-full bg-[#F7FAFC] border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
              placeholder="Agregar notas sobre la decisión tomada..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-[#38A169] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#2F855A] transition-colors">
              <CheckCircle2 size={18} /> Aprobar Reclamación
            </button>
            <button className="bg-[#E53E3E] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#C53030] transition-colors">
              <XCircle size={18} /> Rechazar Reclamación
            </button>
            <button className="border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <AlertTriangle size={18} /> Escalar a Investigación
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}