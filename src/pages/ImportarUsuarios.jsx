import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import API_URL from '../config/api';

export default function ImportarUsuarios() {
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV');
        return;
      }
      setArchivo(file);
      setResultado(null);
    }
  };

  const handleImport = async () => {
    if (!archivo) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await fetch(`${API_URL}/api/import/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setResultado(data);
        setArchivo(null);
        // Limpiar input
        document.getElementById('file-input').value = '';
      } else {
        alert(data.message || 'Error al importar usuarios');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al importar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const descargarPlantilla = () => {
    // Crear plantilla Excel manualmente
    const plantilla = [
      ['nombre', 'apellido', 'correo', 'ci', 'telefono', 'sexo', 'direccion', 'especialidad', 'grado_academico', 'fecha_contratacion'],
      ['Juan', 'Pérez', 'juan.perez@example.com', '12345678', '70123456', 'M', 'Av. Ejemplo #123', 'Matemáticas', 'Licenciatura', '2024-01-15'],
      ['María', 'González', 'maria.gonzalez@example.com', '87654321', '71234567', 'F', 'Calle Principal #456', 'Física', 'Maestría', '2024-02-20'],
    ];

    // Convertir a CSV
    const csv = plantilla.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla_usuarios.csv';
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Importar Usuarios</h1>
          <p className="page-header__subtitle">Importación masiva de docentes desde Excel</p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #e0e7ff 0%, #dbeafe 100%)', border: '1px solid #93c5fd' }}>
        <div className="card__body" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            Instrucciones de Importación
          </h3>
          <ul style={{ color: '#1e40af', fontSize: '0.875rem', lineHeight: '1.75', paddingLeft: '1.5rem' }}>
            <li><strong>Campos obligatorios:</strong> nombre, apellido, correo, ci</li>
            <li><strong>Campos opcionales:</strong> telefono, sexo, direccion, especialidad, grado_academico, fecha_contratacion</li>
            <li><strong>Password automático:</strong> Se asignará el número de CI como contraseña</li>
            <li><strong>Rol automático:</strong> Todos los usuarios importados serán "Docentes"</li>
            <li><strong>Validaciones:</strong> El CI y correo deben ser únicos</li>
            <li><strong>Formato de sexo:</strong> M o F (Masculino o Femenino)</li>
            <li><strong>Formato de fecha:</strong> YYYY-MM-DD (ejemplo: 2024-01-15)</li>
          </ul>
        </div>
      </div>

      {/* Descarga de Plantilla */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <FileSpreadsheet size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Plantilla de Excel
          </h3>
        </div>
        <div className="card__body" style={{ padding: '1.5rem' }}>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            Descarga la plantilla de ejemplo para ver el formato correcto del archivo
          </p>
          <button className="btn btn--secondary" onClick={descargarPlantilla}>
            <Download size={18} />
            Descargar Plantilla CSV
          </button>
        </div>
      </div>

      {/* Subida de Archivo */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <Upload size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Subir Archivo
          </h3>
        </div>
        <div className="card__body" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Seleccionar archivo Excel o CSV</label>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="form-input"
            />
            {archivo && (
              <p style={{ marginTop: '0.5rem', color: '#16a34a', fontSize: '0.875rem' }}>
                ✓ Archivo seleccionado: {archivo.name}
              </p>
            )}
          </div>
          <button
            className="btn btn--primary"
            onClick={handleImport}
            disabled={!archivo || loading}
          >
            {loading ? 'Importando...' : 'Importar Usuarios'}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Resultado de Importación</h3>
          </div>
          <div className="card__body" style={{ padding: '1.5rem' }}>
            {/* Resumen */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '0.5rem', border: '1px solid #86efac' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={20} color="#16a34a" />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#166534' }}>Importados</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#166534' }}>{resultado.importados}</p>
              </div>

              <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: '0.5rem', border: '1px solid #fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <XCircle size={20} color="#dc2626" />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b' }}>Errores</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#991b1b' }}>{resultado.total_errores}</p>
              </div>
            </div>

            {/* Lista de Errores */}
            {resultado.errores && resultado.errores.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#dc2626' }}>
                  Detalles de Errores:
                </h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto', background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#991b1b', fontSize: '0.875rem' }}>
                    {resultado.errores.map((error, index) => (
                      <li key={index} style={{ marginBottom: '0.5rem' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {resultado.importados > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem', border: '1px solid #86efac' }}>
                <p style={{ color: '#166534', fontSize: '0.875rem', margin: 0 }}>
                  ✓ Los usuarios importados pueden iniciar sesión con su número de CI como contraseña
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
