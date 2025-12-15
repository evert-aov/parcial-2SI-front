import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, Clock } from 'lucide-react';
import API_URL from '../config/api';

export default function EscanearAsistencia() {
  const [scanning, setScanning] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250} },
        false
      );

      scanner.render(onScanSuccess, onScanError);

      return () => {
        scanner.clear();
      };
    }
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    setScanning(false);
    await marcarAsistencia(decodedText);
  };

  const onScanError = (err) => {
    // Silenciar errores de escaneo continuo
  };

  const marcarAsistencia = async (qrData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Intentar obtener geolocalización (opcional)
      let latitud = null;
      let longitud = null;
      
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 0
            });
          });
          latitud = position.coords.latitude;
          longitud = position.coords.longitude;
        }
      } catch (geoError) {
        console.warn('No se pudo obtener geolocalización, continuando sin ella:', geoError);
        // Continuar sin geolocalización
      }

      const response = await fetch(`${API_URL}/api/asistencias/marcar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qr_data: qrData,
          latitud,
          longitud
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResultado(data);
        setError(null);
      } else {
        setError(data.message || 'Error al marcar asistencia');
        setResultado(null);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al marcar asistencia: ' + (err.message || 'Error desconocido'));
      setResultado(null);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente': return '#16a34a';
      case 'retrasado': return '#d97706';
      case 'falta': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'presente': return <CheckCircle size={48} color="#16a34a" />;
      case 'retrasado': return <Clock size={48} color="#d97706" />;
      case 'falta': return <XCircle size={48} color="#dc2626" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Escanear Asistencia</h1>
          <p className="page-header__subtitle">Escanea el código QR para marcar tu asistencia</p>
        </div>
      </div>

      {!scanning && !resultado && !error && (
        <div className="card">
          <div className="card__body" style={{ padding: '3rem', textAlign: 'center' }}>
            <Camera size={64} style={{ margin: '0 auto 1.5rem', color: '#3b82f6' }} />
            <h3 style={{ marginBottom: '1rem' }}>Listo para escanear</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Presiona el botón para activar la cámara y escanear el código QR
            </p>
            <button
              className="btn btn--primary"
              onClick={() => setScanning(true)}
              style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}
            >
              <Camera size={20} />
              Activar Cámara
            </button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Escaneando...</h3>
          </div>
          <div className="card__body" style={{ padding: '1.5rem' }}>
            <div id="reader" style={{ width: '100%' }}></div>
            <button
              className="btn btn--secondary"
              onClick={() => setScanning(false)}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {resultado && (
        <div className="card" style={{ border: `2px solid ${getEstadoColor(resultado.estado)}` }}>
          <div className="card__body" style={{ padding: '3rem', textAlign: 'center' }}>
            {getEstadoIcon(resultado.estado)}
            <h2 style={{ margin: '1.5rem 0 0.5rem', color: getEstadoColor(resultado.estado), textTransform: 'uppercase' }}>
              {resultado.estado}
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#64748b', marginBottom: '2rem' }}>
              {resultado.message}
            </p>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Hora de inicio:</strong> {resultado.hora_inicio}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Hora marcada:</strong> {resultado.hora_marcada}
              </p>
              <p style={{ margin: '0.5rem 0' }}>
                <strong>Diferencia:</strong> {Math.abs(resultado.diferencia_minutos)} minutos
                {resultado.diferencia_minutos < 0 ? ' (anticipado)' : resultado.diferencia_minutos > 0 ? ' (tarde)' : ''}
              </p>
            </div>

            <button
              className="btn btn--primary"
              onClick={() => {
                setResultado(null);
                setError(null);
              }}
              style={{ width: '100%' }}
            >
              Escanear Otro QR
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ border: '2px solid #dc2626' }}>
          <div className="card__body" style={{ padding: '3rem', textAlign: 'center' }}>
            <XCircle size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error}</p>
            <button
              className="btn btn--primary"
              onClick={() => {
                setResultado(null);
                setError(null);
              }}
              style={{ width: '100%' }}
            >
              Intentar Nuevamente
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
