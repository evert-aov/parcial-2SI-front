import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, GraduationCap, BookOpen, Calendar, Clock, DoorOpen } from 'lucide-react';
import API_URL from '../config/api';

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [gestiones, setGestiones] = useState([]);
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [asignacionToDelete, setAsignacionToDelete] = useState(null);
  const [editingAsignacion, setEditingAsignacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSlots, setSelectedSlots] = useState({}); // { "diaId-horarioId": aulaId }
  const [formData, setFormData] = useState({
    docente_id: '',
    materia_id: '',
    grupo_id: '',
    gestion_id: ''
  });

  useEffect(() => {
    fetchAsignaciones();
    fetchDocentes();
    fetchMaterias();
    fetchGrupos();
    fetchGestiones();
    fetchDias();
    fetchHorarios();
    fetchAulas();
  }, []);

  const fetchAsignaciones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/asignaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAsignaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocentes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/docentes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDocentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar docentes:', error);
    }
  };

  const fetchMaterias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/materias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMaterias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const fetchGrupos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/grupos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    }
  };

  const fetchGestiones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/gestiones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setGestiones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar gestiones:', error);
    }
  };

  const fetchDias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/dias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar días:', error);
    }
  };

  const fetchHorarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/horarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHorarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    }
  };

  const fetchAulas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/aulas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAulas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar aulas:', error);
    }
  };

  const toggleSlot = (diaId, horarioId) => {
    const key = `${diaId}-${horarioId}`;
    setSelectedSlots(prev => {
      const newSlots = { ...prev };
      if (newSlots[key]) {
        delete newSlots[key];
      } else {
        newSlots[key] = ''; // Inicializar sin aula seleccionada
      }
      return newSlots;
    });
  };

  const setAulaForSlot = (diaId, horarioId, aulaId) => {
    const key = `${diaId}-${horarioId}`;
    setSelectedSlots(prev => ({
      ...prev,
      [key]: aulaId
    }));
  };

  const isSlotSelected = (diaId, horarioId) => {
    const key = `${diaId}-${horarioId}`;
    return key in selectedSlots;
  };

  const getAulaForSlot = (diaId, horarioId) => {
    const key = `${diaId}-${horarioId}`;
    return selectedSlots[key] || '';
  };

  const handleEdit = async (asignacion) => {
    setEditingAsignacion(asignacion);
    setFormData({
      docente_id: asignacion.docente_id,
      materia_id: asignacion.materia_id,
      grupo_id: asignacion.grupo_id,
      gestion_id: asignacion.gestion_id
    });

    // Cargar horarios de la asignación
    const slots = {};
    if (asignacion.horarios && Array.isArray(asignacion.horarios)) {
      asignacion.horarios.forEach(diaHorarios => {
        diaHorarios.horarios.forEach(h => {
          const key = `${diaHorarios.dia_id}-${h.horario_id}`;
          slots[key] = h.aula_id || '';
        });
      });
    }
    setSelectedSlots(slots);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const slotKeys = Object.keys(selectedSlots);
    if (slotKeys.length === 0) {
      alert('Debe seleccionar al menos un horario');
      return;
    }

    // Validar que todos los slots tengan aula asignada
    const slotsWithoutAula = slotKeys.filter(key => !selectedSlots[key]);
    if (slotsWithoutAula.length > 0) {
      alert('Debe seleccionar un aula para cada horario marcado');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Convertir selectedSlots a formato esperado por el backend
      const horariosArray = slotKeys.map(key => {
        const [dia_id, horario_id] = key.split('-');
        return {
          dia_id: parseInt(dia_id),
          horario_id: parseInt(horario_id),
          aula_id: parseInt(selectedSlots[key])
        };
      });

      const url = editingAsignacion
        ? `${API_URL}/api/asignaciones/${editingAsignacion.idasignacion}`
        : `${API_URL}/api/asignaciones`;

      const response = await fetch(url, {
        method: editingAsignacion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          horarios: horariosArray
        })
      });

      if (response.ok) {
        fetchAsignaciones();
        handleCloseModal();
        alert(editingAsignacion ? 'Asignación actualizada correctamente' : 'Asignación creada correctamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo guardar la asignación'}`);
      }
    } catch (error) {
      console.error('Error al guardar asignación:', error);
      alert('Error al guardar asignación');
    }
  };

  const confirmDelete = (asignacion) => {
    setAsignacionToDelete(asignacion);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!asignacionToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/asignaciones/${asignacionToDelete.idasignacion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAsignaciones();
        setShowDeleteModal(false);
        setAsignacionToDelete(null);
        alert('Asignación eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      alert('Error al eliminar asignación');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsignacion(null);
    setSelectedSlots({});
    setFormData({
      docente_id: '',
      materia_id: '',
      grupo_id: '',
      gestion_id: ''
    });
  };

  const renderHorarios = (horariosData) => {
    if (!horariosData || horariosData.length === 0) {
      return <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Sin horarios</span>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {horariosData.map((diaHorarios, idx) => (
          <div key={idx} style={{ fontSize: '0.875rem' }}>
            <strong style={{ color: '#6366f1' }}>{diaHorarios.dia_abreviatura}:</strong>{' '}
            {diaHorarios.horarios.map((h, i) => (
              <div key={i} style={{ marginLeft: '0.5rem', marginTop: '0.25rem' }}>
                <span className="badge badge--secondary" style={{ fontSize: '0.75rem' }}>
                  {h.rango}
                </span>
                {h.aula_codigo && (
                  <span className="badge badge--info" style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>
                    <DoorOpen size={12} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                    {h.aula_codigo}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const filteredAsignaciones = asignaciones.filter(asignacion =>
    asignacion.docente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.materia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asignacion.materia_sigla?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Asignaciones</h1>
          <p className="page-header__subtitle">Asigna materias a los docentes</p>
        </div>
        <div className="page-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nueva Asignación
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Lista de Asignaciones</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar asignaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card__body">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Cargando...</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Docente</th>
                    <th>Materia</th>
                    <th>Grupo</th>
                    <th>Gestión</th>
                    <th>Horarios y Aulas</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAsignaciones.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron asignaciones
                      </td>
                    </tr>
                  ) : (
                    filteredAsignaciones.map((asignacion) => (
                      <tr key={asignacion.idasignacion}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <GraduationCap size={16} />
                            </div>
                            <span style={{ fontWeight: '500' }}>{asignacion.docente}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="badge badge--info">{asignacion.materia_sigla}</span>
                            <span>{asignacion.materia_nombre}</span>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge--secondary">{asignacion.grupo}</span>
                        </td>
                        <td>
                          <span className="badge badge--success">{asignacion.gestion}</span>
                        </td>
                        <td>
                          {renderHorarios(asignacion.horarios)}
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              className="btn btn--sm btn--ghost btn--icon"
                              onClick={() => handleEdit(asignacion)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--danger btn--icon"
                              onClick={() => confirmDelete(asignacion)}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px' }}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editingAsignacion ? 'Editar Asignación' : 'Nueva Asignación'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">
                    <GraduationCap size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Docente *
                  </label>
                  <select
                    className="form-input"
                    value={formData.docente_id}
                    onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un docente</option>
                    {docentes.map((docente) => (
                      <option key={docente.coddocente} value={docente.coddocente}>
                        {docente.nombre} {docente.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <BookOpen size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Materia *
                  </label>
                  <select
                    className="form-input"
                    value={formData.materia_id}
                    onChange={(e) => setFormData({ ...formData, materia_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {materias.map((materia) => (
                      <option key={materia.idmateria} value={materia.idmateria}>
                        {materia.sigla} - {materia.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grupo *</label>
                  <select
                    className="form-input"
                    value={formData.grupo_id}
                    onChange={(e) => setFormData({ ...formData, grupo_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un grupo</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.idgrupo} value={grupo.idgrupo}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Gestión *
                  </label>
                  <select
                    className="form-input"
                    value={formData.gestion_id}
                    onChange={(e) => setFormData({ ...formData, gestion_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona una gestión</option>
                    {gestiones.map((gestion) => (
                      <option key={gestion.idgestion} value={gestion.idgestion}>
                        {gestion.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Horarios y Aulas * (Selecciona días, horas y aulas)
                  </label>
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '1rem',
                    background: '#f8fafc',
                    overflowX: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '2px solid #cbd5e1', minWidth: '120px' }}>
                            Horario
                          </th>
                          {dias.map(dia => (
                            <th key={dia.iddia} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '2px solid #cbd5e1', minWidth: '140px' }}>
                              {dia.abreviatura}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {horarios.map(horario => (
                          <tr key={horario.idhorario}>
                            <td style={{ padding: '0.5rem', fontSize: '0.875rem', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>
                              {horario.rango}
                            </td>
                            {dias.map(dia => (
                              <td key={dia.iddia} style={{ padding: '0.5rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={isSlotSelected(dia.iddia, horario.idhorario)}
                                    onChange={() => toggleSlot(dia.iddia, horario.idhorario)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                  {isSlotSelected(dia.iddia, horario.idhorario) && (
                                    <select
                                      className="form-input"
                                      value={getAulaForSlot(dia.iddia, horario.idhorario)}
                                      onChange={(e) => setAulaForSlot(dia.iddia, horario.idhorario, e.target.value)}
                                      required
                                      style={{ fontSize: '0.75rem', padding: '0.25rem', width: '100%' }}
                                    >
                                      <option value="">Aula</option>
                                      {aulas.map(aula => (
                                        <option key={aula.idaula} value={aula.idaula}>
                                          {aula.codigo}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                      Seleccionados: {Object.keys(selectedSlots).length} horario(s)
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal__footer">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary">
                  {editingAsignacion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal__header">
              <h2 className="modal__title">Confirmar eliminación</h2>
              <button className="modal__close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal__body">
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ 
                  display: 'inline-flex',
                  padding: '1rem',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  marginBottom: '1rem'
                }}>
                  <AlertTriangle size={24} color="#dc2626" />
                </div>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#0f172a' }}>
                  ¿Estás seguro de eliminar esta asignación?
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {asignacionToDelete?.docente} - {asignacionToDelete?.materia_nombre}
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
