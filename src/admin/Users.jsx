import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const users = Array(10).fill({
  email: 'example@gmail.com',
  role: 'Admin',
  status: 'Active'
});

export default function UserManagement() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Dashboard</h2>
        <nav className="admin-nav">
          <button className="admin-nav-link active">User Management</button>
          <button className="admin-nav-link" onClick={() => navigate('/adminfurniture')}>Furniture management</button>
          <button className="admin-nav-link" onClick={() => navigate('/admindesigns')}>Design management</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate('/adminlogin')}>Logout</button>
      </aside>
      <main className="admin-main-content">
        <div className="admin-main-header">
          <h2 className="admin-main-title">User Management</h2>
          <button className="admin-add-user-btn">Add new user</button>
        </div>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="admin-search-icon">🔍</span>
          </div>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th>Username/email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="user-row">
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`status-indicator status-${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <button className="admin-edit-btn">Edit</button>
                    <button className="admin-delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
