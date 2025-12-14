import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import API_URL from '../config/api';

export default function Dias() {
  const [dias, setDias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDia, setEditingDia] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    orden: 1
  });

  useEffect(() => {
    fetchDias();
  }, []);

  const fetchDias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/dias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDias(data || []);
    } catch (error) {
      console.error('Error al cargar días:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDia
        ? `${API_URL}/api/dias/${editingDia.iddia}`
        : `${API_URL}/api/dias`;

      const response = await fetch(url, {
        method: editingDia ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchDias();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar día:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este día?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/dias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDias();
      }
    } catch (error) {
      console.error('Error al eliminar día:', error);
    }
  };

  const handleEdit = (dia) => {
    setEditingDia(dia);
    setFormData({
      nombre: dia.nombre,
      abreviatura: dia.abreviatura,
      orden: dia.orden
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDia(null);
    setFormData({ nombre: '', abreviatura: '', orden: 1 });
  };

  const filteredDias = dias.filter(dia =>
    dia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dia.abreviatura?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Días de la Semana</h1>
          <p className="page-header__subtitle">Gestiona los días disponibles para horarios</p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nuevo Día
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar días..."
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
                    <th>Orden</th>
                    <th>Nombre</th>
                    <th>Abreviatura</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDias.map((dia) => (
                    <tr key={dia.iddia}>
                      <td>
                        <span className="badge badge--info">{dia.orden}</span>
                      </td>
                      <td>{dia.nombre}</td>
                      <td>
                        <span className="badge badge--secondary">{dia.abreviatura}</span>
                      </td>
                      <td>
                        <div className="table__actions">
                          <button
                            className="btn btn--sm btn--ghost btn--icon"
                            onClick={() => handleEdit(dia)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn--sm btn--danger btn--icon"
                            onClick={() => handleDelete(dia.iddia)}
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
                {editingDia ? 'Editar Día' : 'Nuevo Día'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="Ej: Lunes"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Abreviatura *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.abreviatura}
                    onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value })}
                    required
                    maxLength={3}
                    placeholder="Ej: Lun"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Orden *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                    required
                    min={1}
                    max={7}
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
                  {editingDia ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
