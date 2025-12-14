import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, Calendar } from 'lucide-react';
import API_URL from '../config/api';

export default function Gestiones() {
  const [gestiones, setGestiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGestion, setEditingGestion] = useState(null);
  const [formData, setFormData] = useState({
    anio: new Date().getFullYear(),
    periodo: 1,
    fecha_inicio: '',
    fecha_fin: ''
  });

  useEffect(() => {
    fetchGestiones();
  }, []);

  const fetchGestiones = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/gestiones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setGestiones(data || []);
    } catch (error) {
      console.error('Error al cargar gestiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingGestion
        ? `${API_URL}/api/gestiones/${editingGestion.idgestion}`
        : `${API_URL}/api/gestiones`;

      const response = await fetch(url, {
        method: editingGestion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchGestiones();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar gestión:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta gestión?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/gestiones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchGestiones();
      }
    } catch (error) {
      console.error('Error al eliminar gestión:', error);
    }
  };

  const handleEdit = (gestion) => {
    setEditingGestion(gestion);
    setFormData({
      anio: gestion.anio,
      periodo: gestion.periodo,
      fecha_inicio: gestion.fecha_inicio,
      fecha_fin: gestion.fecha_fin
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGestion(null);
    setFormData({
      anio: new Date().getFullYear(),
      periodo: 1,
      fecha_inicio: '',
      fecha_fin: ''
    });
  };

  const filteredGestiones = gestiones.filter(gestion =>
    gestion.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Gestiones Académicas</h1>
          <p className="page-header__subtitle">Gestiona los períodos académicos</p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nueva Gestión
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar gestiones..."
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
                    <th>Gestión</th>
                    <th>Año</th>
                    <th>Período</th>
                    <th>Fecha Inicio</th>
                    <th>Fecha Fin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGestiones.map((gestion) => (
                    <tr key={gestion.idgestion}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} style={{ color: '#6366f1' }} />
                          <strong>{gestion.nombre_completo}</strong>
                        </div>
                      </td>
                      <td>{gestion.anio}</td>
                      <td>
                        <span className="badge badge--info">
                          {gestion.periodo === 1 ? 'Primer Semestre' : 'Segundo Semestre'}
                        </span>
                      </td>
                      <td>{gestion.fecha_inicio}</td>
                      <td>{gestion.fecha_fin}</td>
                      <td>
                        <div className="table__actions">
                          <button
                            className="btn btn--sm btn--ghost btn--icon"
                            onClick={() => handleEdit(gestion)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn--sm btn--danger btn--icon"
                            onClick={() => handleDelete(gestion.idgestion)}
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
                {editingGestion ? 'Editar Gestión' : 'Nueva Gestión'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Año *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: parseInt(e.target.value) })}
                    required
                    min={2000}
                    max={2100}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Período *</label>
                  <select
                    className="form-input"
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: parseInt(e.target.value) })}
                    required
                  >
                    <option value={1}>Primer Semestre</option>
                    <option value={2}>Segundo Semestre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Inicio *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fecha de Fin *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    required
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
                  {editingGestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
