import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  DoorOpen,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import API_URL from '../config/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = localStorage.getItem('rol');

  const COLORS = ['#4f46e5', '#16a34a', '#d97706', '#dc2626', '#8b5cf6'];

  // Redirigir a docentes a su horario
  useEffect(() => {
    if (userRole === 'Docente') {
      navigate('/dashboard/mi-horario');
    }
  }, [userRole, navigate]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch estadísticas del dashboard
      const statsRes = await fetch(`${API_URL}/api/reportes/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      // Usar datos reales del backend
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // En caso de error, usar valores por defecto
      setStats({
        total_usuarios: 0,
        docentes_activos: 0,
        total_materias: 0,
        materias_asignadas: 0,
        total_aulas: 0,
        aulas_en_uso: 0,
        reservas_pendientes: 0,
        reservas_aprobadas: 0,
        reservas_rechazadas: 0,
        reservas_canceladas: 0,
        asignaciones_por_dia: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando estadísticas...</div>
      </DashboardLayout>
    );
  }

  // Preparar datos para gráficas
  const reservasData = [
    { name: 'Pendientes', value: stats?.reservas_pendientes || 0, color: '#d97706' },
    { name: 'Aprobadas', value: stats?.reservas_aprobadas || 0, color: '#16a34a' },
    { name: 'Rechazadas', value: stats?.reservas_rechazadas || 0, color: '#dc2626' }
  ];

  const clasesData = stats?.asignaciones_por_dia?.map(dia => ({
    dia: dia.dia,
    clases: dia.total
  })) || [];

  const usageData = [
    { name: 'Docentes', activos: stats?.docentes_activos || 0, total: stats?.total_usuarios || 0 },
    { name: 'Materias', activos: stats?.materias_asignadas || 0, total: stats?.total_materias || 0 },
    { name: 'Aulas', activos: stats?.aulas_en_uso || 0, total: stats?.total_aulas || 0 }
  ];

  // Vista completa para Administradores
  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Dashboard Analítico</h1>
          <p className="page-header__subtitle">
            Bienvenido, {user.nombre || 'Usuario'} | Rol: {user.rol}
          </p>
        </div>
      </div>

      {/* Métricas Principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#e0e7ff' }}>
              <Users size={24} color="#4f46e5" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Usuarios</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: '0.25rem 0' }}>
                {stats?.total_usuarios || 0}
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>
              {stats?.docentes_activos || 0} docentes activos
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#dcfce7' }}>
              <BookOpen size={24} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Materias</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: '0.25rem 0' }}>
                {stats?.total_materias || 0}
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>
              {stats?.materias_asignadas || 0} asignadas
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#fef3c7' }}>
              <DoorOpen size={24} color="#d97706" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Aulas</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: '0.25rem 0' }}>
                {stats?.total_aulas || 0}
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ color: '#d97706', fontWeight: '600' }}>
              {stats?.aulas_en_uso || 0} en uso
            </span>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#fee2e2' }}>
              <AlertCircle size={24} color="#dc2626" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Reservas Pendientes</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', margin: '0.25rem 0' }}>
                {stats?.reservas_pendientes || 0}
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>
              {stats?.reservas_aprobadas || 0} aprobadas
            </span>
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Gráfica de Barras - Clases por Día */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <BarChart3 size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Distribución de Clases por Día
            </h3>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clasesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clases" fill="#4f46e5" name="Clases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Pastel - Estado de Reservas */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <PieChartIcon size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Estado de Reservas
            </h3>
          </div>
          <div className="card__body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reservasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reservasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfica de Área - Uso de Recursos */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Uso de Recursos (Activos vs Total)
          </h3>
        </div>
        <div className="card__body">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" stackId="1" stroke="#94a3b8" fill="#cbd5e1" name="Total" />
              <Area type="monotone" dataKey="activos" stackId="2" stroke="#4f46e5" fill="#818cf8" name="Activos/En Uso" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen de Actividad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <TrendingUp size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Resumen Académico
            </h3>
          </div>
          <div className="card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Docentes Activos</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{stats?.docentes_activos || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Materias Asignadas</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{stats?.materias_asignadas || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Aulas en Uso</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{stats?.aulas_en_uso || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">
              <Clock size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Detalles de Reservas
            </h3>
          </div>
          <div className="card__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fef3c7', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#d97706" />
                  <span style={{ color: '#78350f', fontSize: '0.875rem', fontWeight: '500' }}>Pendientes</span>
                </div>
                <span style={{ fontWeight: '700', color: '#78350f' }}>{stats?.reservas_pendientes || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#dcfce7', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <span style={{ color: '#14532d', fontSize: '0.875rem', fontWeight: '500' }}>Aprobadas</span>
                </div>
                <span style={{ fontWeight: '700', color: '#14532d' }}>{stats?.reservas_aprobadas || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fee2e2', borderRadius: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} color="#dc2626" />
                  <span style={{ color: '#7f1d1d', fontSize: '0.875rem', fontWeight: '500' }}>Rechazadas</span>
                </div>
                <span style={{ fontWeight: '700', color: '#7f1d1d' }}>{stats?.reservas_rechazadas || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Bienvenida */}
      <div className="card" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card__body" style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            ¡Bienvenido al Sistema de Gestión Académica!
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Utiliza el menú lateral para navegar entre las diferentes secciones del sistema
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
