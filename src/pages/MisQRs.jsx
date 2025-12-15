import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import API_URL from '../config/api';

export default function MisQRs() {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState('');
  const [dia, setDia] = useState('');

  useEffect(() => {
    fetchQRs();
  }, []);

  const fetchQRs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching QRs from:', `${API_URL}/api/asistencias/mis-qrs-hoy`);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_URL}/api/asistencias/mis-qrs-hoy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        console.log('Clases recibidas:', data.clases?.length || 0);
        setClases(data.clases || []);
        setFecha(data.fecha);
        setDia(data.dia);
      } else {
        console.error('Error response:', data);
        alert(`Error: ${data.message || 'No se pudieron cargar los QR codes'}`);
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error de conexión al cargar QR codes');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const styles = {
      presente: { bg: '#dcfce7', color: '#166534', icon: <CheckCircle size={16} /> },
      retrasado: { bg: '#fef3c7', color: '#92400e', icon: <Clock size={16} /> },
      falta: { bg: '#fee2e2', color: '#991b1b', icon: <XCircle size={16} /> }
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
        background: style.bg,
        color: style.color
      }}>
        {style.icon}
        {estado.toUpperCase()}
      </span>
    );
  };

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
          <h1 className="page-header__title">Mis Códigos QR</h1>
          <p className="page-header__subtitle">Códigos QR generados automáticamente para tus clases de hoy</p>
        </div>
        <button className="btn btn--secondary" onClick={fetchQRs}>
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {/* Info del día */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
        <div className="card__body" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={24} color="#1e40af" />
            <div>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>Fecha</p>
              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>
                {new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={24} color="#1e40af" />
            <div>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>Total de clases</p>
              <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e3a8a', margin: 0 }}>{clases.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clases */}
      {clases.length === 0 ? (
        <div className="card">
          <div className="card__body" style={{ padding: '3rem', textAlign: 'center' }}>
            <Calendar size={64} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
            <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No tienes clases hoy</h3>
            <p style={{ color: '#94a3b8' }}>Disfruta tu día libre 🎉</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {clases.map((clase, index) => {
            console.log('Clase QR SVG type:', typeof clase.qr_svg, clase.qr_svg);
            return (
            <div 
              key={index} 
              className="card" 
              style={{ 
                border: clase.ya_marco ? '2px solid #16a34a' : '2px solid #e2e8f0',
                position: 'relative'
              }}
            >
              {clase.ya_marco && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  zIndex: 10
                }}>
                  {getEstadoBadge(clase.estado_marcado)}
                </div>
              )}
              
              <div className="card__header">
                <h3 className="card__title" style={{ fontSize: '1.125rem' }}>{clase.materia}</h3>
              </div>
              
              <div className="card__body" style={{ padding: '1.5rem' }}>
                {/* Info de la clase */}
                <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                    <strong>Grupo:</strong> {clase.grupo}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                    <strong>Aula:</strong> {clase.aula}
                  </p>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.875rem' }}>
                    <strong>Horario:</strong> {clase.hora_inicio} - {clase.hora_fin}
                  </p>
                  {clase.ya_marco && (
                    <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: '#16a34a', fontWeight: '600' }}>
                      <strong>Marcado a las:</strong> {clase.hora_marcada}
                    </p>
                  )}
                </div>

                {/* QR Code */}
                <div style={{ 
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  opacity: clase.ya_marco ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div id={`qr-${index}`}>
                    <QRCodeSVG 
                      value={clase.qr_data} 
                      size={250} 
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  
                  <button
                    className="btn btn--secondary"
                    onClick={() => {
                      const svg = document.querySelector(`#qr-${index} svg`);
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                      const url = URL.createObjectURL(svgBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `QR-${clase.materia}-${clase.hora_inicio}.svg`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                  >
                    Descargar QR
                  </button>
                </div>
                {clase.ya_marco && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                    Asistencia ya marcada
                  </p>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
