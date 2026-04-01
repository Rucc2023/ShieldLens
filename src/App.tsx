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
        <Route path="/" element={<LoginScreen />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/portal/nuevo-reclamo" element={<NewClaim />} />
        <Route path="/portal/estatus-reclamos" element={<ClaimStatus />} />
        <Route path="/analyst" element={<ForensicAnalysis />} />
        <Route path="/analyst/case-details" element={<DetalleCasoForense />} />
        <Route path="/admin" element={<AdminPanel />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;