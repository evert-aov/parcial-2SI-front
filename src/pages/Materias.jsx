import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, BookOpen } from 'lucide-react';

import API_URL from '../config/api';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [materiaToDelete, setMateriaToDelete] = useState(null);
  const [editingMateria, setEditingMateria] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    idcarrera: '',
    sigla: '',
    nombre: ''
  });

  useEffect(() => {
    fetchMaterias();
    fetchCarreras();
  }, []);

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
      setMaterias([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarreras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/carreras`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCarreras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
      setCarreras([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingMateria
        ? `${API_URL}/api/materias/${editingMateria.idcarrera}/${editingMateria.sigla}`
        : `${API_URL}/api/materias`;
      
      const method = editingMateria ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchMaterias();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar materia:', error);
    }
  };

  const handleEdit = (materia) => {
    setEditingMateria(materia);
    setFormData({
      idcarrera: materia.idcarrera || '',
      sigla: materia.sigla || '',
      nombre: materia.nombre || ''
    });
    setShowModal(true);
  };

  const confirmDelete = (materia) => {
    setMateriaToDelete(materia);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!materiaToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/materias/${materiaToDelete.idcarrera}/${materiaToDelete.sigla}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchMaterias();
        setShowDeleteModal(false);
        setMateriaToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar materia:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMateria(null);
    setFormData({
      idcarrera: '',
      sigla: '',
      nombre: ''
    });
  };

  const filteredMaterias = materias.filter(materia =>
    materia.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    materia.sigla?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Materias</h1>
          <p className="page-header__subtitle">Gestiona las materias del sistema</p>
        </div>
        <div className="page-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nueva Materia
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Lista de Materias</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buscar materias..."
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
                    <th>Carrera</th>
                    <th>Sigla</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterias.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No se encontraron materias
                      </td>
                    </tr>
                  ) : (
                    filteredMaterias.map((materia) => (
                      <tr key={`${materia.idcarrera}-${materia.sigla}`}>
                        <td>
                          <span className="badge badge--secondary">{materia.idcarrera}</span>
                        </td>
                        <td>
                          <span className="badge badge--info">{materia.sigla}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}>
                              <BookOpen size={16} />
                            </div>
                            <span style={{ fontWeight: '500' }}>{materia.nombre}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              className="btn btn--sm btn--secondary btn--icon"
                              onClick={() => handleEdit(materia)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--danger btn--icon"
                              onClick={() => confirmDelete(materia)}
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
                {editingMateria ? 'Editar Materia' : 'Nueva Materia'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Carrera *</label>
                  <select
                    className="form-select"
                    value={formData.idcarrera}
                    onChange={(e) => setFormData({ ...formData, idcarrera: e.target.value })}
                    required
                    disabled={editingMateria}
                  >
                    <option value="">Seleccionar carrera</option>
                    {carreras.map((carrera) => (
                      <option key={carrera.idcarrera} value={carrera.idcarrera}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                  {editingMateria && (
                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      No se puede modificar la carrera
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Sigla *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sigla}
                    onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                    required
                    disabled={editingMateria}
                    placeholder="Ej: MAT-101"
                  />
                  {editingMateria && (
                    <small style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      No se puede modificar la sigla
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="Ej: Matemáticas I"
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
                  {editingMateria ? 'Actualizar' : 'Crear'}
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
                  ¿Estás seguro de eliminar esta materia?
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {materiaToDelete?.nombre}
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
