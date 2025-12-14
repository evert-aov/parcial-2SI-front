import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BookOpen, Clock, Calendar, GraduationCap, MapPin, Users } from 'lucide-react';
import API_URL from '../config/api';

export default function MiCargaHoraria() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMiCargaHoraria();
  }, []);

  const fetchMiCargaHoraria = async () => {
    try {
      const token = localStorage.getItem('token');
      // Obtener datos del usuario para verificar rol (opcional, pero buena práctica)
      // Por ahora confiamos en el endpoint
      
      const response = await fetch(`${API_URL}/api/docentes/mi-horario`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const err = await response.json();
        setError(err.message || 'Error al cargar la carga horaria');
        // Si es 404, es probable que el usuario no sea docente
        if (response.status === 404) {
          setError('No tienes un perfil de docente asignado.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Cargando tu información académica...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            background: '#fee2e2', 
            marginBottom: '1rem' 
          }}>
            <GraduationCap size={48} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>
            Acceso Restringido o Perfil No Encontrado
          </h2>
          <p style={{ color: '#64748b' }}>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Mi Carga Horaria</h1>
          <p className="page-header__subtitle">
            Hola, {data.docente.nombre}. Aquí tienes el resumen de tus actividades académicas.
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#e0e7ff' }}>
            <BookOpen size={24} color="#4f46e5" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Materias</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {data.estadisticas.total_materias}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#dcfce7' }}>
            <Clock size={24} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Horas Semanales de Clases</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {data.estadisticas.total_horas} hrs
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#fef3c7' }}>
            <GraduationCap size={24} color="#d97706" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Especialidad</p>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#0f172a' }}>
              {data.docente.especialidad || 'General'}
            </h3>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a' }}>
        Mis Asignaturas y Horarios
      </h2>

      {data.asignaciones.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          No tienes asignaturas programadas para la gestión activa.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {data.asignaciones.map((asig) => (
            <div key={asig.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ 
                padding: '1.25rem', 
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {asig.materia} <span style={{ fontWeight: '400', color: '#64748b' }}>({asig.sigla})</span>
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={14} /> Grupo: <strong>{asig.grupo}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <GraduationCap size={14} /> Carrera: {asig.carrera}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} /> Gestión: {asig.gestion}
                    </span>
                  </div>
                </div>
                {/* Badge de Horas */}
                <div style={{ 
                  backgroundColor: '#e0e7ff', 
                  color: '#4338ca', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  alignSelf: 'center'
                }}>
                  {asig.horarios.length * 1.5} hrs/semana
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '600', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                  Horario de Clases
                </h4>
                
                {asig.horarios.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin horarios definidos</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {asig.horarios.map((h, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        backgroundColor: '#fff',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '0.375rem', 
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          display: 'flex', 
                          flexDirection: 'column',
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          lineHeight: '1.1'
                        }}>
                          <span>{h.dia_abrev.substring(0, 3).toUpperCase()}</span>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Clock size={14} color="#6366f1" /> {h.inicio} - {h.fin}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                            <MapPin size={14} color="#ef4444" /> Aula: {h.aula} ({h.aula_nombre})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
