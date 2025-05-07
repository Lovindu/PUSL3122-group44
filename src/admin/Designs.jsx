import { useNavigate } from 'react-router-dom';
import './Designs.css'; // Assuming you have a CSS file for styling

const designs = Array(4).fill({
  name: 'Room 1',
  designer: 'John',
  date: '2001/09/11'
});

export default function DesignManagement() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin dashboard</h2>
        <nav className="admin-nav">
          <button className="admin-nav-link" onClick={() => navigate('/admin/users')}>User Management</button>
          <button className="admin-nav-link" onClick={() => navigate('/admin/furniture')}>Furniture management</button>
          <button className="admin-nav-link active">Design management</button>
        </nav>
        <button className="admin-logout-btn" onClick={() => navigate('/admin-login')}>Logout</button>
      </aside>
      <main className="admin-main-content">
        <h2 className="admin-main-title">Design management</h2>
        <div className="admin-search-row">
          <div className="admin-search-container">
            <input
              className="admin-search-input"
              type="text"
              placeholder="Search"
            />
            <span className="admin-search-icon">🔍</span>
          </div>
        </div>
        <table className="design-table">
          <thead>
            <tr>
              <th>Design name</th>
              <th>Designer</th>
              <th>Date created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {designs.map((d, i) => (
              <tr key={i}>
                <td>{d.name}</td>
                <td>{d.designer}</td>
                <td>{d.date}</td>
                <td className="design-actions">
                  <button className="preview-btn">Preview</button>
                  <button className="admin-edit-btn">Edit</button>
                  <button className="admin-delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
