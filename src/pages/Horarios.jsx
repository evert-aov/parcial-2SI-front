import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, Clock } from 'lucide-react';
import API_URL from '../config/api';

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState(null);
  const [formData, setFormData] = useState({
    hora_inicio: '',
    hora_fin: '',
    nombre: ''
  });

  useEffect(() => {
    fetchHorarios();
  }, []);

  const fetchHorarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/horarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHorarios(data || []);
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que hora_fin sea después de hora_inicio
    if (formData.hora_inicio && formData.hora_fin && formData.hora_inicio >= formData.hora_fin) {
      alert('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingHorario
        ? `${API_URL}/api/horarios/${editingHorario.idhorario}`
        : `${API_URL}/api/horarios`;

      const response = await fetch(url, {
        method: editingHorario ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchHorarios();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar horario:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este horario?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/horarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchHorarios();
      }
    } catch (error) {
      console.error('Error al eliminar horario:', error);
    }
  };

  const handleEdit = (horario) => {
    setEditingHorario(horario);
    setFormData({
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      nombre: horario.nombre || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHorario(null);
    setFormData({ hora_inicio: '', hora_fin: '', nombre: '' });
  };

  const filteredHorarios = horarios.filter(horario =>
    horario.rango?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    horario.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Horarios</h1>
          <p className="page-header__subtitle">Gestiona los bloques horarios disponibles</p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nuevo Horario
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar horarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="card__body">
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rango Horario</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHorarios.map((horario) => (
                    <tr key={horario.idhorario}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} style={{ color: '#6366f1' }} />
                          <strong>{horario.rango}</strong>
                        </div>
                      </td>
                      <td>{horario.hora_inicio}</td>
                      <td>{horario.hora_fin}</td>
                      <td>
                        {horario.nombre ? (
                          <span className="badge badge--info">{horario.nombre}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        <div className="table__actions">
                          <button
                            className="btn btn--sm btn--ghost btn--icon"
                            onClick={() => handleEdit(horario)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn--sm btn--danger btn--icon"
                            onClick={() => handleDelete(horario.idhorario)}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
                {editingHorario ? 'Editar Horario' : 'Nuevo Horario'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Hora de Inicio *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora de Fin *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Primera hora"
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
                  {editingHorario ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
