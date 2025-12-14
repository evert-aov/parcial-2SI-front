import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Database, 
  Plus, 
  Trash2, 
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter as FilterIcon
} from 'lucide-react';
import API_URL from '../config/api';
import { jsPDF } from 'jspdf';

export default function ReportesDinamicos() {
  const [tablas, setTablas] = useState([]);
  const [tablaSeleccionada, setTablaSeleccionada] = useState('');
  const [columnasDisponibles, setColumnasDisponibles] = useState([]);
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [ordenamiento, setOrdenamiento] = useState({ campo: '', direccion: 'asc' });
  const [limite, setLimite] = useState(100);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTablas, setLoadingTablas] = useState(true);

  const operadores = [
    { valor: '=', label: 'Igual a' },
    { valor: '!=', label: 'Diferente de' },
    { valor: '>', label: 'Mayor que' },
    { valor: '<', label: 'Menor que' },
    { valor: '>=', label: 'Mayor o igual' },
    { valor: '<=', label: 'Menor o igual' },
    { valor: 'LIKE', label: 'Contiene' },
    { valor: 'NOT LIKE', label: 'No contiene' },
  ];

  useEffect(() => {
    fetchTablasDisponibles();
  }, []);

  const fetchTablasDisponibles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/tablas-disponibles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTablas(data.tablas || []);
    } catch (error) {
      console.error('Error al cargar tablas:', error);
    } finally {
      setLoadingTablas(false);
    }
  };

  const handleTablaChange = (nombreTabla) => {
    setTablaSeleccionada(nombreTabla);
    const tabla = tablas.find(t => t.nombre === nombreTabla);
    setColumnasDisponibles(tabla?.columnas || []);
    setCamposSeleccionados([]);
    setFiltros([]);
    setResultados([]);
  };

  const toggleCampo = (nombreCampo) => {
    if (camposSeleccionados.includes(nombreCampo)) {
      setCamposSeleccionados(camposSeleccionados.filter(c => c !== nombreCampo));
    } else {
      setCamposSeleccionados([...camposSeleccionados, nombreCampo]);
    }
  };

  const agregarFiltro = () => {
    setFiltros([...filtros, { campo: '', operador: '=', valor: '' }]);
  };

  const eliminarFiltro = (index) => {
    setFiltros(filtros.filter((_, i) => i !== index));
  };

  const actualizarFiltro = (index, propiedad, valor) => {
    const nuevosFiltros = [...filtros];
    nuevosFiltros[index][propiedad] = valor;
    setFiltros(nuevosFiltros);
  };

  const generarReporte = async () => {
    if (!tablaSeleccionada || camposSeleccionados.length === 0) {
      alert('Selecciona una tabla y al menos un campo');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/generar-dinamico`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tabla: tablaSeleccionada,
          campos: camposSeleccionados,
          filtros: filtros.filter(f => f.campo && f.valor),
          orden: ordenamiento.campo ? ordenamiento : null,
          limite
        })
      });

      const data = await response.json();
      setResultados(data.datos || []);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      alert('Error al generar reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    if (!tablaSeleccionada || camposSeleccionados.length === 0) {
      alert('Genera un reporte primero');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/exportar-dinamico-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tabla: tablaSeleccionada,
          campos: camposSeleccionados,
          filtros: filtros.filter(f => f.campo && f.valor),
          orden: ordenamiento.campo ? ordenamiento : null,
          limite
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_${tablaSeleccionada}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar');
    }
  };

  const exportarPDF = () => {
    if (resultados.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Reporte: ${tablas.find(t => t.nombre === tablaSeleccionada)?.label || tablaSeleccionada}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);
    doc.text(`Total de registros: ${resultados.length}`, 14, 34);
    
    doc.setFontSize(9);
    doc.setTextColor(0);
    let y = 45;
    
    resultados.forEach((registro, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`Registro ${idx + 1}`, 14, y);
      doc.setFont(undefined, 'normal');
      y += 5;
      
      camposSeleccionados.forEach(campo => {
        const valor = registro[campo] !== null && registro[campo] !== undefined ? String(registro[campo]) : 'N/A';
        const label = columnasDisponibles.find(c => c.nombre === campo)?.label || campo;
        doc.text(`  ${label}: ${valor}`, 14, y);
        y += 5;
      });
      
      y += 3;
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`reporte_${tablaSeleccionada}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loadingTablas) {
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
          <h1 className="page-header__title">Reportes Dinámicos</h1>
          <p className="page-header__subtitle">Genera reportes personalizados de cualquier tabla</p>
        </div>
      </div>

      {/* Selector de Tabla */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <Database size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            1. Selecciona una Tabla
          </h3>
        </div>
        <div className="card__body">
          <select 
            className="form-input"
            value={tablaSeleccionada}
            onChange={(e) => handleTablaChange(e.target.value)}
            style={{ maxWidth: '400px' }}
          >
            <option value="">-- Selecciona una tabla --</option>
            {tablas.map(tabla => (
              <option key={tabla.nombre} value={tabla.nombre}>{tabla.label}</option>
            ))}
          </select>
        </div>
      </div>

      {tablaSeleccionada && (
        <>
          {/* Selector de Campos */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card__header">
              <h3 className="card__title">2. Selecciona los Campos</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn--sm"
                  onClick={() => setCamposSeleccionados(columnasDisponibles.map(c => c.nombre))}
                >
                  Seleccionar Todos
                </button>
                <button 
                  className="btn btn--sm"
                  onClick={() => setCamposSeleccionados([])}
                >
                  Deseleccionar Todos
                </button>
              </div>
            </div>
            <div className="card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {columnasDisponibles.map(columna => (
                  <label key={columna.nombre} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={camposSeleccionados.includes(columna.nombre)}
                      onChange={() => toggleCampo(columna.nombre)}
                    />
                    <span>{columna.label}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({columna.tipo})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card__header">
              <h3 className="card__title">
                <FilterIcon size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                3. Filtros (Opcional)
              </h3>
              <button className="btn btn--primary btn--sm" onClick={agregarFiltro}>
                <Plus size={16} />
                Agregar Filtro
              </button>
            </div>
            <div className="card__body">
              {filtros.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                  No hay filtros. Haz clic en "Agregar Filtro" para añadir uno.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filtros.map((filtro, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '0.75rem', alignItems: 'end' }}>
                      <div className="form-group">
                        <label className="form-label">Campo</label>
                        <select 
                          className="form-input"
                          value={filtro.campo}
                          onChange={(e) => actualizarFiltro(index, 'campo', e.target.value)}
                        >
                          <option value="">Seleccionar</option>
                          {columnasDisponibles.map(col => (
                            <option key={col.nombre} value={col.nombre}>{col.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Operador</label>
                        <select 
                          className="form-input"
                          value={filtro.operador}
                          onChange={(e) => actualizarFiltro(index, 'operador', e.target.value)}
                        >
                          {operadores.map(op => (
                            <option key={op.valor} value={op.valor}>{op.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Valor</label>
                        <input 
                          type="text"
                          className="form-input"
                          value={filtro.valor}
                          onChange={(e) => actualizarFiltro(index, 'valor', e.target.value)}
                          placeholder="Ingresa el valor"
                        />
                      </div>
                      <button 
                        className="btn btn--danger btn--sm"
                        onClick={() => eliminarFiltro(index)}
                        style={{ marginBottom: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Opciones */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card__header">
              <h3 className="card__title">4. Opciones</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Ordenar por</label>
                  <select 
                    className="form-input"
                    value={ordenamiento.campo}
                    onChange={(e) => setOrdenamiento({ ...ordenamiento, campo: e.target.value })}
                  >
                    <option value="">Sin ordenar</option>
                    {columnasDisponibles.map(col => (
                      <option key={col.nombre} value={col.nombre}>{col.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <select 
                    className="form-input"
                    value={ordenamiento.direccion}
                    onChange={(e) => setOrdenamiento({ ...ordenamiento, direccion: e.target.value })}
                  >
                    <option value="asc">Ascendente</option>
                    <option value="desc">Descendente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Límite de registros</label>
                  <input 
                    type="number"
                    className="form-input"
                    value={limite}
                    onChange={(e) => setLimite(parseInt(e.target.value) || 100)}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón Generar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <button 
              className="btn btn--primary"
              onClick={generarReporte}
              disabled={loading || camposSeleccionados.length === 0}
              style={{ minWidth: '200px' }}
            >
              <Search size={20} />
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>

          {/* Resultados */}
          {resultados.length > 0 && (
            <div className="card">
              <div className="card__header">
                <h3 className="card__title">Resultados ({resultados.length} registros)</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn--primary btn--sm" onClick={exportarPDF}>
                    <FileText size={16} />
                    PDF
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={exportarExcel}>
                    <FileSpreadsheet size={16} />
                    Excel
                  </button>
                </div>
              </div>
              <div className="card__body">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        {camposSeleccionados.map(campo => (
                          <th key={campo}>
                            {columnasDisponibles.find(c => c.nombre === campo)?.label || campo}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.map((registro, idx) => (
                        <tr key={idx}>
                          {camposSeleccionados.map(campo => (
                            <td key={campo}>
                              {registro[campo] !== null && registro[campo] !== undefined 
                                ? String(registro[campo]) 
                                : 'N/A'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
