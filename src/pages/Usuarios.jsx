import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, Eye, GraduationCap, Briefcase } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);
  const [usuarioDetail, setUsuarioDetail] = useState(null);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    idrol: '',
    ci: '',
    telefono: '',
    sexo: '',
    direccion: '',
    especialidad: '',
    fecha_contrato: ''
  });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
       const token = localStorage.getItem('token');
      
      const [docentesRes, adminsRes] = await Promise.all([
        fetch(`${API_URL}/api/docentes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/administradores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const docentes = await docentesRes.json();
      const admins = await adminsRes.json();

      const allUsers = [
        ...(Array.isArray(docentes) ? docentes : []).map(d => ({
          ...d,
          tipo: 'docente',
          idusuario: d.coddocente
        })),
        ...(Array.isArray(admins) ? admins : []).map(a => ({
          ...a,
          tipo: 'administrador',
          idusuario: a.codadministrador
        }))
      ];

      setUsuarios(allUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const role = roles.find(r => r.idrol === parseInt(formData.idrol));
      const isDocente = role?.nombre?.toLowerCase() === 'docente';
      const endpoint = isDocente ? 'docentes' : 'administradores';
      
      const url = editingUsuario 
        ? `${API_URL}/api/${endpoint}/${editingUsuario.idusuario}`
        : `${API_URL}/api/${endpoint}`;
      
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        ci: formData.ci,
        telefono: formData.telefono || null,
        sexo: formData.sexo || null,
        direccion: formData.direccion || null
      };

      if (formData.contrasena) {
        payload.contrasena = formData.contrasena;
      }

      if (isDocente) {
        payload.especialidad = formData.especialidad || null;
        payload.fecha_contrato = formData.fecha_contrato || new Date().toISOString().split('T')[0];
      } else {
        // Para administradores, también usar fecha_contrato (sin guión bajo)
        payload.fecha_contrato = formData.fecha_contrato || new Date().toISOString().split('T')[0];
      }

      const response = await fetch(url, {
        method: editingUsuario ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchUsuarios();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const confirmDelete = (usuario) => {
    setUsuarioToDelete(usuario);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!usuarioToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = usuarioToDelete.tipo === 'docente' ? 'docentes' : 'administradores';
      
      const response = await fetch(`${API_URL}/api/${endpoint}/${usuarioToDelete.idusuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchUsuarios();
        setShowDeleteModal(false);
        setUsuarioToDelete(null);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      correo: usuario.correo || '',
      contrasena: '',
      idrol: usuario.idrol || '',
      ci: usuario.ci || '',
      telefono: usuario.telefono || '',
      sexo: usuario.sexo || '',
      direccion: usuario.direccion || '',
      especialidad: usuario.especialidad || '',
      fecha_contrato: usuario.fecha_contrato || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUsuario(null);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      idrol: '',
      ci: '',
      telefono: '',
      sexo: '',
      direccion: '',
      especialidad: '',
      fecha_contrato: ''
    });
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.ci?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || usuario.idrol === parseInt(filterRole);
    
    return matchesSearch && matchesRole;
  });

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleBadgeClass = (rol) => {
    if (!rol) return 'badge--secondary';
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('docente')) return 'badge--info';
    if (rolLower.includes('administrador')) return 'badge--warning';
    return 'badge--secondary';
  };

  const handleViewDetail = (usuario) => {
    setUsuarioDetail(usuario);
    setShowDetailModal(true);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Usuarios</h1>
          <p className="page-header__subtitle">Gestiona docentes y administradores</p>
        </div>
        <div className="page-header__actions">
          <button 
            className="btn btn--primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Lista de Usuarios</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="search-box" style={{ width: '280px' }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Todos los roles</option>
              {roles.map(role => (
                <option key={role.idrol} value={role.idrol}>{role.nombre}</option>
              ))}
            </select>
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
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>CI</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No hay usuarios registrados
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <tr key={`${usuario.tipo}-${usuario.idusuario}`}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="table__avatar">
                              {getInitials(usuario.nombre, usuario.apellido)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>
                                {usuario.nombre} {usuario.apellido}
                              </div>
                              {usuario.sexo && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {usuario.sexo === 'M' ? 'Masculino' : usuario.sexo === 'F' ? 'Femenino' : usuario.sexo}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{usuario.correo || '-'}</td>
                        <td>{usuario.ci || '-'}</td>
                        <td>{usuario.telefono || '-'}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(usuario.rol)}`}>
                            {usuario.rol}
                          </span>
                        </td>
                        <td>
                          <div className="table__actions">
                            <button
                              className="btn btn--sm btn--secondary btn--icon"
                              onClick={() => handleViewDetail(usuario)}
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--ghost btn--icon"
                              onClick={() => handleEdit(usuario)}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn--sm btn--danger btn--icon"
                              onClick={() => confirmDelete(usuario)}
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
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button className="modal__close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal__body">
                <div className="form-group">
                  <label className="form-label">Tipo de Usuario *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                      type="button"
                      className={`user-type-btn ${formData.idrol === '1' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, idrol: '1' })}
                    >
                      <div className="user-type-icon">
                        <GraduationCap size={24} />
                      </div>
                      <div className="user-type-label">Docente</div>
                    </button>
                    <button
                      type="button"
                      className={`user-type-btn ${formData.idrol === '2' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, idrol: '2' })}
                    >
                      <div className="user-type-icon">
                        <Briefcase size={24} />
                      </div>
                      <div className="user-type-label">Administrador</div>
                    </button>
                  </div>
                </div>

                {formData.idrol && (
                  <>
                    <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Información Personal
                      </h3>
                      <div style={{ height: '1px', background: '#e5e7eb', marginTop: '0.5rem' }}></div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nombre *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          placeholder="Ingrese el nombre"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Apellido *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          required
                          placeholder="Ingrese el apellido"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">CI *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.ci}
                          onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                          required
                          placeholder="Ej: 12345678"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Sexo</label>
                        <select
                          className="form-select"
                          value={formData.sexo}
                          onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                        >
                          <option value="">Seleccione</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Información de Contacto
                      </h3>
                      <div style={{ height: '1px', background: '#e5e7eb', marginTop: '0.5rem' }}></div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.correo}
                          onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                          required
                          placeholder="correo@ejemplo.com"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="Ej: 77123456"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dirección</label>
                      <textarea
                        className="form-textarea"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        rows="2"
                        placeholder="Ingrese la dirección completa"
                      />
                    </div>

                    <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Información de Acceso
                      </h3>
                      <div style={{ height: '1px', background: '#e5e7eb', marginTop: '0.5rem' }}></div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Contraseña {editingUsuario ? '(dejar en blanco para no cambiar)' : '*'}
                      </label>
                      <input
                        type="password"
                        className="form-input"
                        value={formData.contrasena}
                        onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                        required={!editingUsuario}
                        placeholder="Ingrese una contraseña segura"
                      />
                    </div>

                    {formData.idrol === '1' && (
                      <>
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Información del Docente
                          </h3>
                          <div style={{ height: '1px', background: '#e5e7eb', marginTop: '0.5rem' }}></div>
                        </div>

                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Especialidad</label>
                            <input
                              type="text"
                              className="form-input"
                              value={formData.especialidad}
                              onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                              placeholder="Ej: Matemáticas"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Fecha de Contrato {!editingUsuario && '*'}</label>
                            <input
                              type="date"
                              className="form-input"
                              value={formData.fecha_contrato}
                              onChange={(e) => setFormData({ ...formData, fecha_contrato: e.target.value })}
                              required={!editingUsuario}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {formData.idrol === '2' && (
                      <>
                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Información del Administrador
                          </h3>
                          <div style={{ height: '1px', background: '#e5e7eb', marginTop: '0.5rem' }}></div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Fecha de Contrato {!editingUsuario && '*'}</label>
                          <input
                            type="date"
                            className="form-input"
                            value={formData.fecha_contrato}
                            onChange={(e) => setFormData({ ...formData, fecha_contrato: e.target.value })}
                            required={!editingUsuario}
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
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
                  {editingUsuario ? 'Actualizar' : 'Crear'}
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
                  width: '64px', 
                  height: '64px', 
                  background: '#fee2e2', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <AlertTriangle size={32} color="#dc2626" />
                </div>
                <p style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                  ¿Está seguro de eliminar a <strong>{usuarioToDelete?.nombre} {usuarioToDelete?.apellido}</strong>?
                </p>
                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
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

      {showDetailModal && usuarioDetail && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal__header">
              <h2 className="modal__title">Detalles del Usuario</h2>
              <button className="modal__close" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  <div className="table__avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    {getInitials(usuarioDetail.nombre, usuarioDetail.apellido)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                      {usuarioDetail.nombre} {usuarioDetail.apellido}
                    </h3>
                    <span className={`badge ${getRoleBadgeClass(usuarioDetail.rol)}`}>
                      {usuarioDetail.rol}
                    </span>
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Email
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {usuarioDetail.correo || '-'}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      CI
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {usuarioDetail.ci || '-'}
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Teléfono
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {usuarioDetail.telefono || '-'}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Sexo
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {usuarioDetail.sexo === 'M' ? 'Masculino' : usuarioDetail.sexo === 'F' ? 'Femenino' : '-'}
                    </p>
                  </div>
                </div>

                {usuarioDetail.direccion && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Dirección
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {usuarioDetail.direccion}
                    </p>
                  </div>
                )}

                {usuarioDetail.tipo === 'docente' && (
                  <>
                    {usuarioDetail.especialidad && (
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                          Especialidad
                        </label>
                        <p style={{ color: '#0f172a', fontWeight: '500' }}>
                          {usuarioDetail.especialidad}
                        </p>
                      </div>
                    )}
                    
                    {usuarioDetail.fecha_contrato && (
                      <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                          Fecha de Contrato
                        </label>
                        <p style={{ color: '#0f172a', fontWeight: '500' }}>
                          {new Date(usuarioDetail.fecha_contrato).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {usuarioDetail.tipo === 'administrador' && usuarioDetail.fecha_contrato && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Fecha de Contrato
                    </label>
                    <p style={{ color: '#0f172a', fontWeight: '500' }}>
                      {new Date(usuarioDetail.fecha_contrato).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}

                {usuarioDetail.activo !== undefined && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Estado
                    </label>
                    <span className={`badge ${usuarioDetail.activo ? 'badge--success' : 'badge--danger'}`}>
                      {usuarioDetail.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal__footer">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
