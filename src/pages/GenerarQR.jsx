import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import API_URL from '../config/api';

export default function GenerarQR() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [selectedAsignacion, setSelectedAsignacion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/asignaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Extraer asignacion_horarios de todas las asignaciones
      const horarios = [];
      if (Array.isArray(data)) {
        data.forEach(asignacion => {
          if (asignacion.asignacion_horarios && Array.isArray(asignacion.asignacion_horarios)) {
            asignacion.asignacion_horarios.forEach(ah => {
              horarios.push({
                id: ah.id,
                materia: asignacion.materia?.nombre || 'Sin materia',
                docente: asignacion.docente?.usuario?.nombre || 'Sin docente',
                dia: ah.dia?.nombre || 'Sin día',
                hora_inicio: ah.horario?.hora_inicio || '',
                hora_fin: ah.horario?.hora_fin || '',
                aula: ah.aula?.nombre || 'Sin aula'
              });
            });
          }
        });
      }
      setAsignaciones(horarios);
    } catch (error) {
      console.error('Error:', error);
      setAsignaciones([]);
    }
  };

  const generarQR = async () => {
    if (!selectedAsignacion || !fecha) {
      alert('Selecciona una asignación y fecha');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/asistencias/generar-qr`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asignacion_horario_id: selectedAsignacion,
          fecha: fecha
        })
      });

      const data = await response.json();
      if (response.ok) {
        setQrData(data);
      } else {
        alert(data.message || 'Error al generar QR');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = () => {
    const canvas = document.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(canvas);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-Asistencia-${fecha}.svg`;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Generar Código QR</h1>
          <p className="page-header__subtitle">Genera códigos QR para control de asistencia</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Formulario */}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Configuración</h3>
          </div>
          <div className="card__body" style={{ padding: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Asignación de Horario</label>
              <select
                className="form-select"
                value={selectedAsignacion}
                onChange={(e) => setSelectedAsignacion(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {asignaciones.map(asig => (
                  <option key={asig.id} value={asig.id}>
                    {asig.materia} - {asig.dia} {asig.hora_inicio}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <button
              className="btn btn--primary"
              onClick={generarQR}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Generando...' : 'Generar QR'}
            </button>
          </div>
        </div>

        {/* QR Code */}
        {qrData && (
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Código QR Generado</h3>
            </div>
            <div className="card__body" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <QRCodeSVG value={qrData.data} size={300} level="H" />
              </div>

              <div style={{ marginBottom: '1rem', textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>Materia:</strong> {qrData.info.materia}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>Día:</strong> {qrData.info.dia}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>Horario:</strong> {qrData.info.hora_inicio} - {qrData.info.hora_fin}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  <strong>Fecha:</strong> {qrData.info.fecha}
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#d97706' }}>
                  <strong>Válido hasta:</strong> {new Date(qrData.info.valido_hasta).toLocaleString()}
                </p>
              </div>

              <button className="btn btn--secondary" onClick={descargarQR} style={{ width: '100%' }}>
                <Download size={18} />
                Descargar QR
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
