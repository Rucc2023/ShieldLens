import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginScreen from './assets/screens/Login';
import ClientPortal from './assets/screens/client/ClientPortal';
import NewClaim from './assets/screens/client/NuevoReclamo';
import ClaimStatus from './assets/screens/client/EstatusReclamos';
import ForensicAnalysis from './assets/screens/Analist/Forense';
import DetalleCasoForense from './assets/screens/Analist/DetallesCaso';
import AdminPanel from './assets/screens/Admin/PanelAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LoginScreen />} />

        {/* Rutas del Cliente */}
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/portal/nuevo-reclamo" element={<NewClaim />} />
        {/* Añadimos :id para que sea una ruta dinámica */}
        <Route path="/portal/estatus-reclamos/:id" element={<ClaimStatus />} />

        {/* Rutas del Analista */}
        <Route path="/analyst" element={<ForensicAnalysis />} />
        {/* También aquí sugiero usar :id más adelante para los detalles del caso */}
        <Route path="/analyst/case-details/:id" element={<DetalleCasoForense />} />

        {/* Rutas de Administración */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;