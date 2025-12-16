import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  DoorOpen, 
  AlertCircle,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  FileText
} from 'lucide-react';
import API_URL from '../config/api';
import { jsPDF } from 'jspdf';

export default function Reportes() {
  const [stats, setStats] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [aulasDisponibles, setAulasDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingAulas, setLoadingAulas] = useState(false);
  
  // Filtros para horarios
  const [filtroCarrera, setFiltroCarrera] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroDocente, setFiltroDocente] = useState('');
  
  // Filtros para aulas disponibles
  const [fecha, setFecha] = useState('');
  const [horarioId, setHorarioId] = useState('');

  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Estados para Asistencias
  const [tipoAsistencia, setTipoAsistencia] = useState('docente');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [datosAsistencia, setDatosAsistencia] = useState(null);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchCatalogos();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reportes/dashboard-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch carreras
      const carrerasRes = await fetch(`${API_URL}/api/carreras`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCarreras(await carrerasRes.json());

      // Fetch grupos
      const gruposRes = await fetch(`${API_URL}/api/grupos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGrupos(await gruposRes.json());

      // Fetch docentes
      const docentesRes = await fetch(`${API_URL}/api/docentes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDocentes(await docentesRes.json());

      // Fetch horarios
      const horariosRes = await fetch(`${API_URL}/api/horarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHorariosDisponibles(await horariosRes.json());
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  const fetchHorarios = async () => {
    setLoadingHorarios(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filtroCarrera) params.append('carrera_id', filtroCarrera);
      if (filtroGrupo) params.append('grupo_id', filtroGrupo);
      if (filtroDocente) params.append('docente_id', filtroDocente);

      const response = await fetch(`${API_URL}/api/reportes/horarios-semanales?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHorarios(data.horarios || []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const fetchAulasDisponibles = async () => {
    if (!fecha || !horarioId) {
      alert('Por favor selecciona fecha y horario');
      return;
    }

    setLoadingAulas(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ fecha, horario_id: horarioId });
      
      const response = await fetch(`${API_URL}/api/reportes/aulas-disponibles?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAulasDisponibles(data.aulas_disponibles || []);
    } catch (error) {
      console.error('Error al consultar aulas:', error);
    } finally {
      setLoadingAulas(false);
    }
  };

  const exportarHorariosExcel = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filtroCarrera) params.append('carrera_id', filtroCarrera);
      if (filtroGrupo) params.append('grupo_id', filtroGrupo);
      if (filtroDocente) params.append('docente_id', filtroDocente);

      const response = await fetch(`${API_URL}/api/reportes/horarios-excel?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horarios_semanales_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar horarios');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar horarios');
    }
  };

  const exportarAulasExcel = async () => {
    if (!fecha || !horarioId) {
      alert('Por favor selecciona fecha y horario primero');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ fecha, horario_id: horarioId });
      
      const response = await fetch(`${API_URL}/api/reportes/aulas-disponibles-excel?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aulas_disponibles_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al exportar aulas disponibles');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al exportar aulas disponibles');
    }
  };

  const exportarHorariosPDF = () => {
    if (horarios.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Horarios Semanales', 14, 20);
    
    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sistema de Gestión Académica', 14, 28);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 14, 34);
    
    // Contenido
    doc.setFontSize(9);
    doc.setTextColor(0);
    let y = 45;
    
    horarios.forEach((h, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${idx + 1}. ${h.dia} - ${h.hora_inicio} a ${h.hora_fin}`, 14, y);
      doc.setFont(undefined, 'normal');
      y += 5;
      doc.text(`   Materia: ${h.sigla} - ${h.materia}`, 14, y);
      y += 5;
      doc.text(`   Docente: ${h.docente} | Grupo: ${h.grupo} | Aula: ${h.aula}`, 14, y);
      y += 5;
      doc.text(`   Carrera: ${h.carrera}`, 14, y);
      y += 8;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount} | Total: ${horarios.length} registros`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`horarios_semanales_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportarAulasPDF = () => {
    if (aulasDisponibles.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Aulas Disponibles', 14, 20);
    
    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Sistema de Gestión Académica', 14, 28);
    doc.text(`Fecha: ${fecha} | Generado: ${new Date().toLocaleString('es-ES')}`, 14, 34);
    
    // Contenido
    doc.setFontSize(10);
    doc.setTextColor(0);
    let y = 45;
    
    aulasDisponibles.forEach((aula, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${idx + 1}. ${aula.codigo} - ${aula.nombre}`, 14, y);
      doc.setFont(undefined, 'normal');
      y += 6;
      doc.text(`   Capacidad: ${aula.capacidad} personas | Tipo: ${aula.tipo} | Edificio: ${aula.edificio}`, 14, y);
      y += 10;
    });
    
    // Total
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total de aulas disponibles: ${aulasDisponibles.length}`, 14, y + 5);
    
    // Footer
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
    
    doc.save(`aulas_disponibles_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const fetchAsistencias = async () => {
    setLoadingAsistencias(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = tipoAsistencia === 'docente' 
        ? 'asistencias-docente' 
        : 'asistencias-grupo';
      
      const params = new URLSearchParams();
      if (tipoAsistencia === 'docente' && docenteSeleccionado) {
        params.append('docente_id', docenteSeleccionado);
      } else if (tipoAsistencia === 'grupo' && grupoSeleccionado) {
        params.append('grupo_id', grupoSeleccionado);
      }
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);

      const response = await fetch(`${API_URL}/api/reportes/${endpoint}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDatosAsistencia(data);
    } catch (error) {
      console.error('Error al cargar asistencias:', error);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando estadísticas...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Panel de Reportes</h1>
          <p className="page-header__subtitle">Estadísticas y reportes del sistema académico</p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#e0e7ff' }}>
            <Users size={24} color="#4f46e5" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Docentes Activos</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {stats?.docentes_activos || 0}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#dcfce7' }}>
            <BookOpen size={24} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Materias Asignadas</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {stats?.materias_asignadas || 0}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#fef3c7' }}>
            <DoorOpen size={24} color="#d97706" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Aulas en Uso</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {stats?.aulas_en_uso || 0}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#fee2e2' }}>
            <AlertCircle size={24} color="#dc2626" />
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Reservas Pendientes</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
              {stats?.reservas_pendientes || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Horarios Semanales */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <BarChart3 size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Horarios Semanales
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn--primary btn--sm"
              onClick={exportarHorariosPDF}
              disabled={horarios.length === 0}
            >
              <FileText size={16} />
              PDF
            </button>
            <button 
              className="btn btn--primary btn--sm"
              onClick={exportarHorariosExcel}
              disabled={horarios.length === 0}
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
          </div>
        </div>

        <div className="card__body">
          {/* Filtros */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Carrera</label>
              <select 
                className="form-input"
                value={filtroCarrera}
                onChange={(e) => setFiltroCarrera(e.target.value)}
              >
                <option value="">Todas</option>
                {carreras.map(c => (
                  <option key={c.idcarrera} value={c.idcarrera}>{c.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Grupo</label>
              <select 
                className="form-input"
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
              >
                <option value="">Todos</option>
                {grupos.map(g => (
                  <option key={g.idgrupo} value={g.idgrupo}>{g.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Docente</label>
              <select 
                className="form-input"
                value={filtroDocente}
                onChange={(e) => setFiltroDocente(e.target.value)}
              >
                <option value="">Todos</option>
                {docentes.map(d => (
                  <option key={d.coddocente} value={d.coddocente}>
                    {d.nombre} {d.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn--primary"
                onClick={fetchHorarios}
                disabled={loadingHorarios}
              >
                <Search size={16} />
                {loadingHorarios ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Tabla de Horarios */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Horario</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Grupo</th>
                  <th>Aula</th>
                  <th>Carrera</th>
                </tr>
              </thead>
              <tbody>
                {horarios.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      {loadingHorarios ? 'Cargando...' : 'Selecciona filtros y haz clic en Buscar'}
                    </td>
                  </tr>
                ) : (
                  horarios.map((h, idx) => (
                    <tr key={idx}>
                      <td><strong>{h.dia}</strong></td>
                      <td>{h.hora_inicio} - {h.hora_fin}</td>
                      <td>{h.sigla} - {h.materia}</td>
                      <td>{h.docente}</td>
                      <td>{h.grupo}</td>
                      <td><span className="badge badge--info">{h.aula}</span></td>
                      <td>{h.carrera}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Asistencias por Docente y Grupo */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card__header">
          <h3 className="card__title">
            <Users size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Asistencias por Docente y Grupo
          </h3>
        </div>

        <div className="card__body">
          {/* Filtros */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Reporte</label>
              <select 
                className="form-input"
                value={tipoAsistencia}
                onChange={(e) => setTipoAsistencia(e.target.value)}
              >
                <option value="docente">Por Docente</option>
                <option value="grupo">Por Grupo</option>
              </select>
            </div>

            {tipoAsistencia === 'docente' && (
              <div className="form-group">
                <label className="form-label">Docente</label>
                <select 
                  className="form-input"
                  value={docenteSeleccionado}
                  onChange={(e) => setDocenteSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar docente</option>
                  {docentes.map(d => (
                    <option key={d.coddocente} value={d.coddocente}>
                      {d.nombre} {d.apellido}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {tipoAsistencia === 'grupo' && (
              <div className="form-group">
                <label className="form-label">Grupo</label>
                <select 
                  className="form-input"
                  value={grupoSeleccionado}
                  onChange={(e) => setGrupoSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar grupo</option>
                  {grupos.map(g => (
                    <option key={g.idgrupo} value={g.idgrupo}>{g.nombre}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Fecha Inicio</label>
              <input 
                type="date"
                className="form-input"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Fin</label>
              <input 
                type="date"
                className="form-input"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn--primary"
                onClick={fetchAsistencias}
                disabled={loadingAsistencias}
              >
                <Search size={16} />
                {loadingAsistencias ? 'Cargando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>

          {/* Resultados por Docente */}
          {datosAsistencia && tipoAsistencia === 'docente' && datosAsistencia.estadisticas && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                    {datosAsistencia.estadisticas.total_clases}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Total Clases
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#dcfce7', border: '1px solid #86efac' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>
                    {datosAsistencia.estadisticas.presentes}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Presentes
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fef3c7', border: '1px solid #fde047' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>
                    {datosAsistencia.estadisticas.retrasados}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Retrasados
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#fee2e2', border: '1px solid #fca5a5' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#991b1b' }}>
                    {datosAsistencia.estadisticas.faltas}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Faltas
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem', textAlign: 'center', background: '#e0e7ff', border: '1px solid #a5b4fc' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4338ca' }}>
                    {datosAsistencia.estadisticas.porcentaje_asistencia}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    % Asistencia
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resultados por Grupo */}
          {datosAsistencia && tipoAsistencia === 'grupo' && datosAsistencia.por_docente && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Total</th>
                    <th>Presentes</th>
                    <th>Retrasados</th>
                    <th>Faltas</th>
                    <th>% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {datosAsistencia.por_docente.map((d, idx) => (
                    <tr key={idx}>
                      <td><strong>{d.docente}</strong></td>
                      <td>{d.total}</td>
                      <td><span className="badge badge--success">{d.presentes}</span></td>
                      <td><span className="badge badge--warning">{d.retrasados}</span></td>
                      <td><span className="badge badge--danger">{d.faltas}</span></td>
                      <td><strong style={{ color: d.porcentaje >= 80 ? '#166534' : '#991b1b' }}>{d.porcentaje}%</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!datosAsistencia && !loadingAsistencias && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Selecciona los filtros y haz clic en "Generar Reporte"
            </div>
          )}
        </div>
      </div>

      {/* Aulas Disponibles */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">
            <DoorOpen size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Consultar Aulas Disponibles
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn--primary btn--sm"
              onClick={exportarAulasPDF}
              disabled={aulasDisponibles.length === 0}
            >
              <FileText size={16} />
              PDF
            </button>
            <button 
              className="btn btn--primary btn--sm"
              onClick={exportarAulasExcel}
              disabled={aulasDisponibles.length === 0}
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
          </div>
        </div>

        <div className="card__body">
          {/* Filtros */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input 
                type="date"
                className="form-input"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horario</label>
              <select 
                className="form-input"
                value={horarioId}
                onChange={(e) => setHorarioId(e.target.value)}
              >
                <option value="">Seleccione</option>
                {horariosDisponibles.map(h => (
                  <option key={h.idhorario} value={h.idhorario}>
                    {h.hora_inicio} - {h.hora_fin}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn--primary"
                onClick={fetchAulasDisponibles}
                disabled={loadingAulas}
              >
                <Search size={16} />
                {loadingAulas ? 'Consultando...' : 'Consultar'}
              </button>
            </div>
          </div>

          {/* Tabla de Aulas */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Capacidad</th>
                  <th>Tipo</th>
                  <th>Edificio</th>
                </tr>
              </thead>
              <tbody>
                {aulasDisponibles.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      {loadingAulas ? 'Consultando...' : 'Selecciona fecha y horario para consultar'}
                    </td>
                  </tr>
                ) : (
                  aulasDisponibles.map((aula) => (
                    <tr key={aula.id}>
                      <td><strong>{aula.codigo}</strong></td>
                      <td>{aula.nombre}</td>
                      <td>{aula.capacidad} personas</td>
                      <td><span className="badge badge--info">{aula.tipo}</span></td>
                      <td>{aula.edificio}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {aulasDisponibles.length > 0 && (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Total de aulas disponibles: <strong>{aulasDisponibles.length}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}