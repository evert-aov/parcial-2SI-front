import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, Settings } from 'lucide-react';

import API_URL from '../config/api';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForPermisos, setRoleForPermisos] = useState(null);
  const [selectedPermisos, setSelectedPermisos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    fetchRoles();
    fetchPermisos();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRoles(data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermisos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/permisos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPermisos(data || []);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };

  const openPermisosModal = async (role) => {
    setRoleForPermisos(role);
    setShowPermisosModal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/roles/${role.idrol}/permisos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSelectedPermisos(data.map(p => p.idpermiso));
    } catch (error) {
      console.error('Error al cargar permisos del rol:', error);
      setSelectedPermisos([]);
    }
  };

  const closePermisosModal = () => {
    setShowPermisosModal(false);
    setRoleForPermisos(null);
    setSelectedPermisos([]);
  };

  const togglePermiso = (idpermiso) => {
    setSelectedPermisos(prev => {
      if (prev.includes(idpermiso)) {
        return prev.filter(id => id !== idpermiso);
      } else {
        return [...prev, idpermiso];
      }
    });
  };

  const handleSavePermisos = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/roles/${roleForPermisos.idrol}/permisos`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permisos: selectedPermisos })
      });
      closePermisosModal();
      alert('Permisos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      alert('Error al actualizar permisos');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingRole
        ? `${API_URL}/api/roles/${editingRole.idrol}`
        : `${API_URL}/api/roles`;

      const response = await fetch(url, {
        method: editingRole ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchRoles();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar rol:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este rol?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/roles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchRoles();
      }
    } catch (error) {
      console.error('Error al eliminar rol:', error);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({ nombre: role.nombre });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({ nombre: '' });
  };

  const filteredRoles = roles.filter(role =>
    role.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (nombre) => {
    if (!nombre) return 'badge--secondary';
    const nombreLower = nombre.toLowerCase();
    if (nombreLower.includes('docente')) return 'badge--info';
    if (nombreLower.includes('administrador')) return 'badge--warning';
    return 'badge--secondary';
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Roles</h1>
          <p className="page-header__subtitle">Gestiona los roles del sistema</p>
        </div>
        <div className="page-header__actions">
          <button
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nuevo Rol
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar roles..."
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
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.idrol}>
                      <td>{role.idrol}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(role.nombre)}`}>
                          {role.nombre}
                        </span>
                      </td>
                      <td>
                        <div className="table__actions">
                          <button
                            className="btn btn--sm btn--secondary btn--icon"
                            onClick={() => openPermisosModal(role)}
                            title="Gestionar Permisos"
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            className="btn btn--sm btn--ghost btn--icon"
                            onClick={() => handleEdit(role)}
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn--sm btn--danger btn--icon"
                            onClick={() => handleDelete(role.idrol)}
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
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Nombre del Rol *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ nombre: e.target.value })}
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
                  {editingRole ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPermisosModal && roleForPermisos && (
        <div className="modal-overlay" onClick={closePermisosModal}>
          <div className="modal modal--large" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">
                Permisos de {roleForPermisos.nombre}
              </h2>
              <button className="modal__close" onClick={closePermisosModal}>
                <X size={20} />
              </button>
            </div>

            <div className="modal__body">
              <div className="permisos-grid">
                {permisos.map((permiso) => (
                  <div
                    key={permiso.idpermiso}
                    className={`permiso-card ${selectedPermisos.includes(permiso.idpermiso) ? 'permiso-card--selected' : ''}`}
                    onClick={() => togglePermiso(permiso.idpermiso)}
                  >
                    <div className="permiso-card__checkbox">
                      <input
                        type="checkbox"
                        checked={selectedPermisos.includes(permiso.idpermiso)}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="permiso-card__content">
                      <div className="permiso-card__title">{permiso.nombre}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={closePermisosModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSavePermisos}
              >
                Guardar ({selectedPermisos.length} seleccionados)
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
