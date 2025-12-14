import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, DoorOpen } from 'lucide-react';
import API_URL from '../config/api';

export default function Aulas() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [aulaToDelete, setAulaToDelete] = useState(null);
  const [editingAula, setEditingAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    capacidad: '',
    tipo: 'Aula',
    edificio: '',
    activo: true
  });

  useEffect(() => {
    fetchAulas();
  }, []);

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
      setAulas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (aula) => {
    setEditingAula(aula);
    setFormData({
      nombre: aula.nombre,
      codigo: aula.codigo,
      capacidad: aula.capacidad || '',
      tipo: aula.tipo || 'Aula',
      edificio: aula.edificio || '',
      activo: aula.activo
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingAula
        ? `${API_URL}/api/aulas/${editingAula.idaula}`
        : `${API_URL}/api/aulas`;

      const response = await fetch(url, {
        method: editingAula ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchAulas();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo guardar el aula'}`);
      }
    } catch (error) {
      console.error('Error al guardar aula:', error);
      alert('Error al guardar aula');
    }
  };

  const confirmDelete = (aula) => {
    setAulaToDelete(aula);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!aulaToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/aulas/${aulaToDelete.idaula}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchAulas();
        setShowDeleteModal(false);
        setAulaToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar aula:', error);
      alert('Error al eliminar aula');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAula(null);
    setFormData({
      nombre: '',
      codigo: '',
      capacidad: '',
      tipo: 'Aula',
      edificio: '',
      activo: true
    });
  };

  const filteredAulas = aulas.filter(aula =>
    aula.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aula.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (aula.edificio && aula.edificio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Aulas</h1>
          <p className="page-header__subtitle">Gestiona las aulas y espacios académicos</p>
        </div>
        <div className="page-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nueva Aula
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Lista de Aulas</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar aulas..."
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
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Capacidad</th>
                    <th>Tipo</th>
                    <th>Edificio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAulas.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron aulas
                      </td>
                    </tr>
                  ) : (
                    filteredAulas.map((aula) => (
                      <tr key={aula.idaula}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <DoorOpen size={16} color="#6366f1" />
                            <strong>{aula.codigo}</strong>
                          </div>
                        </td>
                        <td>{aula.nombre}</td>
                        <td>
                          {aula.capacidad ? (
                            <span className="badge badge--secondary">{aula.capacidad} personas</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${
                            aula.tipo === 'Laboratorio' ? 'badge--info' :
                            aula.tipo === 'Auditorio' ? 'badge--warning' :
                            'badge--secondary'
                          }`}>
                            {aula.tipo || 'Aula'}
                          </span>
                        </td>
                        <td>{aula.edificio || '-'}</td>
                        <td>
                          <span className={`badge ${aula.activo ? 'badge--success' : 'badge--danger'}`}>
                            {aula.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              className="btn btn--sm btn--ghost btn--icon"
                              onClick={() => handleEdit(aula)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--danger btn--icon"
                              onClick={() => confirmDelete(aula)}
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
                {editingAula ? 'Editar Aula' : 'Nueva Aula'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Código *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej: A01, LAB-A"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Aula 1, Laboratorio de Computación"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacidad</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })}
                    placeholder="Número de personas"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-input"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="Aula">Aula</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Auditorio">Auditorio</option>
                    <option value="Sala de Conferencias">Sala de Conferencias</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Edificio</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.edificio}
                    onChange={(e) => setFormData({ ...formData, edificio: e.target.value })}
                    placeholder="Ej: Edificio A, Pabellón 1"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span>Aula activa</span>
                  </label>
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
                  {editingAula ? 'Actualizar' : 'Crear'}
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
                  ¿Estás seguro de eliminar esta aula?
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {aulaToDelete?.codigo} - {aulaToDelete?.nombre}
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
