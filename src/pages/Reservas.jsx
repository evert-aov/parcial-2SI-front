import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, DoorOpen, Calendar, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import API_URL from '../config/api';

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservaToDelete, setReservaToDelete] = useState(null);
  const [editingReserva, setEditingReserva] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    aula_id: '',
    tipo: 'Reunión',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    asistentes_estimados: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchReservas();
    fetchAulas();
  }, []);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reservas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      setReservas([]);
    } finally {
      setLoading(false);
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

  const handleEdit = (reserva) => {
    setEditingReserva(reserva);
    setFormData({
      titulo: reserva.titulo,
      aula_id: reserva.aula_id,
      tipo: reserva.tipo,
      fecha: reserva.fecha,
      hora_inicio: reserva.hora_inicio,
      hora_fin: reserva.hora_fin,
      asistentes_estimados: reserva.asistentes_estimados || '',
      descripcion: reserva.descripcion || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingReserva
        ? `${API_URL}/api/reservas/${editingReserva.idreserva}`
        : `${API_URL}/api/reservas`;

      const response = await fetch(url, {
        method: editingReserva ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchReservas();
        handleCloseModal();
        alert(editingReserva ? 'Reserva actualizada correctamente' : 'Reserva creada correctamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo guardar la reserva'}`);
      }
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      alert('Error al guardar reserva');
    }
  };

  const confirmDelete = (reserva) => {
    setReservaToDelete(reserva);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!reservaToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reservas/${reservaToDelete.idreserva}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReservas();
        setShowDeleteModal(false);
        setReservaToDelete(null);
        alert('Reserva eliminada correctamente');
      }
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      alert('Error al eliminar reserva');
    }
  };

  const handleAprobar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reservas/${id}/aprobar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReservas();
        alert('Reserva aprobada correctamente');
      }
    } catch (error) {
      console.error('Error al aprobar reserva:', error);
      alert('Error al aprobar reserva');
    }
  };

  const handleRechazar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reservas/${id}/rechazar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReservas();
        alert('Reserva rechazada correctamente');
      }
    } catch (error) {
      console.error('Error al rechazar reserva:', error);
      alert('Error al rechazar reserva');
    }
  };

  const handleCancelar = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/reservas/${id}/cancelar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReservas();
        alert('Reserva cancelada correctamente');
      }
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      alert('Error al cancelar reserva');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReserva(null);
    setFormData({
      titulo: '',
      aula_id: '',
      tipo: 'Reunión',
      fecha: '',
      hora_inicio: '',
      hora_fin: '',
      asistentes_estimados: '',
      descripcion: ''
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: { class: 'badge--warning', text: 'Pendiente' },
      aprobada: { class: 'badge--success', text: 'Aprobada' },
      rechazada: { class: 'badge--danger', text: 'Rechazada' },
      cancelada: { class: 'badge--secondary', text: 'Cancelada' }
    };
    const badge = badges[estado] || badges.pendiente;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const filteredReservas = reservas.filter(reserva =>
    reserva.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserva.aula_codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserva.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Reservas de Aulas</h1>
          <p className="page-header__subtitle">Gestiona las reservas de espacios académicos</p>
        </div>
        <div className="page-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nueva Reserva
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Lista de Reservas</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar reservas..."
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
                    <th>Título</th>
                    <th>Aula</th>
                    <th>Tipo</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Asistentes</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservas.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron reservas
                      </td>
                    </tr>
                  ) : (
                    filteredReservas.map((reserva) => (
                      <tr key={reserva.idreserva}>
                        <td><strong>{reserva.titulo}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DoorOpen size={16} color="#6366f1" />
                            <span>{reserva.aula_codigo}</span>
                          </div>
                        </td>
                        <td><span className="badge badge--info">{reserva.tipo}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={14} />
                            {reserva.fecha}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} />
                            {reserva.hora_inicio} - {reserva.hora_fin}
                          </div>
                        </td>
                        <td>{reserva.asistentes_estimados || '-'}</td>
                        <td>{getEstadoBadge(reserva.estado)}</td>
                        <td>
                          <div className="table__actions">
                            {reserva.estado === 'pendiente' && (
                              <>
                                <button
                                  className="btn btn--sm btn--success btn--icon"
                                  onClick={() => handleAprobar(reserva.idreserva)}
                                  title="Aprobar"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  className="btn btn--sm btn--danger btn--icon"
                                  onClick={() => handleRechazar(reserva.idreserva)}
                                  title="Rechazar"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {reserva.estado === 'aprobada' && (
                              <button
                                className="btn btn--sm btn--secondary btn--icon"
                                onClick={() => handleCancelar(reserva.idreserva)}
                                title="Cancelar"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            <button
                              className="btn btn--sm btn--ghost btn--icon"
                              onClick={() => handleEdit(reserva)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--danger btn--icon"
                              onClick={() => confirmDelete(reserva)}
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Reunión de Departamento"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Aula *</label>
                    <select
                      className="form-input"
                      value={formData.aula_id}
                      onChange={(e) => setFormData({ ...formData, aula_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccione</option>
                      {aulas.map(aula => (
                        <option key={aula.idaula} value={aula.idaula}>
                          {aula.codigo} - {aula.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-input"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      required
                    >
                      <option value="Reunión">Reunión</option>
                      <option value="Evento">Evento</option>
                      <option value="Examen">Examen</option>
                      <option value="Conferencia">Conferencia</option>
                      <option value="Taller">Taller</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Hora Inicio *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.hora_inicio}
                      onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hora Fin *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.hora_fin}
                      onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Asistentes Estimados</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.asistentes_estimados}
                    onChange={(e) => setFormData({ ...formData, asistentes_estimados: e.target.value })}
                    placeholder="Número de personas"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Detalles adicionales sobre la reserva"
                    rows="3"
                  />
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
                  {editingReserva ? 'Actualizar' : 'Guardar'}
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
                  ¿Estás seguro de eliminar esta reserva?
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {reservaToDelete?.titulo}
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
