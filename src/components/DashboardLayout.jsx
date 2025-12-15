import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Key, 
  BookOpen,
  UsersRound,
  ClipboardList,
  Calendar,
  GraduationCap,
  UserCircle, 
  LogOut,
  Menu,
  X,
  Clock,
  CalendarDays,
  DoorOpen,
  CalendarCheck,
  Contact,
  FileBarChart,
  Settings,
  Upload,
  QrCode,
  ScanLine,
  ClipboardCheck
} from 'lucide-react';
import '../styles/dashboard.css';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // En móvil, el sidebar comienza cerrado
    return window.innerWidth > 768;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Administrador'] },
    { path: '/dashboard/roles', icon: Shield, label: 'Roles', roles: ['Administrador'] },
    { path: '/dashboard/usuarios', icon: Users, label: 'Usuarios', roles: ['Administrador'] },
    { path: '/dashboard/permisos', icon: Key, label: 'Permisos', roles: ['Administrador'] },
    { path: '/dashboard/carreras', icon: GraduationCap, label: 'Carreras', roles: ['Administrador'] },
    { path: '/dashboard/materias', icon: BookOpen, label: 'Materias', roles: ['Administrador'] },
    { path: '/dashboard/grupos', icon: UsersRound, label: 'Grupos', roles: ['Administrador'] },
    { path: '/dashboard/gestiones', icon: Calendar, label: 'Gestiones', roles: ['Administrador'] },
    { path: '/dashboard/dias', icon: CalendarDays, label: 'Días', roles: ['Administrador'] },
    { path: '/dashboard/horarios', icon: Clock, label: 'Horarios', roles: ['Administrador'] },
    { path: '/dashboard/aulas', icon: DoorOpen, label: 'Aulas', roles: ['Administrador'] },
    { path: '/dashboard/asignaciones', icon: ClipboardList, label: 'Asignaciones', roles: ['Administrador'] },
    { path: '/dashboard/reservas', icon: CalendarCheck, label: 'Reservas', roles: ['Administrador', 'Docente'] },
    { path: '/dashboard/mi-horario', icon: Contact, label: 'Mi Horario', roles: ['Docente'] },
    { path: '/dashboard/reportes', icon: FileBarChart, label: 'Reportes', roles: ['Administrador'] },
    { path: '/dashboard/reportes-dinamicos', icon: Settings, label: 'Reportes Dinámicos', roles: ['Administrador'] },
    { path: '/dashboard/importar-usuarios', icon: Upload, label: 'Importar Usuarios', roles: ['Administrador'] },
    { path: '/dashboard/generar-qr', icon: QrCode, label: 'Generar QR', roles: ['Administrador'] },
    { path: '/dashboard/mis-qrs', icon: QrCode, label: 'Mis QRs', roles: ['Docente'] },
    { path: '/dashboard/escanear-asistencia', icon: ScanLine, label: 'Escanear Asistencia', roles: ['Docente'] },
    { path: '/dashboard/mis-asistencias', icon: ClipboardCheck, label: 'Mis Asistencias', roles: ['Docente'] },
  ];

  // Filtrar menú según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.rol)
  );

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleOverlayClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__brand-icon">
              <LayoutDashboard size={24} />
            </div>
            {sidebarOpen && <span>AulaVirtual</span>}
          </div>
          <button 
            className="sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar__nav">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar__item ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <UserCircle size={20} />
            {sidebarOpen && (
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">
                  {user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                </span>
                <span className="sidebar__user-role">{user.rol || 'Sin rol'}</span>
              </div>
            )}
          </div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <LogOut size={20} />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="mobile-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <div className="mobile-header__title">AulaVirtual</div>
        </div>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
