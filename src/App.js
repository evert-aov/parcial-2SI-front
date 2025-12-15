import { Routes, Route } from 'react-router-dom';
import './App.css';
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import Roles from './pages/Roles';
import Usuarios from './pages/Usuarios';
import Permisos from './pages/Permisos';
import Carreras from './pages/Carreras';
import Materias from './pages/Materias';
import Grupos from './pages/Grupos';
import Gestiones from './pages/Gestiones';
import Dias from './pages/Dias';
import Horarios from './pages/Horarios';
import Aulas from './pages/Aulas';
import Asignaciones from './pages/Asignaciones';
import Reservas from './pages/Reservas';
import MiCargaHoraria from './pages/MiCargaHoraria';
import Reportes from './pages/Reportes';
import ReportesDinamicos from './pages/ReportesDinamicos';
import ImportarUsuarios from './pages/ImportarUsuarios';
import GenerarQR from './pages/GenerarQR';
import EscanearAsistencia from './pages/EscanearAsistencia';
import MisAsistencias from './pages/MisAsistencias';
import MisQRs from './pages/MisQRs';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardHome />} />
      <Route path="/dashboard/roles" element={<Roles />} />
      <Route path="/dashboard/usuarios" element={<Usuarios />} />
      <Route path="/dashboard/permisos" element={<Permisos />} />
      <Route path="/dashboard/carreras" element={<Carreras />} />
      <Route path="/dashboard/materias" element={<Materias />} />
      <Route path="/dashboard/grupos" element={<Grupos />} />
      <Route path="/dashboard/gestiones" element={<Gestiones />} />
      <Route path="/dashboard/dias" element={<Dias />} />
      <Route path="/dashboard/horarios" element={<Horarios />} />
      <Route path="/dashboard/aulas" element={<Aulas />} />
      <Route path="/dashboard/asignaciones" element={<Asignaciones />} />
      <Route path="/dashboard/reservas" element={<Reservas />} />
      <Route path="/dashboard/mi-horario" element={<MiCargaHoraria />} />
      <Route path="/dashboard/reportes" element={<Reportes />} />
      <Route path="/dashboard/reportes-dinamicos" element={<ReportesDinamicos />} />
      <Route path="/dashboard/importar-usuarios" element={<ImportarUsuarios />} />
      <Route path="/dashboard/generar-qr" element={<GenerarQR />} />
      <Route path="/dashboard/escanear-asistencia" element={<EscanearAsistencia />} />
      <Route path="/dashboard/mis-asistencias" element={<MisAsistencias />} />
      <Route path="/dashboard/mis-qrs" element={<MisQRs />} />
    </Routes>
  );
}

export default App;
