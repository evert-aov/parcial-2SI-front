import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import API_URL from '../config/api';

export default function MisAsistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    fetchAsistencias();
  }, []);

  const fetchAsistencias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/asistencias/mis-asistencias`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAsistencias(data.asistencias || []);
      setEstadisticas(data.estadisticas);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      presente: { background: '#dcfce7', color: '#166534', icon: <CheckCircle size={16} /> },
      retrasado: { background: '#fef3c7', color: '#92400e', icon: <Clock size={16} /> },
      falta: { background: '#fee2e2', color: '#991b1b', icon: <XCircle size={16} /> }
    };
    const style = styles[estado] || styles.falta;
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: '600',
        ...style
      }}>
        {style.icon}
        {estado.toUpperCase()}
      </span>
    );
  };

  const asistenciasFiltradas = filtroEstado
    ? asistencias.filter(a => a.estado === filtroEstado)
    : asistencias;

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Mis Asistencias</h1>
          <p className="page-header__subtitle">Historial de asistencia personal</p>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
            <div className="card__body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={24} color="#166534" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534' }}>Presentes</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#166534', margin: 0 }}>{estadisticas.presentes}</p>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
            <div className="card__body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={24} color="#92400e" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#92400e' }}>Retrasados</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e', margin: 0 }}>{estadisticas.retrasados}</p>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
            <div className="card__body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <XCircle size={24} color="#991b1b" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b' }}>Faltas</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b', margin: 0 }}>{estadisticas.faltas}</p>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
            <div className="card__body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={24} color="#1e40af" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>% Asistencia</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af', margin: 0 }}>{estadisticas.porcentaje_asistencia}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card__body" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '600' }}>Filtrar:</label>
          <button
            className={`btn ${!filtroEstado ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setFiltroEstado('')}
          >
            Todos
          </button>
          <button
            className={`btn ${filtroEstado === 'presente' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setFiltroEstado('presente')}
          >
            Presentes
          </button>
          <button
            className={`btn ${filtroEstado === 'retrasado' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setFiltroEstado('retrasado')}
          >
            Retrasados
          </button>
          <button
            className={`btn ${filtroEstado === 'falta' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setFiltroEstado('falta')}
          >
            Faltas
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Historial de Asistencias</h3>
        </div>
        <div className="card__body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora Marcada</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {asistenciasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No hay registros de asistencia
                    </td>
                  </tr>
                ) : (
                  asistenciasFiltradas.map(asistencia => (
                    <tr key={asistencia.id}>
                      <td>{new Date(asistencia.fecha).toLocaleDateString()}</td>
                      <td>{asistencia.hora_marcada}</td>
                      <td>{getEstadoBadge(asistencia.estado)}</td>
                      <td>{asistencia.observaciones || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
